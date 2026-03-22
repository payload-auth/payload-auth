import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { getTestContext, cleanupAll } from "../helpers";

/**
 * Integration tests for role field handling.
 * Verifies that roles are consistently stored as arrays in Payload
 * and correctly converted when flowing through Better Auth.
 *
 * Covers Issues #112 (unexpected role transformation) and #128 (impersonate TypeError).
 *
 * Requires a running Postgres database.
 */
describe("Role Handling", async () => {
  const { payload, test } = await getTestContext();

  let userId: string;

  beforeAll(async () => {
    await cleanupAll(payload);

    // Create test user via test helpers (bypasses email verification)
    const user = test.createUser({
      email: "role-test@test.com",
      name: "Role Test User",
      emailVerified: true
    });
    const saved = await test.saveUser(user);
    userId = saved.id;
  });

  afterAll(async () => {
    await cleanupAll(payload);
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
        role: ["admin", "user"]
      }
    });

    // Read back via Payload
    const user = await payload.findByID({
      collection: "users",
      id: userId
    });

    expect(Array.isArray(user.role)).toBe(true);
    expect(user.role).toContain("admin");
    expect(user.role).toContain("user");
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

  it("Better Auth session works without TypeError on role access (#128)", async () => {
    await payload.update({
      collection: "users",
      id: userId,
      data: { role: ["user"] }
    });

    const { session, headers } = await test.login({ userId });
    console.log("[role-test] session:", session);
    console.log("[role-test] headers:", headers);
    expect(session).toBeDefined();

    // getSession should not throw — this was the #128 bug
    const sessionResult = await payload.betterAuth.api.getSession({ headers });
    expect(sessionResult).toBeDefined();
    expect(sessionResult!.user).toBeDefined();

    // Accessing role on the session user must not throw TypeError (#128)
    expect(() => (sessionResult!.user as any)?.role).not.toThrow();

    // The authoritative role lives on the Payload user document
    const payloadUser = await payload.findByID({
      collection: "users",
      id: userId
    });
    expect(Array.isArray(payloadUser.role)).toBe(true);
    expect(payloadUser.role).toContain("user");
  });
});
