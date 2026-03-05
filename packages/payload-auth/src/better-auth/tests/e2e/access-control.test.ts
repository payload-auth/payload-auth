import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import {
  cleanupAll,
  createQuickSession,
  createQuickUser,
  getTestContext
} from "../helpers";

describe("Access Control", () => {
  let payload: Awaited<ReturnType<typeof import("../helpers").getTestPayload>>;
  let test: TestHelpers;

  beforeAll(async () => {
    ({ payload, test } = await getTestContext());
  });

  afterEach(async () => {
    await cleanupAll(payload);
  });

  describe("Unauthenticated Access", () => {
    it("should deny unauthenticated access to users collection", async () => {
      await createQuickUser(test, { email: "hidden@test.com" });

      // Access control may return empty results or throw Forbidden
      try {
        const result = await payload.find({
          collection: "users",
          overrideAccess: false
        });
        expect(result.docs).toHaveLength(0);
      } catch (error: any) {
        expect(error.message).toMatch(/not allowed|forbidden/i);
      }
    });

    it("should deny unauthenticated access to sessions collection", async () => {
      await createQuickSession(test, { email: "session-hidden@test.com" });

      // Access control may return empty results or throw Forbidden
      try {
        const result = await payload.find({
          collection: "sessions",
          overrideAccess: false
        });
        expect(result.docs).toHaveLength(0);
      } catch (error: any) {
        expect(error.message).toMatch(/not allowed|forbidden/i);
      }
    });

    it("should deny unauthenticated access to accounts collection", async () => {
      await createQuickUser(test, { email: "account-hidden@test.com" });

      // Access control may return empty results or throw Forbidden
      try {
        const result = await payload.find({
          collection: "accounts",
          overrideAccess: false
        });
        expect(result.docs).toHaveLength(0);
      } catch (error: any) {
        expect(error.message).toMatch(/not allowed|forbidden/i);
      }
    });
  });

  describe("Admin Access", () => {
    it("should allow admin users to read all users", async () => {
      // Create a regular user
      await createQuickUser(test, { email: "regular@test.com" });

      // Create an admin user
      const adminUser = await createQuickUser(test, {
        email: "admin-access@test.com"
      });

      // Promote to admin
      await payload.update({
        collection: "users",
        id: adminUser.id,
        data: { role: ["admin"] }
      });

      // Fetch the admin user with updated role
      const admin = await payload.findByID({
        collection: "users",
        id: adminUser.id
      });

      // Query as admin
      const result = await payload.find({
        collection: "users",
        overrideAccess: false,
        user: admin
      });

      // Admin should see all users
      expect(result.docs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Self-Access", () => {
    it("should allow a user to read their own record", async () => {
      const saved = await createQuickUser(test, {
        email: "selfread@test.com"
      });

      // Fetch from Payload to get the native ID type
      const fullUser = await payload.findByID({
        collection: "users",
        id: saved.id
      });

      const result = await payload.findByID({
        collection: "users",
        id: fullUser.id,
        overrideAccess: false,
        user: fullUser
      });

      expect(String(result.id)).toBe(String(fullUser.id));
      expect(result.email).toBe("selfread@test.com");
    });

    it("should deny a user from reading another user's record", async () => {
      const saved1 = await createQuickUser(test, {
        email: "user1@test.com"
      });
      const saved2 = await createQuickUser(test, {
        email: "user2@test.com"
      });

      const fullUser1 = await payload.findByID({
        collection: "users",
        id: saved1.id
      });

      try {
        const result = await payload.findByID({
          collection: "users",
          id: saved2.id,
          overrideAccess: false,
          user: fullUser1
        });
        // If it doesn't throw, it should return null/not found
        expect(result).toBeNull();
      } catch (error: any) {
        // Payload may throw a NotFound error
        expect(error.status).toBe(404);
      }
    });
  });
});
