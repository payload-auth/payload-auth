import { describe, expect, it, vi } from "vitest";

/**
 * The after-logout hook must not load `next/headers` until it runs, so the
 * plugin (which imports the hook through the users collection) can be loaded
 * outside Next.js.
 */

const { nextHeadersLoads, mockCookieStore } = vi.hoisted(() => ({
  nextHeadersLoads: { count: 0 },
  mockCookieStore: {
    get: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn()
  }
}));

vi.mock("next/headers", () => {
  nextHeadersLoads.count++;
  return { cookies: vi.fn().mockResolvedValue(mockCookieStore) };
});

vi.mock("@/better-auth/plugin/lib/get-payload-auth", () => ({
  getPayloadAuth: vi.fn().mockResolvedValue({
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
  })
}));

vi.mock("@/better-auth/plugin/helpers/get-collection", () => ({
  getCollectionByModelKey: vi.fn().mockReturnValue({ slug: "sessions" })
}));

describe("getAfterLogoutHook loading next/headers", () => {
  it("does not load next/headers when the hook module is imported", async () => {
    await import("../../plugin/lib/build-collections/users/hooks/after-logout");

    expect(nextHeadersLoads.count).toBe(0);
  });

  it("loads next/headers when the hook runs", async () => {
    const { getAfterLogoutHook } = await import(
      "../../plugin/lib/build-collections/users/hooks/after-logout"
    );

    await getAfterLogoutHook()({
      req: { payload: { config: {}, collections: {} } }
    } as any);

    expect(nextHeadersLoads.count).toBe(1);
  });
});
