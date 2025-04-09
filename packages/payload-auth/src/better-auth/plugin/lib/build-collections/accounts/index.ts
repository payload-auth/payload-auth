import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../../types";
import { baseCollectionSlugs } from "../../config";
import { getSyncPasswordToUserHook } from "./hooks/sync-password-to-user";
import {
  isAdminOrCurrentUserWithRoles,
  isAdminWithRoles,
} from "../utils/payload-access";
import { getTimestampFields } from "../utils/get-timestamp-fields";

export function buildAccountsCollection({
  incomingCollections,
  pluginOptions,
}: {
  incomingCollections: CollectionConfig[];
  pluginOptions: BetterAuthPluginOptions;
}): CollectionConfig {
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users;
  const accountSlug =
    pluginOptions.accounts?.slug ?? baseCollectionSlugs.accounts;
  const adminRoles = pluginOptions.users?.adminRoles ?? ["admin"];

  const existingAccountCollection = incomingCollections.find(
    (collection) => collection.slug === accountSlug
  ) as CollectionConfig | undefined;

  let accountCollection: CollectionConfig = {
    slug: accountSlug,
    admin: {
      useAsTitle: "accountId",
      description:
        "Accounts are used to store user accounts for authentication providers",
      ...existingAccountCollection?.admin,
      hidden: pluginOptions.accounts?.hidden,
    },
    hooks: {
      afterChange: [
        ...(existingAccountCollection?.hooks?.afterChange ?? []),
        ...(pluginOptions.disableDefaultPayloadAuth
          ? []
          : [
              getSyncPasswordToUserHook({
                userSlug,
                accountSlug,
              }),
            ]),
      ],
    },
    access: {
      create: isAdminWithRoles({ adminRoles }),
      delete: isAdminWithRoles({ adminRoles }),
      read: isAdminOrCurrentUserWithRoles({ adminRoles, idField: "user" }),
      update: isAdminWithRoles({ adminRoles }),
      ...(existingAccountCollection?.access ?? {}),
    },
    fields: [
      ...(existingAccountCollection?.fields ?? []),
      {
        name: "user",
        type: "relationship",
        relationTo: userSlug,
        required: true,
        index: true,
        label: "User",
        admin: {
          readOnly: true,
          description: "The user that the account belongs to",
        },
      },
      {
        name: "accountId",
        type: "text",
        label: "Account ID",
        required: true,
        index: true,
        admin: {
          readOnly: true,
          description:
            "The id of the account as provided by the SSO or equal to userId for credential accounts",
        },
      },
      {
        name: "providerId",
        type: "text",
        required: true,
        label: "Provider ID",
        admin: {
          readOnly: true,
          description: "The id of the provider as provided by the SSO",
        },
      },
      {
        name: "accessToken",
        type: "text",
        label: "Access Token",
        admin: {
          readOnly: true,
          description:
            "The access token of the account. Returned by the provider",
        },
      },
      {
        name: "refreshToken",
        type: "text",
        label: "Refresh Token",
        admin: {
          readOnly: true,
          description:
            "The refresh token of the account. Returned by the provider",
        },
      },
      {
        name: "accessTokenExpiresAt",
        type: "date",
        label: "Access Token Expires At",
        admin: {
          readOnly: true,
          description: "The date and time when the access token will expire",
        },
      },
      {
        name: "refreshTokenExpiresAt",
        type: "date",
        label: "Refresh Token Expires At",
        admin: {
          readOnly: true,
          description: "The date and time when the refresh token will expire",
        },
      },
      {
        name: "scope",
        type: "text",
        label: "Scope",
        admin: {
          readOnly: true,
          description: "The scope of the account. Returned by the provider",
        },
      },
      {
        name: "idToken",
        type: "text",
        label: "ID Token",
        admin: {
          readOnly: true,
          description: "The id token for the account. Returned by the provider",
        },
      },
      {
        name: "password",
        type: "text",
        label: "Password",
        admin: {
          readOnly: true,
          hidden: true,
          description:
            "The hashed password of the account. Mainly used for email and password authentication",
        },
      },
      ...getTimestampFields(),
    ],
    ...existingAccountCollection,
  };
  if (pluginOptions.accounts?.collectionOverrides) {
    accountCollection = pluginOptions.accounts.collectionOverrides({
      collection: accountCollection,
    });
  }
  return accountCollection;
}
