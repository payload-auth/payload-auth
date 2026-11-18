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
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

/**
 * Collection for the `oauthClient` model of `@better-auth/oauth-provider`
 * (OAuth 2.1 clients, including dynamically registered ones).
 */
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
        description: "Unique identifier (client_id) of the OAuth client"
      }
    }),
    clientSecret: () => ({
      admin: {
        readOnly: true,
        description:
          "Client secret. Stored hashed by default; empty for public clients"
      }
    }),
    disabled: () => ({
      defaultValue: false,
      admin: { description: "Indicates if the client is disabled" }
    }),
    skipConsent: () => ({
      admin: {
        description: "Skip the consent screen for this (trusted) client"
      }
    }),
    enableEndSession: () => ({
      admin: {
        description: "Allow this client to use the RP-initiated logout endpoint"
      }
    }),
    subjectType: () => ({
      admin: { description: 'Subject identifier type ("public" or "pairwise")' }
    }),
    scopes: () => ({
      admin: { description: "Scopes this client is allowed to request" }
    }),
    userId: () => ({
      admin: {
        readOnly: true,
        description: "User who registered the client (optional)"
      }
    }),
    name: () => ({
      index: true,
      admin: { description: "Name of the OAuth client" }
    }),
    uri: () => ({
      admin: { description: "URL of the home page of the client" }
    }),
    icon: () => ({
      admin: { description: "Icon (logo URL) of the OAuth client" }
    }),
    contacts: () => ({
      admin: { description: "Contact addresses for the owners of the client" }
    }),
    tos: () => ({
      admin: { description: "URL of the terms of service of the client" }
    }),
    policy: () => ({
      admin: { description: "URL of the privacy policy of the client" }
    }),
    softwareId: () => ({
      admin: { description: "Identifier of the client software (RFC 7591)" }
    }),
    softwareVersion: () => ({
      admin: { description: "Version of the client software (RFC 7591)" }
    }),
    softwareStatement: () => ({
      admin: { description: "Signed software statement (RFC 7591)" }
    }),
    redirectUris: () => ({
      admin: { description: "Allowed redirect URIs" }
    }),
    postLogoutRedirectUris: () => ({
      admin: { description: "Allowed post-logout redirect URIs" }
    }),
    tokenEndpointAuthMethod: () => ({
      admin: {
        description:
          "Token endpoint auth method (client_secret_basic, client_secret_post or none)"
      }
    }),
    grantTypes: () => ({
      admin: {
        description:
          "Allowed grant types (authorization_code, client_credentials, refresh_token)"
      }
    }),
    responseTypes: () => ({
      admin: { description: "Allowed response types" }
    }),
    public: () => ({
      admin: { description: "Public client (no client secret, e.g. PKCE-only)" }
    }),
    type: () => ({
      admin: {
        readOnly: true,
        description: "Client type (web, native or user-agent-based)"
      }
    }),
    requirePKCE: () => ({
      admin: { description: "Require PKCE for this client" }
    }),
    referenceId: () => ({
      index: true,
      admin: {
        description:
          "Opaque reference to the owning entity (e.g. organization id)"
      }
    }),
    metadata: () => ({
      admin: {
        readOnly: true,
        description: "Additional client metadata (JSON)"
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
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.oauthClient,
        "clientId"
      ),
      description:
        "OAuth clients registered with the OAuth provider (including dynamically registered clients)",
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
    oauthClientCollection =
      pluginOptions.pluginCollectionOverrides.oauthClients({
        collection: oauthClientCollection
      });
  }

  assertAllSchemaFields(oauthClientCollection, oauthClientSchema);

  return oauthClientCollection;
}
