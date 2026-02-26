import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Unit tests for the after-logout hook.
 * Tests cookie cleanup, session deletion, and error handling.
 *
 * Mocks next/headers since the hook depends on the Next.js cookie store.
 */

// Use vi.hoisted to declare mocks before vi.mock hoisting
const { mockCookieStore, mockPayloadAuth } = vi.hoisted(() => {
  const mockCookieStore = {
    get: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn()
  };
  const mockPayloadAuth = {
    betterAuth: {
      $context: Promise.resolve({
        authCookies: {
          sessionToken: { name: "better-auth.session_token" },
          sessionData: { name: "better-auth.session_data" },
          dontRememberToken: { name: "better-auth.dont_remember" }
        }
      })
    },
    find: vi.fn().mockResolvedValue({ docs: [] }),
    delete: vi.fn().mockResolvedValue({ docs: [] })
  };
  return { mockCookieStore, mockPayloadAuth };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore)
}));

vi.mock("@/better-auth/plugin/lib/get-payload-auth", () => ({
  getPayloadAuth: vi.fn().mockResolvedValue(mockPayloadAuth)
}));

vi.mock("@/better-auth/plugin/helpers/get-collection", () => ({
  getCollectionByModelKey: vi.fn().mockReturnValue({ slug: "sessions" })
}));

import { getAfterLogoutHook } from "../lib/build-collections/users/hooks/after-logout";

describe("getAfterLogoutHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.getAll.mockReturnValue([]);
    mockCookieStore.get.mockReturnValue(undefined);
    mockPayloadAuth.find.mockResolvedValue({ docs: [] });
    mockPayloadAuth.delete.mockResolvedValue({ docs: [] });
  });

  it("clears all Better Auth cookies", async () => {
    const hook = getAfterLogoutHook();

    // Simulate cookies existing
    mockCookieStore.get.mockImplementation((name: string) => {
      const cookies: Record<string, any> = {
        "better-auth.session_token": { name: "better-auth.session_token", value: "token.sig" },
        "better-auth.session_data": { name: "better-auth.session_data", value: "data" },
        "better-auth.dont_remember": { name: "better-auth.dont_remember", value: "1" },
        "admin_session": { name: "admin_session", value: "admin" }
      };
      return cookies[name];
    });

    await hook({
      req: {
        payload: { config: {}, collections: {} }
      }
    } as any);

    // Should attempt to clear all base cookie names (both plain and __Secure- variants)
    const setCalls = mockCookieStore.set.mock.calls;
    const clearedNames = setCalls.map((call: any[]) => call[0]);

    expect(clearedNames).toContain("better-auth.session_token");
    expect(clearedNames).toContain("better-auth.session_data");
    expect(clearedNames).toContain("better-auth.dont_remember");
    expect(clearedNames).toContain("admin_session");
  });

  it("clears multi-session cookies", async () => {
    const hook = getAfterLogoutHook();

    mockCookieStore.getAll.mockReturnValue([
      { name: "better-auth.session_token_multi.0", value: "token1" },
      { name: "better-auth.session_token_multi.1", value: "token2" },
      { name: "__Secure-better-auth.session_token_multi.0", value: "token3" }
    ]);

    mockCookieStore.get.mockImplementation((name: string) => {
      const allCookies = mockCookieStore.getAll();
      return allCookies.find((c: any) => c.name === name) ||
        (name === "better-auth.session_token" ? { name, value: "token.sig" } : undefined);
    });

    await hook({
      req: {
        payload: { config: {}, collections: {} }
      }
    } as any);

    const setCalls = mockCookieStore.set.mock.calls;
    const clearedNames = setCalls.map((call: any[]) => call[0]);

    expect(clearedNames).toContain("better-auth.session_token_multi.0");
    expect(clearedNames).toContain("better-auth.session_token_multi.1");
    expect(clearedNames).toContain("__Secure-better-auth.session_token_multi.0");
  });

  it("deletes session from database when token cookie exists", async () => {
    const hook = getAfterLogoutHook();

    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "better-auth.session_token") {
        return { name, value: "session-token-value.signature" };
      }
      return undefined;
    });

    mockPayloadAuth.find.mockResolvedValue({
      docs: [{ id: "session-1", token: "session-token-value" }]
    });

    await hook({
      req: {
        payload: { config: {}, collections: {} }
      }
    } as any);

    // Should look up session by token (split at "." to remove signature)
    expect(mockPayloadAuth.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "sessions",
        where: { token: { equals: "session-token-value" } }
      })
    );

    // Should delete the found session
    expect(mockPayloadAuth.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "sessions",
        where: { id: { equals: "session-1" } }
      })
    );
  });

  it("does not crash when session token cookie is missing", async () => {
    const hook = getAfterLogoutHook();

    mockCookieStore.get.mockReturnValue(undefined);

    await expect(
      hook({
        req: {
          payload: { config: {}, collections: {} }
        }
      } as any)
    ).resolves.not.toThrow();
  });

  // P2-1: Empty catch block should at least log the error
  it("does not crash when session deletion fails", async () => {
    const hook = getAfterLogoutHook();

    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "better-auth.session_token") {
        return { name, value: "token.sig" };
      }
      return undefined;
    });

    mockPayloadAuth.find.mockResolvedValue({
      docs: [{ id: "session-1", token: "token" }]
    });
    mockPayloadAuth.delete.mockRejectedValue(new Error("Delete failed"));

    // Should not crash even if delete throws (empty catch block)
    await expect(
      hook({
        req: {
          payload: { config: {}, collections: {} }
        }
      } as any)
    ).resolves.not.toThrow();
  });

  it("sets secure flag when deleting __Secure- prefixed cookies", async () => {
    const hook = getAfterLogoutHook();

    mockCookieStore.get.mockImplementation((name: string) => {
      if (name.startsWith("__Secure-")) {
        return { name, value: "val" };
      }
      if (name === "better-auth.session_token") {
        return { name, value: "token.sig" };
      }
      return undefined;
    });

    await hook({
      req: {
        payload: { config: {}, collections: {} }
      }
    } as any);

    const secureCalls = mockCookieStore.set.mock.calls.filter(
      (call: any[]) => typeof call[0] === "string" && call[0].startsWith("__Secure-")
    );

    secureCalls.forEach((call: any[]) => {
      // Third argument is options — should include secure: true
      expect(call[2]).toHaveProperty("secure", true);
    });
  });
});
