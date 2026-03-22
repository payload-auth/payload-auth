import { describe, expect, it, vi } from "vitest";
import { getBeforeDeleteHook } from "../../plugin/lib/build-collections/users/hooks/before-delete";

// Mock Payload's transaction utilities so they don't try to access db.beginTransaction
vi.mock("payload", async (importOriginal) => {
  const actual = await importOriginal<typeof import("payload")>();
  return {
    ...actual,
    initTransaction: vi.fn().mockResolvedValue(false),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    killTransaction: vi.fn().mockResolvedValue(undefined)
  };
});

/**
 * Unit tests for the before-delete hook (cascade deletion).
 * Tests that all Better Auth related data is cleaned up when a user is deleted.
 *
 * P1-7: The hook now deletes accounts, sessions, verifications, AND optional
 * plugin collections (passkeys, twoFactors, apiKeys, members, invitations, etc.)
 */

function mockCollectionEntry(slug: string, modelKey: string) {
  return {
    config: {
      slug,
      custom: { betterAuthModelKey: modelKey },
      fields: []
    }
  };
}

function createMockReq(
  userId: string,
  extraCollections: Record<string, any> = {}
) {
  const deleteMock = vi.fn().mockResolvedValue({ docs: [] });

  // Core collections always present
  const collections: Record<string, any> = {
    accounts: mockCollectionEntry("accounts", "account"),
    sessions: mockCollectionEntry("sessions", "session"),
    verifications: mockCollectionEntry("verifications", "verification"),
    ...extraCollections
  };

  return {
    req: {
      payload: {
        collections,
        delete: deleteMock
      },
      transactionID: undefined
    },
    id: userId,
    deleteMock
  };
}

describe("getBeforeDeleteHook", () => {
  it("deletes accounts for the user", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "accounts",
        where: { user: { equals: "user-1" } }
      })
    );
  });

  it("deletes sessions for the user", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "sessions",
        where: { user: { equals: "user-1" } }
      })
    );
  });

  it("deletes verifications for the user", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "verifications"
      })
    );
  });

  // P1-7: Cascade should also delete passkeys when passkey plugin is enabled
  it("deletes passkeys when passkey collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1", {
      passkeys: mockCollectionEntry("passkeys", "passkey")
    });

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "passkeys",
        where: { user: { equals: "user-1" } }
      })
    );
  });

  // P1-7: Cascade should also delete two-factor records
  it("deletes two-factor records when 2FA collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1", {
      twoFactors: mockCollectionEntry("twoFactors", "twoFactor")
    });

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "twoFactors",
        where: { user: { equals: "user-1" } }
      })
    );
  });

  // P1-7: Cascade should also delete API keys (uses referenceId, not userId)
  it("deletes API keys when apikey collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1", {
      apiKeys: mockCollectionEntry("apiKeys", "apikey")
    });

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "apiKeys",
        where: { referenceId: { equals: "user-1" } }
      })
    );
  });

  // P1-7: Cascade should delete organization members
  it("deletes org members when member collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1", {
      members: mockCollectionEntry("members", "member")
    });

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "members",
        where: { user: { equals: "user-1" } }
      })
    );
  });

  // P1-7: Cascade should delete invitations created by user
  it("deletes invitations by inviter when invitation collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1", {
      invitations: mockCollectionEntry("invitations", "invitation")
    });

    await hook({ req, id } as any);

    expect(deleteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "invitations",
        where: { inviter: { equals: "user-1" } }
      })
    );
  });

  it("does not attempt to delete optional collections that do not exist", async () => {
    const hook = getBeforeDeleteHook();
    // Only core collections, no passkeys/twoFactor/etc
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    // Should only delete accounts, sessions, verifications (3 calls)
    expect(deleteMock).toHaveBeenCalledTimes(3);
    const deletedCollections = deleteMock.mock.calls.map(
      (call: any[]) => call[0]?.collection
    );
    expect(deletedCollections).toEqual(
      expect.arrayContaining(["accounts", "sessions", "verifications"])
    );
    expect(deletedCollections).not.toContain("passkeys");
    expect(deletedCollections).not.toContain("twoFactors");
  });

  it("does not throw when delete operations fail", async () => {
    const hook = getBeforeDeleteHook();
    const deleteMock = vi.fn().mockRejectedValue(new Error("DB error"));

    const req = {
      payload: {
        collections: {
          accounts: mockCollectionEntry("accounts", "account"),
          sessions: mockCollectionEntry("sessions", "session"),
          verifications: mockCollectionEntry("verifications", "verification")
        },
        delete: deleteMock
      },
      transactionID: undefined
    };

    // Should not throw — errors should be caught
    await expect(hook({ req, id: "user-1" } as any)).resolves.not.toThrow();
  });

  it("uses transaction when available", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    // All delete calls should include the req for transaction propagation
    deleteMock.mock.calls.forEach((call: any[]) => {
      expect(call[0]).toHaveProperty("req");
    });
  });

  // P2-3: Verification query uses contains instead of fragile like pattern
  it("uses contains operator for verification deletion (P2-3)", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    const verificationCalls = deleteMock.mock.calls.filter(
      (call: any[]) => call[0]?.collection === "verifications"
    );

    expect(verificationCalls.length).toBeGreaterThan(0);
    const whereClause = verificationCalls[0][0].where;
    // Should use contains with JSON-quoted userId, not like
    expect(whereClause.value.contains).toBe('"user-1"');
    expect(whereClause.value.like).toBeUndefined();
  });
});
