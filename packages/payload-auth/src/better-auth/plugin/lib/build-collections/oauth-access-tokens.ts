import type { CollectionConfig } from "payload";
import type { OauthAccessToken } from "@/better-auth/generated-types";
import type {
  BuildCollectionProps,
  FieldOverrides,
  FieldRule
} from "@/better-auth/plugin/types";
import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

export function buildOauthAccessTokensCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const oauthAccessTokenSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.oauthAccessToken
  );
  const oauthAccessTokenSchema = resolvedSchemas[baModelKey.oauthAccessToken];

  const existingOauthAccessTokenCollection = incomingCollections.find(
    (collection) => collection.slug === oauthAccessTokenSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof OauthAccessToken> = {
    accessToken: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "Access token issued to the client"
      }
    }),
    refreshToken: () => ({
      admin: {
        readOnly: true,
        description: "Refresh token issued to the client"
      }
    }),
    accessTokenExpiresAt: () => ({
      admin: {
        readOnly: true,
        description: "Expiration date of the access token"
      }
    }),
    refreshTokenExpiresAt: () => ({
      admin: {
        readOnly: true,
        description: "Expiration date of the refresh token"
      }
    }),
    clientId: (field) => ({
      // oauth-provider stores the public client_id string as plain text
      // (no relationship), so index it for lookups.
      ...(!field.references && { index: true }),
      admin: {
        readOnly: true,
        description: field.references
          ? "OAuth application associated with the access token"
          : "client_id of the OAuth client the token was issued to"
      }
    }),
    userId: () => ({
      admin: {
        readOnly: true,
        description: "User associated with the access token"
      }
    }),
    scopes: (field) => ({
      admin: {
        description:
          field.type === "string[]"
            ? "Scopes granted"
            : "Comma-separated list of scopes granted"
      }
    }),
    // ---- oauth-provider (@better-auth/oauth-provider) fields ----
    token: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "Opaque access token (stored hashed by default)"
      }
    }),
    sessionId: () => ({
      admin: {
        readOnly: true,
        description: "Session the access token is linked to"
      }
    }),
    referenceId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description:
          "Opaque reference to the owning entity (e.g. organization id)"
      }
    }),
    refreshId: () => ({
      admin: {
        readOnly: true,
        description: "Refresh token this access token was issued with"
      }
    }),
    expiresAt: () => ({
      admin: {
        readOnly: true,
        description: "Expiration date of the access token"
      }
    })
  };

  const oauthAccessTokenFieldRules: FieldRule[] = [
    {
      condition: (field) =>
        field.fieldName === "createdAt" || field.fieldName === "updatedAt",
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: ({ t }: any) =>
          field.fieldName === "createdAt"
            ? t("general:createdAt")
            : t("general:updatedAt")
      })
    }
  ];

  const collectionFields = getCollectionFields({
    schema: oauthAccessTokenSchema,
    fieldRules: oauthAccessTokenFieldRules,
    additionalProperties: fieldOverrides
  });

  let oauthAccessTokenCollection: CollectionConfig = {
    ...existingOauthAccessTokenCollection,
    slug: oauthAccessTokenSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      // oidc-provider / mcp store `accessToken`; oauth-provider stores `token`
      useAsTitle: oauthAccessTokenSchema?.fields?.accessToken
        ? getSchemaFieldName(
            resolvedSchemas,
            baModelKey.oauthAccessToken,
            "accessToken"
          )
        : getSchemaFieldName(
            resolvedSchemas,
            baModelKey.oauthAccessToken,
            "token"
          ),
      description: "OAuth access tokens for custom OAuth clients",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingOauthAccessTokenCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOauthAccessTokenCollection?.access ?? {})
    },
    custom: {
      ...(existingOauthAccessTokenCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.oauthAccessToken
    },
    fields: [
      ...(existingOauthAccessTokenCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.oauthAccessTokens ===
    "function"
  ) {
    oauthAccessTokenCollection =
      pluginOptions.pluginCollectionOverrides.oauthAccessTokens({
        collection: oauthAccessTokenCollection
      });
  }

  assertAllSchemaFields(oauthAccessTokenCollection, oauthAccessTokenSchema);

  return oauthAccessTokenCollection;
}
