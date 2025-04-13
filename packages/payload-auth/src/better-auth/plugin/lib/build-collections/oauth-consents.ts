import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../types";
import { betterAuthPluginSlugs, baseCollectionSlugs } from "../config";
import { getTimestampFields } from "./utils/get-timestamp-fields";
import { getAdminAccess } from "../../helpers/get-admin-access";

export function buildOauthConsentsCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions;
}) {
  const oauthConsentSlug = betterAuthPluginSlugs.oauthConsents;
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users;

  const oauthConsentCollection: CollectionConfig = {
    slug: oauthConsentSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      description:
        "OAuth consents are used to store user consents for OAuth clients",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
    },
    access: {
      ...getAdminAccess(pluginOptions),
    },
    fields: [
      {
        name: "client",
        type: "relationship",
        relationTo: betterAuthPluginSlugs.oauthApplications,
        required: true,
        label: "Client",
        admin: {
          readOnly: true,
          description: "OAuth client associated with the consent",
        },
      },
      {
        name: "user",
        type: "relationship",
        relationTo: userSlug,
        required: true,
        label: "User",
        admin: {
          readOnly: true,
          description: "User associated with the consent",
        },
      },
      {
        name: "scopes",
        type: "text",
        required: true,
        label: "Scopes",
        admin: {
          readOnly: true,
          description: "Comma-separated list of scopes consented to",
        },
      },
      {
        name: "consentGiven",
        type: "checkbox",
        defaultValue: false,
        required: true,
        label: "Consent Given",
        admin: {
          readOnly: true,
          description: "	Indicates if consent was given",
        },
      },
      ...getTimestampFields(),
    ],
  };

  return oauthConsentCollection;
}
