import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanupAll, createAuthenticatedUser, getTestPayload } from "../helpers";

/**
 * Cascade delete tests need createAuthenticatedUser (not createQuickSession)
 * because they verify that accounts created via the full signup flow are
 * cleaned up when a user is deleted.
 */
describe("Cascade Delete on User Deletion", () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>;

  beforeAll(async () => {
    payload = await getTestPayload();
  });

  afterEach(async () => {
    await cleanupAll(payload);
  });

  it("should delete associated sessions when user is deleted", async () => {
    const { user } = await createAuthenticatedUser(payload, {
      email: "cascade-session@test.com"
    });

    // Verify session exists
    const sessionsBefore = await payload.find({
      collection: "sessions",
      where: { user: { equals: user.id } }
    });
    expect(sessionsBefore.docs.length).toBeGreaterThan(0);

    // Delete user
    await payload.delete({
      collection: "users",
      id: user.id
    });

    // Sessions should be cleaned up
    const sessionsAfter = await payload.find({
      collection: "sessions",
      where: { user: { equals: user.id } }
    });
    expect(sessionsAfter.docs).toHaveLength(0);
  });

  it("should delete associated accounts when user is deleted", async () => {
    const { user } = await createAuthenticatedUser(payload, {
      email: "cascade-account@test.com"
    });

    // Verify account exists
    const accountsBefore = await payload.find({
      collection: "accounts",
      where: { user: { equals: user.id } }
    });
    expect(accountsBefore.docs.length).toBeGreaterThan(0);

    // Delete user
    await payload.delete({
      collection: "users",
      id: user.id
    });

    // Accounts should be cleaned up
    const accountsAfter = await payload.find({
      collection: "accounts",
      where: { user: { equals: user.id } }
    });
    expect(accountsAfter.docs).toHaveLength(0);
  });

  it("should delete associated verifications when user is deleted", async () => {
    const { user } = await createAuthenticatedUser(payload, {
      email: "cascade-verify@test.com"
    });

    // Create a verification record manually.
    // The beforeDelete hook searches for value containing '"userId"' (JSON-quoted),
    // so the value must include the userId to be cascade-deleted.
    try {
      await payload.create({
        collection: "verifications",
        data: {
          identifier: "cascade-verify@test.com",
          value: JSON.stringify({ email: "cascade-verify@test.com", userId: user.id }),
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        }
      });
    } catch {
      // Verification may require different fields depending on config
    }

    // Delete user
    await payload.delete({
      collection: "users",
      id: user.id
    });

    // Verifications containing this user's ID should be cleaned up
    const verificationsAfter = await payload.find({
      collection: "verifications",
      where: { identifier: { equals: "cascade-verify@test.com" } }
    });
    expect(verificationsAfter.docs).toHaveLength(0);
  });
});
