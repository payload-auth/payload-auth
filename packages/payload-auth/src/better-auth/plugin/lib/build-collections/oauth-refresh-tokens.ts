import type { CollectionConfig } from "payload";
import type { OauthRefreshToken } from "@/better-auth/generated-types";
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

/**
 * Collection for the `oauthRefreshToken` model of `@better-auth/oauth-provider`
 * (opaque refresh tokens issued with the `offline_access` scope).
 */
export function buildOauthRefreshTokensCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const oauthRefreshTokenSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.oauthRefreshToken
  );
  const oauthRefreshTokenSchema = resolvedSchemas[baModelKey.oauthRefreshToken];

  const existingOauthRefreshTokenCollection = incomingCollections.find(
    (collection) => collection.slug === oauthRefreshTokenSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof OauthRefreshToken> = {
    token: () => ({
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Refresh token (stored hashed by default)"
      }
    }),
    clientId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "client_id of the OAuth client the token was issued to"
      }
    }),
    sessionId: () => ({
      admin: {
        readOnly: true,
        description: "Session the refresh token is linked to"
      }
    }),
    userId: () => ({
      admin: {
        readOnly: true,
        description: "User the refresh token was issued for"
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
    expiresAt: () => ({
      admin: {
        readOnly: true,
        description: "Expiration date of the refresh token"
      }
    }),
    revoked: () => ({
      admin: {
        readOnly: true,
        description: "Date the refresh token was revoked, if it was"
      }
    }),
    authTime: () => ({
      admin: {
        readOnly: true,
        description: "Time the user authenticated (auth_time claim)"
      }
    }),
    scopes: () => ({
      admin: { readOnly: true, description: "Scopes granted to the token" }
    })
  };

  const oauthRefreshTokenFieldRules: FieldRule[] = [
    {
      condition: (field) => field.fieldName === "createdAt",
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: ({ t }: any) => t("general:createdAt")
      })
    }
  ];

  const collectionFields = getCollectionFields({
    schema: oauthRefreshTokenSchema,
    fieldRules: oauthRefreshTokenFieldRules,
    additionalProperties: fieldOverrides
  });

  let oauthRefreshTokenCollection: CollectionConfig = {
    ...existingOauthRefreshTokenCollection,
    slug: oauthRefreshTokenSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.oauthRefreshToken,
        "clientId"
      ),
      description: "OAuth refresh tokens issued by the OAuth provider",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingOauthRefreshTokenCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOauthRefreshTokenCollection?.access ?? {})
    },
    custom: {
      ...(existingOauthRefreshTokenCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.oauthRefreshToken
    },
    fields: [
      ...(existingOauthRefreshTokenCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.oauthRefreshTokens ===
    "function"
  ) {
    oauthRefreshTokenCollection =
      pluginOptions.pluginCollectionOverrides.oauthRefreshTokens({
        collection: oauthRefreshTokenCollection
      });
  }

  assertAllSchemaFields(oauthRefreshTokenCollection, oauthRefreshTokenSchema);

  return oauthRefreshTokenCollection;
}
