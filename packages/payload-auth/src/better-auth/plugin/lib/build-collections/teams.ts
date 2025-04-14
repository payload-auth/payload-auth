import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../types";
import { betterAuthPluginSlugs } from "../constants";
import { getTimestampFields } from "./utils/get-timestamp-fields";
import { getAdminAccess } from "../../helpers/get-admin-access";

export function buildTeamsCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions;
}) {
  const teamSlug = betterAuthPluginSlugs.teams;
  const organizationSlug = betterAuthPluginSlugs.organizations;
  const teamCollection: CollectionConfig = {
    slug: teamSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: "name",
      description:
        "Teams are groups of users that share access to certain resources.",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
    },
    access: {
      ...getAdminAccess(pluginOptions),
    },
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        label: "Name",
        admin: {
          description: "The name of the team.",
        },
      },
      {
        name: "organization",
        type: "relationship",
        relationTo: organizationSlug,
        required: true,
        label: "Organization",
        admin: {
          readOnly: true,
          description: "The organization that the team belongs to.",
        },
      },
      ...getTimestampFields(),
    ],
  };

  return teamCollection;
}
