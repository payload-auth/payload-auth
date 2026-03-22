import { beforeAll, describe, expect, it } from "vitest";
import { getTestPayload } from "../helpers";

describe("Plugin Collection Configuration", () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>;

  beforeAll(async () => {
    payload = await getTestPayload();
  });

  describe("Core Collections Exist", () => {
    it.each(["users", "sessions", "accounts", "verifications"])(
      "should have the %s collection",
      (slug) => {
        expect(payload.collections[slug]).toBeDefined();
      }
    );
  });

  describe("Users Collection", () => {
    it("should have auth disabled (disableLocalStrategy)", () => {
      const config = payload.collections["users"].config;
      expect(config.auth).toBeTruthy();
      if (typeof config.auth === "object") {
        expect(config.auth.disableLocalStrategy).toBe(true);
      }
    });

    it("should have required base fields", () => {
      const config = payload.collections["users"].config;
      const fieldNames = config.fields
        .map((f: any) => f.name)
        .filter(Boolean);

      expect(fieldNames).toContain("name");
      expect(fieldNames).toContain("email");
      expect(fieldNames).toContain("emailVerified");
    });

    it("should have a role field", () => {
      const config = payload.collections["users"].config;
      const roleField = config.fields.find(
        (f: any) => f.name === "role"
      );
      expect(roleField).toBeDefined();
    });

    it("should have the admin plugin fields (banned, banReason)", () => {
      const config = payload.collections["users"].config;
      const fieldNames = config.fields
        .map((f: any) => f.name)
        .filter(Boolean);

      // admin() plugin adds these
      expect(fieldNames).toContain("banned");
      expect(fieldNames).toContain("banReason");
    });
  });

  describe("Sessions Collection", () => {
    it("should have a user relationship field", () => {
      const config = payload.collections["sessions"].config;
      const userField = config.fields.find(
        (f: any) => f.name === "user" || f.name === "userId"
      );
      expect(userField).toBeDefined();
    });

    it("should have token and expiresAt fields", () => {
      const config = payload.collections["sessions"].config;
      const fieldNames = config.fields
        .map((f: any) => f.name)
        .filter(Boolean);

      expect(fieldNames).toContain("token");
      expect(fieldNames).toContain("expiresAt");
    });

    it("should have admin plugin impersonatedBy field", () => {
      const config = payload.collections["sessions"].config;
      const fieldNames = config.fields
        .map((f: any) => f.name)
        .filter(Boolean);

      expect(fieldNames).toContain("impersonatedBy");
    });
  });

  describe("Accounts Collection", () => {
    it("should have provider and account ID fields", () => {
      const config = payload.collections["accounts"].config;
      const fieldNames = config.fields
        .map((f: any) => f.name)
        .filter(Boolean);

      expect(fieldNames).toContain("accountId");
      expect(fieldNames).toContain("providerId");
    });

    it("should have a user relationship", () => {
      const config = payload.collections["accounts"].config;
      const userField = config.fields.find(
        (f: any) => f.name === "user" || f.name === "userId"
      );
      expect(userField).toBeDefined();
    });
  });

  describe("Plugin Collections Visibility", () => {
    it("should respect hidePluginCollections for plugin-created collections", () => {
      // hidePluginCollections is true in test config
      // Plugin collections (not base schema) should be hidden
      const pluginSlugs = ["twoFactors", "passkeys", "apiKeys"] as const;
      for (const slug of pluginSlugs) {
        const config = payload.collections[slug]?.config;
        if (config) {
          expect(config.admin?.hidden).toBe(true);
        }
      }
    });

    it("should not hide base schema collections (users, sessions, accounts, verifications)", () => {
      // Base collections use their own per-collection hidden option, not hidePluginCollections
      const baseSlugs = ["users", "sessions", "accounts", "verifications"] as const;
      for (const slug of baseSlugs) {
        const config = payload.collections[slug]?.config;
        if (config) {
          // None of these have hidden explicitly set to true in the test config
          expect(config.admin?.hidden).not.toBe(true);
        }
      }
    });
  });

  describe("Better Auth Instance", () => {
    it("should have betterAuth attached to payload", () => {
      expect(payload.betterAuth).toBeDefined();
    });

    it("should have the handler function", () => {
      expect(payload.betterAuth.handler).toBeTypeOf("function");
    });

    it("should have the api object with endpoints", () => {
      expect(payload.betterAuth.api).toBeDefined();
      expect(payload.betterAuth.api.signUpEmail).toBeTypeOf("function");
      expect(payload.betterAuth.api.signInEmail).toBeTypeOf("function");
      expect(payload.betterAuth.api.getSession).toBeTypeOf("function");
    });
  });
});
