import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanupAll, getTestPayload, signIn, signUp } from "../helpers";
import { payloadAdapter } from "../../adapter/index";
import type { DBAdapter } from "@better-auth/core/db/adapter";

describe("Join Resolution", () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>;
  let adapter: DBAdapter;

  beforeAll(async () => {
    payload = await getTestPayload();

    const adapterFactory = payloadAdapter({
      payloadClient: payload,
      adapterConfig: { idType: "number" }
    });

    adapter = adapterFactory({ ...payload.betterAuth.options });
  });

  afterEach(async () => {
    await cleanupAll(payload);
  });

  /**
   * Helper: sign up a user via email/password so both the user and
   * credential account are created through the normal Better Auth flow.
   */
  async function signUpUser(email: string, name: string) {
    const result = await payload.betterAuth.api.signUpEmail({
      body: { email, password: "Password123!", name }
    });
    return result;
  }

  describe("Reverse Joins (one-to-many via Payload join fields)", () => {
    it("should resolve reverse join: user → accounts (singular join field name, plural collection slug)", async () => {
      const { user } = await signUpUser("reverse-join@test.com", "Reverse Join User");

      // Better Auth sends join: { account: true } with the singular model key.
      // The users collection has a join field named "account" (singular) that
      // targets the "accounts" collection (plural). The adapter must resolve
      // this correctly despite the naming mismatch.
      const found = await adapter.findOne({
        model: "user",
        where: [{ field: "id", value: user.id }],
        join: { account: true }
      }) as any;

      expect(found).not.toBeNull();
      expect(found.id).toBe(user.id);

      // The account join should be populated as an array
      expect(found.account).toBeDefined();
      expect(Array.isArray(found.account)).toBe(true);
      expect(found.account.length).toBeGreaterThan(0);
      // Each joined account should have core fields
      expect(found.account[0].id).toBeDefined();
      expect(found.account[0].providerId).toBe("credential");
    });

    it("should resolve reverse join: user → sessions", async () => {
      const { user } = await signUpUser("session-join@test.com", "Session Join User");

      // Sign in to create a session
      await payload.betterAuth.api.signInEmail({
        body: { email: "session-join@test.com", password: "Password123!" }
      });

      const found = await adapter.findOne({
        model: "user",
        where: [{ field: "id", value: user.id }],
        join: { session: true }
      }) as any;

      expect(found).not.toBeNull();
      expect(found.session).toBeDefined();
      expect(Array.isArray(found.session)).toBe(true);
      expect(found.session.length).toBeGreaterThan(0);
    });

    it("should resolve multiple reverse joins simultaneously", async () => {
      const { user } = await signUpUser("multi-join@test.com", "Multi Join User");

      await payload.betterAuth.api.signInEmail({
        body: { email: "multi-join@test.com", password: "Password123!" }
      });

      const found = await adapter.findOne({
        model: "user",
        where: [{ field: "id", value: user.id }],
        join: { account: true, session: true }
      }) as any;

      expect(found).not.toBeNull();
      expect(found.account).toBeDefined();
      expect(Array.isArray(found.account)).toBe(true);
      expect(found.account.length).toBeGreaterThan(0);
      expect(found.session).toBeDefined();
      expect(Array.isArray(found.session)).toBe(true);
      expect(found.session.length).toBeGreaterThan(0);
    });
  });

  describe("Forward Joins (many-to-one via relationship fields)", () => {
    it("should populate forward join: account → user", async () => {
      const { user } = await signUpUser("forward-join@test.com", "Forward Join User");

      // Find the account and request join on user (forward relationship)
      const found = await adapter.findOne({
        model: "account",
        where: [{ field: "userId", value: user.id }],
        join: { user: true }
      }) as any;

      expect(found).not.toBeNull();
      // Forward join: user should be a populated object, not a raw ID
      expect(typeof found.user).toBe("object");
      expect(found.user.id).toBe(String(user.id));
      expect(found.user.email).toBe("forward-join@test.com");
    });
  });

  describe("Mixed Joins (reverse + forward in same flow)", () => {
    it("should handle the email/password sign-in flow (uses reverse join on user for accounts)", async () => {
      await signUpUser("signin-join@test.com", "Sign In Join User");

      // This is the core flow that was broken: sign-in looks up the user
      // and requests join: { account: true } to check credentials.
      // Without correct join resolution, the account data is missing and
      // sign-in returns 401 "Invalid email or password".
      const { res, body } = await signIn(payload, {
        email: "signin-join@test.com",
        password: "Password123!"
      });

      expect(res.status).toBe(200);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe("signin-join@test.com");
    });

    it("should handle findMany with reverse joins", async () => {
      await signUpUser("findmany-1@test.com", "FindMany User 1");
      await signUpUser("findmany-2@test.com", "FindMany User 2");

      const found = await adapter.findMany({
        model: "user",
        where: [
          {
            field: "email",
            value: "findmany-1@test.com",
            operator: "eq"
          }
        ],
        join: { account: true }
      }) as any[];

      expect(found.length).toBeGreaterThan(0);
      // Each user should have their accounts populated as an array
      for (const user of found) {
        expect(user.account).toBeDefined();
        expect(Array.isArray(user.account)).toBe(true);
      }
    });
  });

  describe("Join with config: false", () => {
    it("should skip joins set to false", async () => {
      const { user } = await signUpUser("skip-join@test.com", "Skip Join User");

      const found = await adapter.findOne({
        model: "user",
        where: [{ field: "id", value: user.id }],
        join: { account: false, session: false }
      }) as any;

      expect(found).not.toBeNull();
      expect(found.id).toBe(user.id);
    });
  });

  describe("Edge Cases", () => {
    it("should handle join for non-existent relationship gracefully", async () => {
      const { user } = await signUpUser("unknown-join@test.com", "Unknown Join User");

      // Request a join for a model that doesn't have a join field on user
      // and isn't a forward relationship either — should be silently skipped
      const found = await adapter.findOne({
        model: "user",
        where: [{ field: "id", value: user.id }],
        join: { verification: true }
      }) as any;

      expect(found).not.toBeNull();
      expect(found.id).toBe(user.id);
    });

    it("should maintain depth: 0 when no joins are requested", async () => {
      const { user } = await signUpUser("no-join@test.com", "No Join User");

      // Without joins, relationships should remain as flat IDs (depth: 0)
      const found = await adapter.findOne({
        model: "account",
        where: [{ field: "userId", value: user.id }]
      }) as any;

      expect(found).not.toBeNull();
      // user field should be a flat ID string, not a populated object
      expect(typeof found.userId).toBe("string");
    });

    it("should handle join with limit config", async () => {
      const { user } = await signUpUser("limit-join@test.com", "Limit Join User");

      const found = await adapter.findOne({
        model: "user",
        where: [{ field: "id", value: user.id }],
        join: { account: { limit: 1 } }
      }) as any;

      expect(found).not.toBeNull();
      expect(found.account).toBeDefined();
    });
  });
});
