import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, betterAuthPluginOptions } from "../../adapter/tests/dev";
import { getGenerateInviteUrlEndpoint } from "../lib/build-collections/users/endpoints/generate-invite-url";
import { getSendInviteUrlEndpoint } from "../lib/build-collections/users/endpoints/send-invite-url";

/**
 * Integration tests for endpoint authentication (P0-3 regression).
 * Verifies that admin invite endpoints require authentication and admin role.
 *
 * Calls endpoint handlers directly to test auth guards.
 *
 * Requires a running Postgres database.
 */
describe("Endpoint Authentication (P0-3 Integration)", async () => {
  const payload = await getPayload();

  const roles = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" }
  ];

  const generateInviteEndpoint = getGenerateInviteUrlEndpoint({
    roles,
    pluginOptions: betterAuthPluginOptions
  });

  const sendInviteEndpoint = getSendInviteUrlEndpoint(betterAuthPluginOptions);

  const testUser = {
    email: "endpoint-auth-test@test.com",
    password: "authtest123",
    name: "Auth Test User"
  };

  let regularSessionHeaders: Headers;

  /**
   * Helper to create a mock PayloadRequest that extends a real Request object.
   * addDataAndFileToRequest needs a real Request for body parsing.
   */
  function createMockReq(
    options: {
      body?: any;
      user?: any;
      headers?: Headers;
    } = {}
  ) {
    const baseRequest = new Request("http://localhost:3000/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    return Object.assign(baseRequest, {
      payload,
      user: options.user ?? undefined,
      t: ((key: string) => key) as any,
      locale: "en",
      fallbackLocale: "en",
      i18n: { t: (key: string) => key } as any,
      context: {} as any,
      payloadAPI: "REST" as const,
      routeParams: {} as any,
      query: {},
      file: undefined,
      data: undefined
    }) as any;
  }

  beforeAll(async () => {
    // Clean up any existing test data
    await payload.delete({
      collection: "users",
      where: { email: { equals: testUser.email } }
    });
    await payload.delete({
      collection: "sessions",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "accounts",
      where: { id: { exists: true } }
    });

    // Create a regular (non-admin) user
    const signUpResult = await payload.betterAuth.api.signUpEmail({
      body: {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      }
    });
    expect(signUpResult).toBeDefined();

    // Sign in to get session cookies
    const signInResult = await payload.betterAuth.api.signInEmail({
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });
    expect(signInResult).toBeDefined();

    regularSessionHeaders = new Headers();
    if (signInResult.headers) {
      const setCookies = signInResult.headers.get("set-cookie");
      if (setCookies) {
        regularSessionHeaders.set("cookie", setCookies);
      }
    }
  });

  afterAll(async () => {
    await payload.delete({
      collection: "users",
      where: { email: { equals: testUser.email } }
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

  describe("generate-invite-url endpoint", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const req = createMockReq({
        body: { role: { label: "Admin", value: "admin" } }
      });

      const response = await generateInviteEndpoint.handler(req);
      expect(response.status).toBe(401);
    });

    it("rejects non-admin users with 403", async () => {
      const user = await payload.find({
        collection: "users",
        where: { email: { equals: testUser.email } }
      });

      const req = createMockReq({
        body: { role: { label: "Admin", value: "admin" } },
        user: user.docs[0]
      });

      const response = await generateInviteEndpoint.handler(req);
      expect(response.status).toBe(403);
    });
  });

  describe("send-invite-url endpoint", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const req = createMockReq({
        body: {
          email: "target@test.com",
          link: "http://localhost:3000/invite?token=test"
        }
      });

      const response = await sendInviteEndpoint.handler(req);
      expect(response.status).toBe(401);
    });

    it("rejects non-admin users with 403", async () => {
      const user = await payload.find({
        collection: "users",
        where: { email: { equals: testUser.email } }
      });

      const req = createMockReq({
        body: {
          email: "target@test.com",
          link: "http://localhost:3000/invite?token=test"
        },
        user: user.docs[0]
      });

      const response = await sendInviteEndpoint.handler(req);
      expect(response.status).toBe(403);
    });
  });
});
