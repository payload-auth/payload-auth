import type { CollectionConfig } from "payload";
import type { Account } from "@/better-auth/generated-types";
import { baModelKey, defaults } from "@/better-auth/plugin/constants";
import type {
  BuildCollectionProps,
  FieldOverrides,
  FieldRule
} from "@/better-auth/plugin/types";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../utils/collection-schema";
import {
  isAdminOrCurrentUserWithRoles,
  isAdminWithRoles
} from "../utils/payload-access";
import { getCollectionFields } from "../utils/transform-schema-fields-to-payload";
import { getSyncPasswordToUserHook } from "./hooks/sync-password-to-user";

export function buildAccountsCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const accountSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.account
  );
  const accountSchema = resolvedSchemas[baModelKey.account];
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole];

  const existingAccountCollection = incomingCollections.find(
    (collection) => collection.slug === accountSlug
  ) as CollectionConfig | undefined;

  const accountFieldRules: FieldRule[] = [
    {
      condition: (field) => field.type === "date",
      transform: (field) => ({
        ...field,
        saveToJWT: false,
        admin: {
          disableBulkEdit: true,
          hidden: true
        },
        index: true,
        label: "general:updatedAt"
      })
    }
  ];

  const fieldOverrides: FieldOverrides<keyof Account> = {
    userId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "The user that the account belongs to"
      }
    }),
    accountId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description:
          "The id of the account as provided by the SSO or equal to userId for credential accounts"
      }
    }),
    providerId: () => ({
      admin: {
        readOnly: true,
        description: "The id of the provider as provided by the SSO"
      }
    }),
    accessToken: () => ({
      admin: {
        readOnly: true,
        description: "The access token of the account. Returned by the provider"
      }
    }),
    refreshToken: () => ({
      admin: {
        readOnly: true,
        description:
          "The refresh token of the account. Returned by the provider"
      }
    }),
    accessTokenExpiresAt: () => ({
      admin: {
        readOnly: true,
        description: "The date and time when the access token will expire"
      }
    }),
    refreshTokenExpiresAt: () => ({
      admin: {
        readOnly: true,
        description: "The date and time when the refresh token will expire"
      }
    }),
    scope: () => ({
      admin: {
        readOnly: true,
        description: "The scope of the account. Returned by the provider"
      }
    }),
    idToken: () => ({
      admin: {
        readOnly: true,
        description: "The id token for the account. Returned by the provider"
      }
    }),
    password: () => ({
      admin: {
        readOnly: true,
        hidden: true,
        description:
          "The hashed password of the account. Mainly used for email and password authentication"
      }
    })
  };

  const collectionFields = getCollectionFields({
    schema: accountSchema,
    fieldRules: accountFieldRules,
    additionalProperties: fieldOverrides
  });

  let accountCollection: CollectionConfig = {
    slug: accountSlug,
    admin: {
      useAsTitle: "accountId",
      description:
        "Accounts are used to store user accounts for authentication providers",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingAccountCollection?.admin,
      hidden: pluginOptions.accounts?.hidden
    },
    access: {
      create: isAdminWithRoles({ adminRoles }),
      delete: isAdminWithRoles({ adminRoles }),
      read: isAdminOrCurrentUserWithRoles({
        adminRoles,
        idField: getSchemaFieldName(
          resolvedSchemas,
          baModelKey.account,
          "userId"
        )
      }),
      update: isAdminWithRoles({ adminRoles }),
      ...(existingAccountCollection?.access ?? {})
    },
    custom: {
      ...(existingAccountCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.account
    },
    hooks: {
      afterChange: [
        ...(existingAccountCollection?.hooks?.afterChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth
          ? []
          : [getSyncPasswordToUserHook(resolvedSchemas)])
      ]
    },
    fields: [
      ...(existingAccountCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ],
    ...existingAccountCollection
  };

  if (typeof pluginOptions.accounts?.collectionOverrides === "function") {
    accountCollection = pluginOptions.accounts.collectionOverrides({
      collection: accountCollection
    });
  }

  assertAllSchemaFields(accountCollection, accountSchema);

  return accountCollection;
}
