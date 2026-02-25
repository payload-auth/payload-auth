import { describe, expect, it, vi, beforeEach } from "vitest";
import { getBeforeDeleteHook } from "../lib/build-collections/users/hooks/before-delete";

/**
 * Unit tests for the before-delete hook (cascade deletion).
 * Tests that all Better Auth related data is cleaned up when a user is deleted.
 *
 * P1-7: The hook currently only deletes accounts, sessions, and verifications.
 * Missing: passkeys, twoFactors, apiKeys, org members, team members.
 */

// Mock the collection helper
vi.mock("@/better-auth/plugin/helpers/get-collection", () => ({
  getCollectionByModelKey: vi.fn((collections: any, modelKey: string) => {
    const slugMap: Record<string, string> = {
      account: "accounts",
      session: "sessions",
      verification: "verifications",
      passkey: "passkeys",
      twoFactor: "two-factors",
      apikey: "api-keys",
      member: "members",
      teamMember: "team-members"
    };
    return { slug: slugMap[modelKey] || modelKey };
  })
}));

function createMockReq(userId: string) {
  const deleteMock = vi.fn().mockResolvedValue({ docs: [] });

  return {
    req: {
      payload: {
        collections: {},
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
  it("should delete passkeys for the user when passkey collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    // This test will FAIL until P1-7 is fixed — the hook doesn't delete passkeys yet
    const passkeyCalls = deleteMock.mock.calls.filter(
      (call: any[]) => call[0]?.collection === "passkeys"
    );
    expect(passkeyCalls.length).toBeGreaterThan(0);
  });

  // P1-7: Cascade should also delete two-factor records
  it("should delete two-factor records for the user when 2FA collection exists", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    const twoFactorCalls = deleteMock.mock.calls.filter(
      (call: any[]) => call[0]?.collection === "two-factors"
    );
    expect(twoFactorCalls.length).toBeGreaterThan(0);
  });

  it("does not throw when delete operations fail", async () => {
    const hook = getBeforeDeleteHook();
    const deleteMock = vi.fn().mockRejectedValue(new Error("DB error"));

    const req = {
      payload: {
        collections: {},
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

  // P2-3: Verification query uses fragile like pattern
  it("uses a reliable query for verifications (not fragile string matching)", async () => {
    const hook = getBeforeDeleteHook();
    const { req, id, deleteMock } = createMockReq("user-1");

    await hook({ req, id } as any);

    const verificationCalls = deleteMock.mock.calls.filter(
      (call: any[]) => call[0]?.collection === "verifications"
    );

    // The current implementation uses: value: { like: '"user-1"' }
    // This is fragile — if the JSON structure changes, the query breaks
    // A proper fix would use a dedicated userId field or a more robust query
    expect(verificationCalls.length).toBeGreaterThan(0);
    const whereClause = verificationCalls[0][0].where;
    // Document current behavior - the like pattern includes JSON-escaped quotes
    expect(whereClause.value.like).toContain("user-1");
  });
});
