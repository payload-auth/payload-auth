import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../../types";
import { isAdminWithRoles } from "./utils/payload-access";
import { getTimestampFields } from "./utils/get-timestamp-fields";
import { generateAdminInviteUrl } from "../../payload/utils/generate-admin-invite-url";

export function buildAdminInvitationsCollection({
  incomingCollections,
  pluginOptions,
}: {
  incomingCollections: CollectionConfig[];
  pluginOptions: BetterAuthPluginOptions;
}) {
  const generateAdminInviteUrlFn = pluginOptions.adminInvitations?.generateInviteUrl ?? generateAdminInviteUrl;
  const adminInvitationSlug =
    pluginOptions.adminInvitations?.slug ?? "admin-invitations";
  const adminRoles = pluginOptions.users?.adminRoles ?? ["admin"];
  const roles = pluginOptions.users?.roles ?? ["user"];
  const allRoleOptions = [...new Set([...adminRoles, ...roles])].map(
    (role) => ({
      label: role
        .split(/[-_\s]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value: role,
    })
  );
  const existingAdminInvitationCollection = incomingCollections.find(
    (collection) => collection.slug === adminInvitationSlug
  ) as CollectionConfig | undefined;

  let adminInvitationsCollection: CollectionConfig = {
    ...existingAdminInvitationCollection,
    slug: adminInvitationSlug,
    admin: {
      defaultColumns: ["role", "token", "url"],
      useAsTitle: "token",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      hidden: pluginOptions.adminInvitations?.hidden,
      ...existingAdminInvitationCollection?.admin,
    },
    access: {
      create: isAdminWithRoles({ adminRoles }),
      read: isAdminWithRoles({ adminRoles }),
      delete: isAdminWithRoles({ adminRoles }),
      update: isAdminWithRoles({ adminRoles }),
      ...(existingAdminInvitationCollection?.access ?? {}),
    },
    timestamps: true,
    fields: [
      {
        label: "Role",
        name: "role",
        type: "select",
        options: allRoleOptions,
        required: true,
        defaultValue: pluginOptions.users?.defaultAdminRole ?? "admin",
      },
      {
        name: "token",
        label: "Token",
        index: true,
        type: "text",
        admin: {
          readOnly: true,
        },
        required: true,
      },
      {
        name: "url",
        label: "URL",
        type: "text",
        hooks: {
          beforeChange: [
            ({ siblingData }) => {
              delete siblingData['url']
            }
          ],
          afterRead: [
            ({ data, req }) => { 
              return generateAdminInviteUrlFn({
                payload: req.payload,
                token: data?.token,
              });
            }
          ],
        },
        admin: {
          readOnly: true,
        },
        virtual: true,
      }
    ],
  };

  if (pluginOptions.adminInvitations?.collectionOverrides) {
    adminInvitationsCollection =
      pluginOptions.adminInvitations.collectionOverrides({
        collection: adminInvitationsCollection,
      });
  }

  return adminInvitationsCollection;
}
