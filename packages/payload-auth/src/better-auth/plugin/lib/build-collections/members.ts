import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../types";
import { betterAuthPluginSlugs, baseCollectionSlugs } from "../config";
import { getTimestampFields } from "./utils/get-timestamp-fields";
import { getAdminAccess } from "../../helpers/get-admin-access";
export function buildMembersCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions;
}): CollectionConfig {
  const memberSlug = betterAuthPluginSlugs.members;
  const organizationSlug = betterAuthPluginSlugs.organizations;
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users;
  const teamSlug = betterAuthPluginSlugs.teams;
  const memberCollection: CollectionConfig = {
    slug: memberSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: "organization",
      description: "Members of an organization.",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
    },
    access: {
      ...getAdminAccess(pluginOptions),
    },
    fields: [
      {
        name: "organization",
        type: "relationship",
        relationTo: organizationSlug,
        required: true,
        index: true,
        label: "Organization",
        admin: {
          readOnly: true,
          description: "The organization that the member belongs to.",
        },
      },
      {
        name: "user",
        type: "relationship",
        relationTo: userSlug,
        required: true,
        index: true,
        label: "User",
        admin: {
          readOnly: true,
          description: "The user that is a member of the organization.",
        },
      },
      {
        name: "team",
        type: "relationship",
        relationTo: teamSlug,
        required: false,
        label: "Team",
        admin: {
          description: "The team that the member belongs to.",
        },
      },
      {
        name: "role",
        type: "text",
        required: true,
        defaultValue: "member",
        label: "Role",
        admin: {
          description: "The role of the member in the organization.",
        },
      },
      ...getTimestampFields(),
    ],
  };

  return memberCollection;
}
