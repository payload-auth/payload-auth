import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import {
  cleanupAll,
  createAuthenticatedUser,
  createQuickSession,
  createQuickUser,
  getTestContext,
  signIn
} from "../helpers";

describe("Admin Plugin Features", () => {
  let payload: Awaited<ReturnType<typeof import("../helpers").getTestPayload>>;
  let test: TestHelpers;

  beforeAll(async () => {
    ({ payload, test } = await getTestContext());
  });

  afterEach(async () => {
    await cleanupAll(payload);
  });

  describe("Role Assignment", () => {
    it("should assign default 'user' role on signup", async () => {
      const user = await createQuickUser(test, {
        email: "defaultrole@test.com"
      });

      const dbUser = await payload.findByID({
        collection: "users",
        id: user.id
      });

      expect(dbUser.role).toBeDefined();
      expect(dbUser.role).toContain("user");
    });

    it("should allow admin to update user role via Payload local API", async () => {
      const user = await createQuickUser(test, {
        email: "roleupdate@test.com"
      });

      const updated = await payload.update({
        collection: "users",
        id: user.id,
        data: { role: ["admin"] }
      });

      expect(updated.role).toContain("admin");
    });
  });

  describe("User Banning", () => {
    it("should allow banning a user via Payload local API", async () => {
      const user = await createQuickUser(test, {
        email: "banned@test.com"
      });

      const updated = await payload.update({
        collection: "users",
        id: user.id,
        data: { banned: true, banReason: "Test ban" }
      });

      expect(updated.banned).toBe(true);
      expect(updated.banReason).toBe("Test ban");
    });

    it("should prevent banned user from getting a session", async () => {
      // Need full auth flow for this test since we sign in after banning
      const { user, credentials } = await createAuthenticatedUser(payload, {
        email: "bannedlogin@test.com"
      });

      // Ban the user
      await payload.update({
        collection: "users",
        id: user.id,
        data: { banned: true }
      });

      // Try to sign in again
      const { res } = await signIn(payload, {
        email: credentials.email,
        password: credentials.password
      });

      // Should be rejected
      expect(res.status).not.toBe(200);
    });
  });

  describe("Admin Impersonation Fields", () => {
    it("should have impersonatedBy field on sessions", async () => {
      const { user, session } = await createQuickSession(test, {
        email: "impersonate@test.com"
      });

      const sessions = await payload.find({
        collection: "sessions",
        where: { user: { equals: user.id } }
      });

      expect(sessions.docs.length).toBeGreaterThan(0);
      // impersonatedBy should exist as a field (nullable)
      const sessionDoc = sessions.docs[0];
      expect("impersonatedBy" in sessionDoc).toBe(true);
    });
  });
});
