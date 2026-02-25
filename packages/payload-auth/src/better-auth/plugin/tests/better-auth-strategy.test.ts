import { describe, expect, it, vi } from "vitest";
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

  // P2-17: Expired bans should still allow authentication
  it("allows authentication when ban has expired", async () => {
    const expiredBanUser = {
      id: "user-1",
      email: "unbanned@test.com",
      role: ["user"],
      banned: true,
      banExpires: new Date(Date.now() - 86400000).toISOString() // Expired yesterday
    };
    const mockPayloadAuth = createMockPayloadAuth({
      session: { userId: "user-1" },
      user: { id: "user-1" },
      findByIDResult: expiredBanUser
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
      id: "user-1"
    });
  });
});
