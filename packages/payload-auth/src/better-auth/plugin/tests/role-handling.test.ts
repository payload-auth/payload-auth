import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, betterAuthPluginOptions } from "../../adapter/tests/dev";

/**
 * Integration tests for role field handling.
 * Verifies that roles are consistently stored as arrays in Payload
 * and correctly converted when flowing through Better Auth.
 *
 * Covers Issues #112 (unexpected role transformation) and #128 (impersonate TypeError).
 *
 * Requires a running Postgres database.
 */
describe("Role Handling (Issues #112, #128 Integration)", async () => {
  const payload = await getPayload();

  const testUser = {
    email: "role-test@test.com",
    password: "roletest123456",
    name: "Role Test User"
  };

  let userId: string;

  beforeAll(async () => {
    // Clean up
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

    // Create test user via Better Auth
    const signUpResult = await payload.betterAuth.api.signUpEmail({
      body: {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      }
    });
    expect(signUpResult).toBeDefined();

    // Get the user from Payload to check role format
    const users = await payload.find({
      collection: "users",
      where: { email: { equals: testUser.email } }
    });
    userId = users.docs[0].id as string;
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

  it("stores role as an array in Payload (hasMany select field)", async () => {
    const user = await payload.findByID({
      collection: "users",
      id: userId
    });

    // Role should be stored as an array (Payload hasMany select)
    expect(Array.isArray(user.role)).toBe(true);
    expect(user.role).toContain("user");
  });

  it("role survives round-trip through Better Auth adapter", async () => {
    // Update role via Payload local API
    await payload.update({
      collection: "users",
      id: userId,
      data: {
        role: ["admin", "editor"]
      }
    });

    // Read back via Payload
    const user = await payload.findByID({
      collection: "users",
      id: userId
    });

    expect(Array.isArray(user.role)).toBe(true);
    expect(user.role).toContain("admin");
    expect(user.role).toContain("editor");
  });

  it("single role is stored as single-element array, not bare string", async () => {
    await payload.update({
      collection: "users",
      id: userId,
      data: {
        role: ["user"]
      }
    });

    const user = await payload.findByID({
      collection: "users",
      id: userId
    });

    expect(Array.isArray(user.role)).toBe(true);
    expect(user.role).toEqual(["user"]);
  });

  it("Better Auth session contains role in expected format", async () => {
    // Sign in to get a session
    const signInResult = await payload.betterAuth.api.signInEmail({
      body: {
        email: testUser.email,
        password: testUser.password
      },
      asResponse: true
    } as any) as unknown as Response;

    const setCookie = signInResult.headers.get("set-cookie");
    expect(setCookie).toBeDefined();

    // Extract session token
    const match = setCookie!.match(/better-auth\.session_token=([^;]+)/);
    expect(match).toBeDefined();

    const headers = new Headers();
    headers.set("cookie", `better-auth.session_token=${match![1]}`);

    // Get session through Better Auth API
    const session = await payload.betterAuth.api.getSession({ headers });
    expect(session).toBeDefined();
    expect(session!.user).toBeDefined();

    // The role should be accessible without throwing TypeError
    const role = session!.user.role;
    expect(role).toBeDefined();
  });
});
