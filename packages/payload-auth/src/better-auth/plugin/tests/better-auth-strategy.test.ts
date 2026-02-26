import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { betterAuthStrategy } from "../lib/build-collections/users/better-auth-strategy";

/**
 * Unit tests for the Better Auth strategy.
 * Tests authentication flow, banned user handling, and error cases.
 *
 * Uses mocks since the strategy depends on getPayloadAuth which needs
 * a full Payload config. We test the logic, not the wiring.
 */

// Mock getPayloadAuth to avoid needing a full Payload instance
vi.mock("@/better-auth/plugin/lib/get-payload-auth", () => ({
  getPayloadAuth: vi.fn()
}));

import { getPayloadAuth } from "@/better-auth/plugin/lib/get-payload-auth";

const mockGetPayloadAuth = getPayloadAuth as ReturnType<typeof vi.fn>;

function createMockPayloadAuth(overrides: {
  session?: any;
  user?: any;
  findByIDResult?: any;
  findByIDError?: Error;
  getSessionError?: Error;
}) {
  return {
    betterAuth: {
      api: {
        getSession: overrides.getSessionError
          ? vi.fn().mockRejectedValue(overrides.getSessionError)
          : vi.fn().mockResolvedValue(
              overrides.session !== undefined
                ? { session: overrides.session, user: overrides.user ?? {} }
                : null
            )
      }
    },
    findByID: overrides.findByIDError
      ? vi.fn().mockRejectedValue(overrides.findByIDError)
      : vi.fn().mockResolvedValue(overrides.findByIDResult ?? null)
  };
}

describe("betterAuthStrategy", () => {
  const strategy = betterAuthStrategy("users");

  it("returns authenticated user for valid session", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@test.com",
      role: ["user"],
      banned: false
    };
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1", token: "abc" },
      user: { id: "user-1" },
      findByIDResult: mockUser
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeDefined();
    expect(result.user!.id).toBe("user-1");
    expect(result.user!.collection).toBe("users");
    expect(result.user!._strategy).toBe("better-auth");
  });

  it("returns null user when no session exists", async () => {
    const mockPayloadAuth = createMockPayloadAuth({ session: undefined });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  it("returns null user when session has no userId", async () => {
    const mockPayloadAuth = createMockPayloadAuth({
      session: { token: "abc" },
      user: {}
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  it("returns null user when findByID returns null", async () => {
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      findByIDResult: null
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  it("returns null user when getSession throws", async () => {
    const mockPayloadAuth = createMockPayloadAuth({
      getSessionError: new Error("Session error")
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  it("returns null user when findByID throws", async () => {
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      findByIDError: new Error("DB error")
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  // P2-17: Strategy should check if user is banned before authenticating
  it("returns null user when user is banned", async () => {
    const bannedUser = {
      id: "user-1",
      email: "banned@test.com",
      role: ["user"],
      banned: true,
      banReason: "Spam"
    };
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      user: { id: "user-1" },
      findByIDResult: bannedUser
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  // P2-17: Locked users should also be rejected
  it("returns null user when user is locked", async () => {
    const lockedUser = {
      id: "user-1",
      email: "locked@test.com",
      role: ["user"],
      locked: true
    };
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      user: { id: "user-1" },
      findByIDResult: lockedUser
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
  });

  // P2-17: Non-banned, non-locked users should authenticate normally
  it("allows authentication for non-banned non-locked users", async () => {
    const normalUser = {
      id: "user-1",
      email: "normal@test.com",
      role: ["user"],
      banned: false,
      locked: false
    };
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      user: { id: "user-1" },
      findByIDResult: normalUser
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeDefined();
    expect(result.user!.id).toBe("user-1");
  });

  it("uses default slug when userSlug not provided", async () => {
    const defaultStrategy = betterAuthStrategy();
    const mockUser = { id: "user-1", email: "test@test.com" };
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      user: { id: "user-1" },
      findByIDResult: mockUser
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await defaultStrategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user!.collection).toBe("users");
    expect(mockPayloadAuth.findByID).toHaveBeenCalledWith({
      collection: "users",
      id: "user-1",
      depth: 0
    });
  });

  // P3-9: Strategy should log errors instead of silently swallowing them
  it("logs error to console when authentication throws", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const dbError = new Error("Database connection lost");
    const mockPayloadAuth = createMockPayloadAuth({
      getSessionError: dbError
    });
    mockGetPayloadAuth.mockResolvedValue(mockPayloadAuth);

    const result = await strategy.authenticate!({
      payload: { config: {} } as any,
      headers: new Headers()
    });

    expect(result.user).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[BetterAuth Strategy] Authentication error:",
      dbError
    );

    consoleErrorSpy.mockRestore();
  });
});
