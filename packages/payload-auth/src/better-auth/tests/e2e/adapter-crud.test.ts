import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanupAll, getTestPayload } from "../helpers";

describe("Adapter CRUD via Payload Local API", () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>;

  beforeAll(async () => {
    payload = await getTestPayload();
  });

  afterEach(async () => {
    await cleanupAll(payload);
  });

  describe("Create", () => {
    it("should create a user via Better Auth API", async () => {
      const result = await payload.betterAuth.api.signUpEmail({
        body: {
          email: "crud-create@test.com",
          password: "Password123!",
          name: "CRUD Create"
        }
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("crud-create@test.com");
    });

    it("should create a user via Payload local API", async () => {
      const user = await payload.create({
        collection: "users",
        data: {
          email: "payload-create@test.com",
          name: "Payload Create",
          emailVerified: false
        }
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("payload-create@test.com");
    });
  });

  describe("Read", () => {
    it("should find user by ID via Payload local API", async () => {
      const result = await payload.betterAuth.api.signUpEmail({
        body: {
          email: "crud-read@test.com",
          password: "Password123!",
          name: "CRUD Read"
        }
      });

      const user = await payload.findByID({
        collection: "users",
        id: result.user.id
      });

      expect(user.email).toBe("crud-read@test.com");
    });

    it("should find users with where query", async () => {
      await payload.betterAuth.api.signUpEmail({
        body: {
          email: "crud-query@test.com",
          password: "Password123!",
          name: "CRUD Query"
        }
      });

      const found = await payload.find({
        collection: "users",
        where: { email: { equals: "crud-query@test.com" } }
      });

      expect(found.docs).toHaveLength(1);
      expect(found.docs[0].name).toBe("CRUD Query");
    });
  });

  describe("Update", () => {
    it("should update user fields via Payload local API", async () => {
      const result = await payload.betterAuth.api.signUpEmail({
        body: {
          email: "crud-update@test.com",
          password: "Password123!",
          name: "Before Update"
        }
      });

      const updated = await payload.update({
        collection: "users",
        id: result.user.id,
        data: { name: "After Update" }
      });

      expect(updated.name).toBe("After Update");
    });
  });

  describe("Delete", () => {
    it("should delete user via Payload local API", async () => {
      const result = await payload.betterAuth.api.signUpEmail({
        body: {
          email: "crud-delete@test.com",
          password: "Password123!",
          name: "CRUD Delete"
        }
      });

      await payload.delete({
        collection: "users",
        id: result.user.id
      });

      const found = await payload.find({
        collection: "users",
        where: { email: { equals: "crud-delete@test.com" } }
      });

      expect(found.docs).toHaveLength(0);
    });
  });

  describe("Relationship IDs", () => {
    it("should store flat IDs for relationships (not populated objects)", async () => {
      const result = await payload.betterAuth.api.signUpEmail({
        body: {
          email: "flatid@test.com",
          password: "Password123!",
          name: "Flat ID"
        }
      });

      // Accounts should have user as a flat ID, not a populated object
      const accounts = await payload.find({
        collection: "accounts",
        where: { user: { equals: result.user.id } },
        depth: 0
      });

      expect(accounts.docs.length).toBeGreaterThan(0);
      const account = accounts.docs[0];
      // At depth: 0, user should be a scalar ID
      expect(typeof account.user === "string" || typeof account.user === "number").toBe(true);
    });
  });
});
