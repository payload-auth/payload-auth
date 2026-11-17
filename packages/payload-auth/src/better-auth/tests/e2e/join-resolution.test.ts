import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
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

      // The joined doc must go through the same transformOutput normalization
      // as reverse-joined docs — including ID normalization on the nested
      // document itself (typeof id === "string", not left as a raw number).
      //
      // NOTE: we don't assert found.user.createdAt is a Date instance here.
      // That's blocked by a separate, pre-existing bug in
      // applySaveToJwtReturned (plugin/lib/sanitize-better-auth-options/
      // utils/apply-save-to-jwt-returned.ts), which overwrites
      // additionalFields.createdAt with a bare `{ returned: false }` object
      // whenever the field lacks explicit saveToJWT: true — wiping the
      // `type: "date"` off the BA schema for the "user" and "session"
      // models entirely. That bug predates this change (confirmed via git
      // history) and is out of scope for join normalization.
      expect(typeof found.user.id).toBe("string");
      // The BA field key (userId) must still carry the flat string ID
      // alongside the populated object under the renamed Payload key (user),
      // and both must agree on the same normalized ID value.
      expect(typeof found.userId).toBe("string");
      expect(found.userId).toBe(found.user.id);
    });

    it("should disambiguate multiple relationship fields targeting the same collection (session.user vs session.impersonatedBy)", async () => {
      const { user: owner } = await signUpUser(
        "session-owner@test.com",
        "Session Owner"
      );
      const { user: admin } = await signUpUser(
        "session-admin@test.com",
        "Session Admin"
      );

      // Create a session row directly with BOTH `user` and `impersonatedBy`
      // set to different users. Both fields are relationships targeting the
      // "users" collection, so a join: { user: true } request must resolve
      // to the `user` field specifically (via the BA schema's
      // references.model), not `impersonatedBy` — and must not populate
      // impersonatedBy at all since it wasn't requested.
      const session = await payload.create({
        collection: "sessions",
        data: {
          token: `disambiguation-test-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          user: Number(owner.id),
          impersonatedBy: Number(admin.id)
        } as any
      });

      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      let found: any;
      let errorCalls: unknown[][];
      try {
        found = await adapter.findOne({
          model: "session",
          where: [{ field: "id", value: session.id }],
          join: { user: true }
        });
      } finally {
        errorCalls = [...consoleError.mock.calls];
        consoleError.mockRestore();
      }

      // session.userId is the BA foreign key for a user join, so this is not
      // ambiguous and must not be reported as such on every session lookup.
      const ambiguityLogs = errorCalls.filter((args) =>
        args.some((arg) => String(arg).includes("ambiguous"))
      );
      expect(ambiguityLogs).toHaveLength(0);

      expect(found).not.toBeNull();
      // The `user` field must be resolved and populated as an object.
      expect(typeof found.user).toBe("object");
      expect(found.user.id).toBe(String(owner.id));
      // `impersonatedBy` was not requested in the join and must remain a
      // flat scalar ID — proving the schema-driven lookup picked `user`
      // and not the other users-relationship field on the same collection.
      expect(typeof found.impersonatedBy).not.toBe("object");
      expect(String(found.impersonatedBy)).toBe(String(admin.id));
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
