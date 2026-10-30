import type { CollectionConfig } from "payload";
import type { OauthClient } from "@/better-auth/generated-types";
import type {
  BuildCollectionProps,
  FieldOverrides,
  FieldRule
} from "@/better-auth/plugin/types";
import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

export function buildOauthClientsCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const oauthClientSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.oauthClient
  );

  const oauthClientSchema = resolvedSchemas[baModelKey.oauthClient];

  const existingOauthClientCollection = incomingCollections.find(
    (collection) => collection.slug === oauthClientSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof OauthClient> = {
    clientId: () => ({
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Unique identifier for each OAuth client"
      }
    }),
    clientSecret: () => ({
      admin: { readOnly: true, description: "Secret key for the OAuth client" }
    }),
    name: () => ({
      index: true,
      admin: { description: "Name of the OAuth client" }
    }),
    redirectUris: () => ({
      admin: { description: "List of redirect URIs registered for the client" }
    }),
    metadata: () => ({
      admin: {
        readOnly: true,
        description: "Additional metadata for the OAuth client"
      }
    }),
    applicationType: () => ({
      admin: {
        readOnly: true,
        description: "Type of OAuth client (e.g., web, native)"
      }
    }),
    disabled: () => ({
      defaultValue: false,
      admin: { description: "Indicates if the client is disabled" }
    }),
    icon: () => ({
      admin: { description: "Icon of the OAuth client" }
    }),
    userId: () => ({
      admin: {
        readOnly: true,
        description: "ID of the user who owns the client. (optional)"
      }
    })
  };

  const oauthClientFieldRules: FieldRule[] = [
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
    schema: oauthClientSchema,
    fieldRules: oauthClientFieldRules,
    additionalProperties: fieldOverrides
  });

  let oauthClientCollection: CollectionConfig = {
    ...existingOauthClientCollection,
    slug: oauthClientSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: oauthClientSchema?.fields?.name?.fieldName,
      description: "OAuth clients registered with the OAuth provider",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingOauthClientCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOauthClientCollection?.access ?? {})
    },
    custom: {
      ...(existingOauthClientCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.oauthClient
    },
    fields: [
      ...(existingOauthClientCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.oauthClients === "function"
  ) {
    oauthClientCollection = pluginOptions.pluginCollectionOverrides.oauthClients(
      {
        collection: oauthClientCollection
      }
    );
  }

  assertAllSchemaFields(oauthClientCollection, oauthClientSchema);

  return oauthClientCollection;
}
