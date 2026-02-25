import { describe, expect, it } from "vitest";
import { setLoginMethods } from "../lib/set-login-methods";
import type { PayloadAuthOptions } from "../types";

describe("setLoginMethods", () => {
  it("detects emailPassword when enabled", () => {
    const pluginOptions: PayloadAuthOptions = {
      betterAuthOptions: {
        emailAndPassword: { enabled: true }
      }
    };
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).toContain("emailPassword");
  });

  it("detects social providers", () => {
    const pluginOptions: PayloadAuthOptions = {
      betterAuthOptions: {
        socialProviders: {
          google: {
            clientId: "test-id",
            clientSecret: "test-secret"
          }
        }
      }
    };
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).toContain("google");
  });

  it("detects multiple social providers", () => {
    const pluginOptions: PayloadAuthOptions = {
      betterAuthOptions: {
        socialProviders: {
          google: { clientId: "id", clientSecret: "secret" },
          github: { clientId: "id", clientSecret: "secret" }
        }
      }
    };
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).toContain("google");
    expect(result.admin?.loginMethods).toContain("github");
  });

  it("returns empty login methods when nothing configured", () => {
    const pluginOptions: PayloadAuthOptions = {
      betterAuthOptions: {}
    };
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).toEqual([]);
  });

  it("preserves user-defined loginMethods without overriding", () => {
    const pluginOptions: PayloadAuthOptions = {
      admin: {
        loginMethods: ["emailPassword"]
      },
      betterAuthOptions: {
        socialProviders: {
          google: { clientId: "id", clientSecret: "secret" }
        }
      }
    };
    const result = setLoginMethods({ pluginOptions });
    // Should keep user-defined methods, not add detected ones
    expect(result.admin?.loginMethods).toEqual(["emailPassword"]);
  });

  it("handles missing betterAuthOptions gracefully", () => {
    const pluginOptions: PayloadAuthOptions = {};
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).toEqual([]);
  });

  // P1-5 FIX: emailAndPassword with enabled: false should NOT include emailPassword
  it("does NOT detect emailPassword when enabled is explicitly false", () => {
    const pluginOptions: PayloadAuthOptions = {
      betterAuthOptions: {
        emailAndPassword: { enabled: false }
      }
    };
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).not.toContain("emailPassword");
  });

  it("does NOT detect emailPassword when emailAndPassword object exists without enabled field", () => {
    const pluginOptions: PayloadAuthOptions = {
      betterAuthOptions: {
        emailAndPassword: {} as any
      }
    };
    const result = setLoginMethods({ pluginOptions });
    expect(result.admin?.loginMethods).not.toContain("emailPassword");
  });
});
