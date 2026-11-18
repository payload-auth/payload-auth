import type { BetterAuthOptions } from "better-auth";
import type { BasePayload } from "payload";
import { describe, expect, it } from "vitest";
import { createTransform } from "../../adapter/transform/index";
import { baModelKey, supportedBAPluginIds } from "../../plugin/constants";
import { getDefaultBetterAuthSchema } from "../../plugin/helpers/get-better-auth-schema";
import { buildCollections } from "../../plugin/lib/build-collections/index";
import { buildOauthAccessTokensCollection } from "../../plugin/lib/build-collections/oauth-access-tokens";
import { buildOauthClientsCollection } from "../../plugin/lib/build-collections/oauth-clients";
import { buildOauthConsentsCollection } from "../../plugin/lib/build-collections/oauth-consents";
import { buildOauthRefreshTokensCollection } from "../../plugin/lib/build-collections/oauth-refresh-tokens";
import { configureOauthProviderPlugin } from "../../plugin/lib/sanitize-better-auth-options/oauth-provider-plugin";
import type { BetterAuthSchemas, PayloadAuthOptions } from "../../plugin/types";

/**
 * Unit tests for `@better-auth/oauth-provider` support.
 *
 * The plugin schemas below are copies of the ones declared by
 * `@better-auth/oauth-provider@1.6.25` (`src/schema.ts`) and
 * `better-auth@1.6.25` (`plugins/oidc-provider/schema.ts`). Using fixtures keeps
 * these tests free of a database and of the plugins' runtime dependencies;
 * `getAuthTables()` only reads `plugin.id` and `plugin.schema`.
 */

function oauthProviderPlugin(): any {
  return {
    id: "oauth-provider",
    schema: {
      oauthClient: {
        modelName: "oauthClient",
        fields: {
          clientId: { type: "string", unique: true, required: true },
          clientSecret: { type: "string", required: false },
          disabled: { type: "boolean", defaultValue: false, required: false },
          skipConsent: { type: "boolean", required: false },
          enableEndSession: { type: "boolean", required: false },
          subjectType: { type: "string", required: false },
          scopes: { type: "string[]", required: false },
          userId: {
            type: "string",
            required: false,
            references: { model: "user", field: "id" },
            index: true
          },
          createdAt: { type: "date", required: false },
          updatedAt: { type: "date", required: false },
          name: { type: "string", required: false },
          uri: { type: "string", required: false },
          icon: { type: "string", required: false },
          contacts: { type: "string[]", required: false },
          tos: { type: "string", required: false },
          policy: { type: "string", required: false },
          softwareId: { type: "string", required: false },
          softwareVersion: { type: "string", required: false },
          softwareStatement: { type: "string", required: false },
          redirectUris: { type: "string[]", required: true },
          postLogoutRedirectUris: { type: "string[]", required: false },
          tokenEndpointAuthMethod: { type: "string", required: false },
          grantTypes: { type: "string[]", required: false },
          responseTypes: { type: "string[]", required: false },
          public: { type: "boolean", required: false },
          type: { type: "string", required: false },
          requirePKCE: { type: "boolean", required: false },
          referenceId: { type: "string", required: false },
          metadata: { type: "json", required: false }
        }
      },
      oauthRefreshToken: {
        fields: {
          token: { type: "string", required: true, unique: true },
          clientId: {
            type: "string",
            required: true,
            references: { model: "oauthClient", field: "clientId" },
            index: true
          },
          sessionId: {
            type: "string",
            required: false,
            references: { model: "session", field: "id", onDelete: "set null" },
            index: true
          },
          userId: {
            type: "string",
            required: true,
            references: { model: "user", field: "id" },
            index: true
          },
          referenceId: { type: "string", required: false },
          expiresAt: { type: "date" },
          createdAt: { type: "date" },
          revoked: { type: "date", required: false },
          authTime: { type: "date", required: false },
          scopes: { type: "string[]", required: true }
        }
      },
      oauthAccessToken: {
        modelName: "oauthAccessToken",
        fields: {
          token: { type: "string", unique: true },
          clientId: {
            type: "string",
            required: true,
            references: { model: "oauthClient", field: "clientId" },
            index: true
          },
          sessionId: {
            type: "string",
            required: false,
            references: { model: "session", field: "id", onDelete: "set null" },
            index: true
          },
          userId: {
            type: "string",
            required: false,
            references: { model: "user", field: "id" },
            index: true
          },
          referenceId: { type: "string", required: false },
          refreshId: {
            type: "string",
            required: false,
            references: { model: "oauthRefreshToken", field: "id" },
            index: true
          },
          expiresAt: { type: "date" },
          createdAt: { type: "date" },
          scopes: { type: "string[]", required: true }
        }
      },
      oauthConsent: {
        modelName: "oauthConsent",
        fields: {
          clientId: {
            type: "string",
            required: true,
            references: { model: "oauthClient", field: "clientId" },
            index: true
          },
          userId: {
            type: "string",
            required: false,
            references: { model: "user", field: "id" },
            index: true
          },
          referenceId: { type: "string", required: false },
          scopes: { type: "string[]", required: true },
          createdAt: { type: "date" },
          updatedAt: { type: "date" }
        }
      }
    }
  };
}

function oidcProviderPlugin(): any {
  return {
    id: "oidc-provider",
    schema: {
      oauthApplication: {
        modelName: "oauthApplication",
        fields: {
          name: { type: "string" },
          icon: { type: "string", required: false },
          metadata: { type: "string", required: false },
          clientId: { type: "string", unique: true },
          clientSecret: { type: "string", required: false },
          redirectUrls: { type: "string" },
          type: { type: "string" },
          disabled: { type: "boolean", required: false, defaultValue: false },
          userId: {
            type: "string",
            required: false,
            references: { model: "user", field: "id", onDelete: "cascade" },
            index: true
          },
          createdAt: { type: "date" },
          updatedAt: { type: "date" }
        }
      },
      oauthAccessToken: {
        modelName: "oauthAccessToken",
        fields: {
          accessToken: { type: "string", unique: true },
          refreshToken: { type: "string", unique: true },
          accessTokenExpiresAt: { type: "date" },
          refreshTokenExpiresAt: { type: "date" },
          clientId: {
            type: "string",
            references: {
              model: "oauthApplication",
              field: "clientId",
              onDelete: "cascade"
            },
            index: true
          },
          userId: {
            type: "string",
            required: false,
            references: { model: "user", field: "id", onDelete: "cascade" },
            index: true
          },
          scopes: { type: "string" },
          createdAt: { type: "date" },
          updatedAt: { type: "date" }
        }
      },
      oauthConsent: {
        modelName: "oauthConsent",
        fields: {
          clientId: {
            type: "string",
            references: {
              model: "oauthApplication",
              field: "clientId",
              onDelete: "cascade"
            },
            index: true
          },
          userId: {
            type: "string",
            references: { model: "user", field: "id", onDelete: "cascade" },
            index: true
          },
          scopes: { type: "string" },
          createdAt: { type: "date" },
          updatedAt: { type: "date" },
          consentGiven: { type: "boolean" }
        }
      }
    }
  };
}

function makePluginOptions(plugin: any): PayloadAuthOptions {
  return { betterAuthOptions: { plugins: [plugin] } as BetterAuthOptions };
}

function getFields(collection: { fields: unknown }): any[] {
  return collection.fields as any[];
}

function getField(collection: { fields: unknown }, name: string): any {
  return getFields(collection).find((f) => f.name === name);
}

function getFieldByKey(collection: { fields: unknown }, key: string): any {
  return getFields(collection).find(
    (f) => f.custom?.betterAuthFieldKey === key
  );
}

describe("oauth-provider plugin id", () => {
  it("is registered under the id the plugin declares", () => {
    expect(supportedBAPluginIds.oauthProvider).toBe("oauth-provider");
    expect(oauthProviderPlugin().id).toBe(supportedBAPluginIds.oauthProvider);
  });
});

describe("getDefaultBetterAuthSchema (oauth-provider)", () => {
  function resolve(): BetterAuthSchemas {
    return getDefaultBetterAuthSchema(makePluginOptions(oauthProviderPlugin()));
  }

  it("resolves all four oauth-provider models with their default slugs", () => {
    const schemas = resolve();
    expect(schemas[baModelKey.oauthClient].modelName).toBe("oauthClients");
    expect(schemas[baModelKey.oauthRefreshToken].modelName).toBe(
      "oauthRefreshTokens"
    );
    expect(schemas[baModelKey.oauthAccessToken].modelName).toBe(
      "oauthAccessTokens"
    );
    expect(schemas[baModelKey.oauthConsent].modelName).toBe("oauthConsents");
  });

  it("does not resolve the oidc-only oauthApplication model", () => {
    expect((resolve() as any)[baModelKey.oauthApplication]).toBeUndefined();
  });

  it("maps userId to a `user` relationship on every oauth-provider model", () => {
    const schemas = resolve();
    for (const model of [
      baModelKey.oauthClient,
      baModelKey.oauthRefreshToken,
      baModelKey.oauthAccessToken,
      baModelKey.oauthConsent
    ] as const) {
      const field = (schemas[model].fields as any).userId;
      expect(field.fieldName).toBe("user");
      expect(field.references.model).toBe("users");
    }
  });

  it("maps sessionId to a `session` relationship and refreshId to a `refresh` relationship", () => {
    const schemas = resolve();
    for (const model of [
      baModelKey.oauthRefreshToken,
      baModelKey.oauthAccessToken
    ] as const) {
      const field = (schemas[model].fields as any).sessionId;
      expect(field.fieldName).toBe("session");
      expect(field.references.model).toBe("sessions");
    }
    const refreshId = (schemas[baModelKey.oauthAccessToken].fields as any)
      .refreshId;
    expect(refreshId.fieldName).toBe("refresh");
    expect(refreshId.references.model).toBe("oauthRefreshTokens");
  });

  it("keeps clientId as plain text (no relationship) on token and consent models", () => {
    const schemas = resolve();
    for (const model of [
      baModelKey.oauthRefreshToken,
      baModelKey.oauthAccessToken,
      baModelKey.oauthConsent
    ] as const) {
      const field = (schemas[model].fields as any).clientId;
      expect(field.fieldName).toBe("clientId");
      expect(field.references).toBeUndefined();
    }
  });
});

describe("configureOauthProviderPlugin", () => {
  function configure() {
    const plugin = oauthProviderPlugin();
    const schemas = getDefaultBetterAuthSchema(makePluginOptions(plugin));
    configureOauthProviderPlugin(plugin, schemas);
    return plugin;
  }

  it("sets modelName for the four models", () => {
    const plugin = configure();
    expect(plugin.schema.oauthClient.modelName).toBe("oauthClients");
    expect(plugin.schema.oauthRefreshToken.modelName).toBe(
      "oauthRefreshTokens"
    );
    expect(plugin.schema.oauthAccessToken.modelName).toBe("oauthAccessTokens");
    expect(plugin.schema.oauthConsent.modelName).toBe("oauthConsents");
  });

  it("points user, session and refresh references at the resolved slugs", () => {
    const plugin = configure();
    const s = plugin.schema;
    expect(s.oauthClient.fields.userId.fieldName).toBe("user");
    expect(s.oauthClient.fields.userId.references.model).toBe("users");
    expect(s.oauthRefreshToken.fields.userId.references.model).toBe("users");
    expect(s.oauthRefreshToken.fields.sessionId.fieldName).toBe("session");
    expect(s.oauthRefreshToken.fields.sessionId.references.model).toBe(
      "sessions"
    );
    expect(s.oauthAccessToken.fields.userId.references.model).toBe("users");
    expect(s.oauthAccessToken.fields.sessionId.references.model).toBe(
      "sessions"
    );
    expect(s.oauthAccessToken.fields.refreshId.fieldName).toBe("refresh");
    expect(s.oauthAccessToken.fields.refreshId.references.model).toBe(
      "oauthRefreshTokens"
    );
    expect(s.oauthConsent.fields.userId.references.model).toBe("users");
  });

  it("removes the clientId natural-key reference so it is not a relationship", () => {
    const plugin = configure();
    for (const model of [
      "oauthRefreshToken",
      "oauthAccessToken",
      "oauthConsent"
    ]) {
      expect(plugin.schema[model].fields.clientId.references).toBeUndefined();
      expect(plugin.schema[model].fields.clientId.fieldName).toBe("clientId");
    }
  });

  it("follows custom collection slugs from the resolved schemas", () => {
    const plugin = oauthProviderPlugin();
    const schemas = getDefaultBetterAuthSchema(makePluginOptions(plugin));
    (schemas as any)[baModelKey.user].modelName = "my-users";
    (schemas as any)[baModelKey.session].modelName = "my-sessions";
    (schemas as any)[baModelKey.oauthClient].modelName = "my-clients";
    (schemas as any)[baModelKey.oauthRefreshToken].modelName = "my-refresh";

    configureOauthProviderPlugin(plugin, schemas);

    expect(plugin.schema.oauthClient.modelName).toBe("my-clients");
    expect(plugin.schema.oauthRefreshToken.modelName).toBe("my-refresh");
    expect(plugin.schema.oauthClient.fields.userId.references.model).toBe(
      "my-users"
    );
    expect(
      plugin.schema.oauthRefreshToken.fields.sessionId.references.model
    ).toBe("my-sessions");
    expect(
      plugin.schema.oauthAccessToken.fields.refreshId.references.model
    ).toBe("my-refresh");
  });
});

describe("oauth-provider collections", () => {
  function setup() {
    const pluginOptions = makePluginOptions(oauthProviderPlugin());
    const resolvedSchemas = getDefaultBetterAuthSchema(pluginOptions);
    const props = { incomingCollections: [], pluginOptions, resolvedSchemas };
    return { props, resolvedSchemas, pluginOptions };
  }

  it("builds oauthClients with array, json, unique and required fields mapped", () => {
    const { props } = setup();
    const collection = buildOauthClientsCollection(props);

    expect(collection.slug).toBe("oauthClients");
    expect(collection.custom?.betterAuthModelKey).toBe("oauthClient");
    expect(collection.admin?.useAsTitle).toBe("clientId");

    const clientId = getField(collection, "clientId");
    expect(clientId.type).toBe("text");
    expect(clientId.unique).toBe(true);
    expect(clientId.required).toBe(true);

    const redirectUris = getField(collection, "redirectUris");
    expect(redirectUris.type).toBe("text");
    expect(redirectUris.hasMany).toBe(true);
    expect(redirectUris.required).toBe(true);

    for (const name of [
      "scopes",
      "contacts",
      "postLogoutRedirectUris",
      "grantTypes",
      "responseTypes"
    ]) {
      const field = getField(collection, name);
      expect(field.type).toBe("text");
      expect(field.hasMany).toBe(true);
      expect(field.required).toBeUndefined();
    }

    expect(getField(collection, "metadata").type).toBe("json");

    for (const name of [
      "disabled",
      "skipConsent",
      "enableEndSession",
      "public",
      "requirePKCE"
    ]) {
      expect(getField(collection, name).type).toBe("checkbox");
    }
    expect(getField(collection, "disabled").defaultValue).toBe(false);

    const user = getField(collection, "user");
    expect(user.type).toBe("relationship");
    expect(user.relationTo).toBe("users");
    expect(user.custom.betterAuthFieldKey).toBe("userId");
  });

  it("builds oauthClients with every schema field present (assertAllSchemaFields)", () => {
    const { props, resolvedSchemas } = setup();
    const collection = buildOauthClientsCollection(props);
    for (const key of Object.keys(
      resolvedSchemas[baModelKey.oauthClient].fields
    )) {
      expect(getFieldByKey(collection, key)).toBeDefined();
    }
  });

  it("builds oauthRefreshTokens with relationships and plain-text clientId", () => {
    const { props } = setup();
    const collection = buildOauthRefreshTokensCollection(props);

    expect(collection.slug).toBe("oauthRefreshTokens");
    expect(collection.custom?.betterAuthModelKey).toBe("oauthRefreshToken");

    const token = getField(collection, "token");
    expect(token.type).toBe("text");
    expect(token.unique).toBe(true);
    expect(token.required).toBe(true);

    const clientId = getField(collection, "clientId");
    expect(clientId.type).toBe("text");
    expect(clientId.required).toBe(true);
    expect(clientId.index).toBe(true);

    const session = getField(collection, "session");
    expect(session.type).toBe("relationship");
    expect(session.relationTo).toBe("sessions");
    expect(session.custom.betterAuthFieldKey).toBe("sessionId");

    const user = getField(collection, "user");
    expect(user.type).toBe("relationship");
    expect(user.relationTo).toBe("users");
    expect(user.required).toBe(true);

    const scopes = getField(collection, "scopes");
    expect(scopes.type).toBe("text");
    expect(scopes.hasMany).toBe(true);
    expect(scopes.required).toBe(true);

    for (const name of ["expiresAt", "revoked", "authTime"]) {
      expect(getField(collection, name).type).toBe("date");
    }
  });

  it("builds oauthAccessTokens for oauth-provider (token title, session/refresh relationships)", () => {
    const { props } = setup();
    const collection = buildOauthAccessTokensCollection(props);

    expect(collection.slug).toBe("oauthAccessTokens");
    expect(collection.admin?.useAsTitle).toBe("token");
    expect(getField(collection, "token").unique).toBe(true);

    const clientId = getField(collection, "clientId");
    expect(clientId.type).toBe("text");
    expect(clientId.index).toBe(true);

    expect(getField(collection, "session").relationTo).toBe("sessions");
    const refresh = getField(collection, "refresh");
    expect(refresh.type).toBe("relationship");
    expect(refresh.relationTo).toBe("oauthRefreshTokens");
    expect(refresh.custom.betterAuthFieldKey).toBe("refreshId");

    const scopes = getField(collection, "scopes");
    expect(scopes.hasMany).toBe(true);
    expect(scopes.admin.description).toBe("Scopes granted");
  });

  it("builds oauthConsents for oauth-provider (array scopes, plain-text clientId)", () => {
    const { props } = setup();
    const collection = buildOauthConsentsCollection(props);

    expect(collection.slug).toBe("oauthConsents");
    const clientId = getField(collection, "clientId");
    expect(clientId.type).toBe("text");
    expect(clientId.index).toBe(true);
    expect(getField(collection, "scopes").hasMany).toBe(true);
    expect(getField(collection, "referenceId").type).toBe("text");
    expect(getField(collection, "consentGiven")).toBeUndefined();
  });

  it("buildCollections generates the four oauth-provider collections and no oauthApplications", () => {
    const { pluginOptions, resolvedSchemas } = setup();
    const map = buildCollections({
      incomingCollections: [],
      pluginOptions,
      resolvedSchemas
    });

    expect(map.oauthClients).toBeDefined();
    expect(map.oauthRefreshTokens).toBeDefined();
    expect(map.oauthAccessTokens).toBeDefined();
    expect(map.oauthConsents).toBeDefined();
    expect(map.oauthApplications).toBeUndefined();
  });

  it("honors pluginCollectionOverrides for the new collections", () => {
    const { resolvedSchemas } = setup();
    const pluginOptions: PayloadAuthOptions = {
      ...makePluginOptions(oauthProviderPlugin()),
      hidePluginCollections: true,
      pluginCollectionOverrides: {
        oauthClients: ({ collection }) => ({
          ...collection,
          labels: { singular: "Client", plural: "Clients" }
        }),
        oauthRefreshTokens: ({ collection }) => ({
          ...collection,
          labels: { singular: "Refresh", plural: "Refreshes" }
        })
      }
    };
    const props = { incomingCollections: [], pluginOptions, resolvedSchemas };

    const clients = buildOauthClientsCollection(props);
    const refresh = buildOauthRefreshTokensCollection(props);
    expect(clients.labels).toEqual({ singular: "Client", plural: "Clients" });
    expect(refresh.labels).toEqual({
      singular: "Refresh",
      plural: "Refreshes"
    });
    expect(clients.admin?.hidden).toBe(true);
    expect(refresh.admin?.hidden).toBe(true);
  });
});

describe("oidc-provider collections (unchanged)", () => {
  function setup() {
    const pluginOptions = makePluginOptions(oidcProviderPlugin());
    const resolvedSchemas = getDefaultBetterAuthSchema(pluginOptions);
    const props = { incomingCollections: [], pluginOptions, resolvedSchemas };
    return { props, resolvedSchemas, pluginOptions };
  }

  it("still generates oauthApplications/oauthAccessTokens/oauthConsents and none of the new collections", () => {
    const { pluginOptions, resolvedSchemas } = setup();
    const map = buildCollections({
      incomingCollections: [],
      pluginOptions,
      resolvedSchemas
    });

    expect(map.oauthApplications).toBeDefined();
    expect(map.oauthAccessTokens).toBeDefined();
    expect(map.oauthConsents).toBeDefined();
    expect(map.oauthClients).toBeUndefined();
    expect(map.oauthRefreshTokens).toBeUndefined();
  });

  it("keeps clientId as a `client` relationship to oauthApplications", () => {
    const { props, resolvedSchemas } = setup();
    const accessField = (
      resolvedSchemas[baModelKey.oauthAccessToken].fields as any
    ).clientId;
    expect(accessField.fieldName).toBe("client");
    expect(accessField.references.model).toBe("oauthApplications");

    const tokens = buildOauthAccessTokensCollection(props);
    const client = getField(tokens, "client");
    expect(client.type).toBe("relationship");
    expect(client.relationTo).toBe("oauthApplications");
    expect(client.index).toBeUndefined();

    const consents = buildOauthConsentsCollection(props);
    const consentClient = getField(consents, "client");
    expect(consentClient.type).toBe("relationship");
    expect(consentClient.relationTo).toBe("oauthApplications");
  });

  it("keeps the accessToken title and comma-separated scopes text", () => {
    const { props } = setup();
    const tokens = buildOauthAccessTokensCollection(props);
    expect(tokens.admin?.useAsTitle).toBe("accessToken");
    const scopes = getField(tokens, "scopes");
    expect(scopes.type).toBe("text");
    expect(scopes.hasMany).toBeUndefined();
    expect(scopes.admin.description).toBe(
      "Comma-separated list of scopes granted"
    );
    expect(getField(tokens, "session")).toBeUndefined();
    expect(getField(tokens, "refresh")).toBeUndefined();
  });

  it("is not configured by the oauth-provider configurator id", () => {
    expect(oidcProviderPlugin().id).not.toBe(
      supportedBAPluginIds.oauthProvider
    );
  });
});

describe("adapter transform with oauth-provider", () => {
  function mockCollection(slug: string, modelKey: string, fields: any[]) {
    return {
      config: { slug, custom: { betterAuthModelKey: modelKey }, fields }
    };
  }

  function setup() {
    const plugin = oauthProviderPlugin();
    const schemas = getDefaultBetterAuthSchema(makePluginOptions(plugin));
    configureOauthProviderPlugin(plugin, schemas);

    const options = {
      database: { type: "sqlite", url: ":memory:" },
      baseURL: "http://localhost:3000",
      user: { modelName: "users" },
      session: { modelName: "sessions" },
      account: { modelName: "accounts" },
      plugins: [plugin]
    } as unknown as BetterAuthOptions;

    const payload = {
      collections: {
        oauthAccessTokens: mockCollection(
          "oauthAccessTokens",
          "oauthAccessToken",
          [
            { name: "id", type: "number" },
            {
              name: "token",
              type: "text",
              custom: { betterAuthFieldKey: "token" }
            },
            {
              name: "clientId",
              type: "text",
              custom: { betterAuthFieldKey: "clientId" }
            },
            {
              name: "session",
              type: "relationship",
              relationTo: "sessions",
              custom: { betterAuthFieldKey: "sessionId" }
            },
            {
              name: "user",
              type: "relationship",
              relationTo: "users",
              custom: { betterAuthFieldKey: "userId" }
            },
            {
              name: "scopes",
              type: "text",
              hasMany: true,
              custom: { betterAuthFieldKey: "scopes" }
            }
          ]
        )
      }
    } as unknown as BasePayload;

    return { transform: createTransform(options, false), payload };
  }

  it("leaves a numeric-looking public clientId as text but casts relationship ids", () => {
    const { transform, payload } = setup();

    const result = transform.transformInput({
      data: {
        clientId: "12345",
        sessionId: "7",
        userId: "9",
        scopes: ["openid", "offline_access"]
      },
      model: "oauthAccessToken" as any,
      idType: "number",
      payload
    });

    // clientId is the public client_id string, never a Payload document id
    expect(result.clientId).toBe("12345");
    // relationship ids follow the database id type
    expect(result.session).toBe(7);
    expect(result.user).toBe(9);
    expect(result.scopes).toEqual(["openid", "offline_access"]);
  });
});
