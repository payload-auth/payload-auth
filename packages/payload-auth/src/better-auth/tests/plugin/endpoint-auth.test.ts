import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHelpers } from "better-auth/plugins";
import { getGenerateInviteUrlEndpoint } from "../../plugin/lib/build-collections/users/endpoints/generate-invite-url";
import { getSendInviteUrlEndpoint } from "../../plugin/lib/build-collections/users/endpoints/send-invite-url";
import { betterAuthPluginOptions } from "../dev";
import { getTestContext } from "../helpers";

/**
 * Integration tests for endpoint authentication (P0-3 regression).
 * Verifies that admin invite endpoints require authentication and admin role.
 *
 * Uses testUtils for fast user creation (no signup/signin round-trip).
 *
 * Requires a running Postgres database.
 */
describe("Endpoint Authentication (P0-3 Integration)", async () => {
  const { payload, test } = await getTestContext();

  const roles = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" }
  ];

  const generateInviteEndpoint = getGenerateInviteUrlEndpoint({
    roles,
    pluginOptions: betterAuthPluginOptions
  });

  const sendInviteEndpoint = getSendInviteUrlEndpoint(betterAuthPluginOptions);

  let regularUser: any;

  /**
   * Helper to create a mock PayloadRequest that extends a real Request object.
   */
  function createMockReq(
    options: { body?: any; user?: any; headers?: Headers } = {}
  ) {
    const baseRequest = new Request("http://localhost:3000/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    return Object.assign(baseRequest, {
      payload,
      user: options.user ?? undefined,
      t: ((key: string) => key) as any,
      locale: "en",
      fallbackLocale: "en",
      i18n: { t: (key: string) => key } as any,
      context: {} as any,
      payloadAPI: "REST" as const,
      routeParams: {} as any,
      query: {},
      file: undefined,
      data: undefined
    }) as any;
  }

  beforeAll(async () => {
    // Create a regular (non-admin) user directly via testUtils
    const user = await test.saveUser(
      test.createUser({
        email: "endpoint-auth-test@test.com",
        name: "Auth Test User"
      })
    );
    // Fetch full user from Payload so it has the right shape
    regularUser = await payload.findByID({
      collection: "users",
      id: user.id
    });
  });

  afterAll(async () => {
    await test.deleteUser(regularUser.id);
  });

  describe("generate-invite-url endpoint", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const req = createMockReq({
        body: { role: { label: "Admin", value: "admin" } }
      });

      const response = await generateInviteEndpoint.handler(req);
      expect(response.status).toBe(401);
    });

    it("rejects non-admin users with 403", async () => {
      const req = createMockReq({
        body: { role: { label: "Admin", value: "admin" } },
        user: regularUser
      });

      const response = await generateInviteEndpoint.handler(req);
      expect(response.status).toBe(403);
    });
  });

  describe("send-invite-url endpoint", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const req = createMockReq({
        body: {
          email: "target@test.com",
          link: "http://localhost:3000/invite?token=test"
        }
      });

      const response = await sendInviteEndpoint.handler(req);
      expect(response.status).toBe(401);
    });

    it("rejects non-admin users with 403", async () => {
      const req = createMockReq({
        body: {
          email: "target@test.com",
          link: "http://localhost:3000/invite?token=test"
        },
        user: regularUser
      });

      const response = await sendInviteEndpoint.handler(req);
      expect(response.status).toBe(403);
    });
  });
});
