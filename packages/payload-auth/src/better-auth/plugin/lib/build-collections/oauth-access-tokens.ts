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
    token: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "Access token issued to the client"
      }
    }),
    expiresAt: () => ({
      admin: {
        readOnly: true,
        description: "Expiration date of the access token"
      }
    }),
    revoked: () => ({
      admin: {
        readOnly: true,
        description: "Date the access token was revoked"
      }
    }),
    clientId: () => ({
      admin: {
        readOnly: true,
        description: "OAuth client associated with the access token"
      }
    }),
    userId: () => ({
      admin: {
        readOnly: true,
        description: "User associated with the access token"
      }
    }),
    scopes: () => ({
      admin: { description: "Comma-separated list of scopes granted" }
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
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.oauthAccessToken,
        "token"
      ),
      description: "OAuth access tokens issued by the OAuth provider",
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
