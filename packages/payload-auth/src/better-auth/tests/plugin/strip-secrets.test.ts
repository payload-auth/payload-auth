import type { CollectionConfig, Config } from "payload";
import { describe, expect, it } from "vitest";
import { applyBetterAuthAdminConfig } from "../../plugin/lib/apply-ba-admin-config";
import { stripSecretsFromPluginOptions } from "../../plugin/lib/strip-secrets";
import type { BetterAuthSchemas, PayloadAuthOptions } from "../../plugin/types";

const SECRET_SENTINEL = "test-secret-leak-sentinel";
const CLIENT_SECRET_SENTINEL = "test-client-secret-sentinel";
const APPLE_SECRET_SENTINEL = "test-apple-client-secret-sentinel";
const CLIENT_ID_SENTINEL = "test-client-id-should-survive";

const baseCollectionMap: Record<string, CollectionConfig> = {
  "admin-invitations": {
    slug: "admin-invitations",
    fields: []
  }
};

const baseSchemas = {
  verification: { modelName: "verifications" }
} as unknown as BetterAuthSchemas;

function buildPluginOptions(): PayloadAuthOptions {
  return {
    betterAuthOptions: {
      secret: SECRET_SENTINEL,
      socialProviders: {
        google: {
          clientId: CLIENT_ID_SENTINEL,
          clientSecret: CLIENT_SECRET_SENTINEL
        },
        apple: {
          clientId: "apple-client-id",
          clientSecret: APPLE_SECRET_SENTINEL
        }
      }
    }
  } as PayloadAuthOptions;
}

describe("stripSecretsFromPluginOptions", () => {
  it("removes betterAuthOptions.secret", () => {
    const stripped = stripSecretsFromPluginOptions(buildPluginOptions());
    expect(
      (stripped.betterAuthOptions as Record<string, unknown>)?.secret
    ).toBeUndefined();
  });

  it("removes clientSecret from every social provider", () => {
    const stripped = stripSecretsFromPluginOptions(buildPluginOptions());
    const providers = stripped.betterAuthOptions?.socialProviders ?? {};
    for (const [, cfg] of Object.entries(providers)) {
      expect((cfg as Record<string, unknown>)?.clientSecret).toBeUndefined();
    }
  });

  it("preserves clientId (public, required to render OAuth buttons)", () => {
    const stripped = stripSecretsFromPluginOptions(buildPluginOptions());
    const google = stripped.betterAuthOptions?.socialProviders?.google as
      | Record<string, unknown>
      | undefined;
    expect(google?.clientId).toBe(CLIENT_ID_SENTINEL);
  });

  it("does not mutate the input", () => {
    const input = buildPluginOptions();
    stripSecretsFromPluginOptions(input);
    expect(
      (input.betterAuthOptions as Record<string, unknown>)?.secret
    ).toBe(SECRET_SENTINEL);
    const google = input.betterAuthOptions?.socialProviders?.google as
      | Record<string, unknown>
      | undefined;
    expect(google?.clientSecret).toBe(CLIENT_SECRET_SENTINEL);
  });

  it("handles pluginOptions without betterAuthOptions", () => {
    const stripped = stripSecretsFromPluginOptions(
      {} as unknown as PayloadAuthOptions
    );
    expect(stripped).toEqual({});
  });

  it("handles betterAuthOptions without socialProviders", () => {
    const stripped = stripSecretsFromPluginOptions({
      betterAuthOptions: { secret: SECRET_SENTINEL }
    } as unknown as PayloadAuthOptions);
    expect(
      (stripped.betterAuthOptions as Record<string, unknown>)?.secret
    ).toBeUndefined();
  });
});

describe("applyBetterAuthAdminConfig — serverProps do not leak secrets", () => {
  it("serialized config.admin contains no secret or clientSecret sentinels", () => {
    const config: Config = {} as Config;
    applyBetterAuthAdminConfig({
      config,
      pluginOptions: buildPluginOptions(),
      collectionMap: baseCollectionMap,
      resolvedBetterAuthSchemas: baseSchemas
    });

    const serialized = JSON.stringify(config.admin);
    expect(serialized).not.toContain(SECRET_SENTINEL);
    expect(serialized).not.toContain(CLIENT_SECRET_SENTINEL);
    expect(serialized).not.toContain(APPLE_SECRET_SENTINEL);
    // Sanity: clientId must survive — the login UI needs it.
    expect(serialized).toContain(CLIENT_ID_SENTINEL);
  });

  it("does not mutate the secrets on the caller's pluginOptions", () => {
    const pluginOptions = buildPluginOptions();
    applyBetterAuthAdminConfig({
      config: {} as Config,
      pluginOptions,
      collectionMap: baseCollectionMap,
      resolvedBetterAuthSchemas: baseSchemas
    });

    expect(
      (pluginOptions.betterAuthOptions as Record<string, unknown>)?.secret
    ).toBe(SECRET_SENTINEL);
    const google = pluginOptions.betterAuthOptions?.socialProviders?.google as
      | Record<string, unknown>
      | undefined;
    expect(google?.clientSecret).toBe(CLIENT_SECRET_SENTINEL);
  });
});
