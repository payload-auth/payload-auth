import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, betterAuthPluginOptions } from "../../adapter/tests/dev";
import { getSetAdminRoleEndpoint } from "../lib/build-collections/users/endpoints/set-admin-role";

/**
 * Integration tests for the set-admin-role endpoint (P0-4 regression).
 * Verifies token is required, atomic consumption, and redirect validation.
 *
 * Calls the endpoint handler directly (bypassing HTTP routing) since these
 * are Payload collection endpoints, not Better Auth routes.
 *
 * Requires a running Postgres database.
 */
describe("Set Admin Role Endpoint (P0-4 Integration)", async () => {
  const payload = await getPayload();
  const endpoint = getSetAdminRoleEndpoint(betterAuthPluginOptions, "users");

  const testUser = {
    email: "set-role-test@test.com",
    password: "roletest123456",
    name: "Role Test User"
  };

  let sessionHeaders: Headers;

  /**
   * Helper to extract session cookie from Better Auth sign-in response.
   * Uses asResponse: true to get HTTP-level set-cookie headers with signed tokens.
   */
  async function getSessionCookieHeaders(email: string, password: string): Promise<Headers> {
    const response = await payload.betterAuth.api.signInEmail({
      body: { email, password },
      asResponse: true
    } as any) as unknown as Response;

    const headers = new Headers();
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      // Extract the signed session token from set-cookie header
      const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        headers.set("cookie", `better-auth.session_token=${match[1]}`);
      }
    }
    return headers;
  }

  /**
   * Helper to call the endpoint handler with a mock PayloadRequest.
   * The set-admin-role handler only uses req.payload, req.query, and req.headers.
   */
  function callHandler(query: Record<string, string>, headers?: Headers) {
    return endpoint.handler({
      payload,
      query,
      headers: headers ?? new Headers()
    } as any);
  }

  beforeAll(async () => {
    // Clean up
    await payload.delete({
      collection: "users",
      where: { email: { equals: testUser.email } }
    });
    await payload.delete({
      collection: "admin-invitations",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "sessions",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "accounts",
      where: { id: { exists: true } }
    });

    // Create test user
    await payload.betterAuth.api.signUpEmail({
      body: {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      }
    });

    // Get session cookies via HTTP response
    sessionHeaders = await getSessionCookieHeaders(
      testUser.email,
      testUser.password
    );
  });

  afterAll(async () => {
    await payload.delete({
      collection: "users",
      where: { email: { equals: testUser.email } }
    });
    await payload.delete({
      collection: "admin-invitations",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "sessions",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "accounts",
      where: { id: { exists: true } }
    });
  });

  it("rejects requests without a token (token is now required)", async () => {
    const response = await callHandler({}, sessionHeaders);

    // Should fail because token is now required (z.string() not z.string().optional())
    expect(response.status).toBe(400);
  });

  it("rejects unauthenticated requests", async () => {
    const response = await callHandler({ token: "some-token" });

    expect(response.status).toBe(401);
  });

  it("rejects invalid/nonexistent tokens", async () => {
    const response = await callHandler(
      { token: "nonexistent-token" },
      sessionHeaders
    );

    expect(response.status).toBe(401);
  });

  it("consumes token atomically - token cannot be reused", async () => {
    // Create a test invitation token
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/api/users/set-admin-role?token=${token}`
      }
    });

    // First use should succeed (307 redirect)
    const response1 = await callHandler({ token }, sessionHeaders);
    expect(response1.status).toBe(307);

    // Second use with same token should fail - token was deleted
    const response2 = await callHandler({ token }, sessionHeaders);
    expect(response2.status).toBe(401);

    // Verify the invitation was deleted from the database
    const invitations = await payload.find({
      collection: "admin-invitations",
      where: { token: { equals: token } }
    });
    expect(invitations.docs.length).toBe(0);
  });

  it("validates redirect is a relative path (prevents open redirect)", async () => {
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/api/users/set-admin-role?token=${token}`
      }
    });

    // Use an absolute external URL as redirect
    const response = await callHandler(
      { token, redirect: "https://evil.com" },
      sessionHeaders
    );

    // Should redirect to admin route, not to the external URL
    expect(response.status).toBe(307);
    const location = response.headers.get("Location");
    expect(location).not.toBe("https://evil.com");
    // Should default to admin route (which is /admin by default)
    expect(location).toBe("/admin");
  });

  it("allows valid relative redirect paths", async () => {
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/api/users/set-admin-role?token=${token}`
      }
    });

    const response = await callHandler(
      { token, redirect: "/dashboard" },
      sessionHeaders
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("/dashboard");
  });
});
