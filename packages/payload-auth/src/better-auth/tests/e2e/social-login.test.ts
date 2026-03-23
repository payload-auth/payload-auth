import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanupAll, getTestPayload } from "../helpers";
import { payloadAdapter } from "../../adapter/index";
import type { DBAdapter } from "@better-auth/core/db/adapter";

describe("Social Login Flow", () => {
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

  describe("Forward Relationship Join (account → user)", () => {
    async function createSocialUser(email: string, name: string) {
      const now = new Date();
      const user = await payload.create({
        collection: "users",
        data: {
          name,
          email,
          emailVerified: true,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      });

      const account = await payload.create({
        collection: "accounts",
        data: {
          accountId: `google-${Date.now()}`,
          providerId: "google",
          user: user.id,
          accessToken: "mock-access-token",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      });

      return { user, account };
    }

    it("should populate the user object when finding an account with join: { user: true }", async () => {
      const { user, account } = await createSocialUser(
        "social@test.com",
        "Social User"
      );

      // This is exactly what better-auth's findOAuthUser does during re-login.
      // Without the forward join fix, account.user would be a raw ID string
      // instead of a populated user object.
      const found = await adapter.findOne({
        model: "account",
        where: [
          { field: "accountId", value: account.accountId },
          { field: "providerId", value: "google" }
        ],
        join: { user: true }
      }) as any;

      expect(found).not.toBeNull();
      expect(found!.accountId).toBe(account.accountId);
      expect(found!.providerId).toBe("google");

      // The critical assertion: found.user must be a populated object,
      // not just a raw ID string.
      expect(found!.user).toBeDefined();
      expect(typeof found!.user).toBe("object");
      expect(found!.user.id).toBe(String(user.id));
      expect(found!.user.email).toBe("social@test.com");
      expect(found!.user.name).toBe("Social User");

      // userId should still be present as a string ID
      expect(found!.userId).toBe(String(user.id));
    });

    it("should allow session creation after resolving user from account join (re-login flow)", async () => {
      const { user, account } = await createSocialUser(
        "relogin@test.com",
        "Relogin User"
      );

      // Find the account with user join (what findOAuthUser does)
      const found = await adapter.findOne({
        model: "account",
        where: [
          { field: "accountId", value: account.accountId },
          { field: "providerId", value: "google" }
        ],
        join: { user: true }
      }) as any;

      // Extract user.id from the populated join result.
      // Before the fix, found.user was a string, so user.id was undefined.
      const resolvedUser = found!.user;
      expect(typeof resolvedUser).toBe("object");
      expect(resolvedUser.id).toBeDefined();

      // Create a session using the resolved user.id — this is what failed
      // before the fix because userId was undefined
      const session = await adapter.create({
        model: "session",
        data: {
          userId: resolvedUser.id,
          token: "test-session-token-" + Date.now(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(String(user.id));
      expect(session.token).toBeDefined();

      // Verify the session was persisted in the DB
      const dbSessions = await payload.find({
        collection: "sessions",
        where: { token: { equals: session.token } }
      });
      expect(dbSessions.docs).toHaveLength(1);
    });
  });
});
