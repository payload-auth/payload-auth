import type { CollectionConfig } from "payload";
import type { Invitation } from "@/better-auth/generated-types";
import type {
  BuildCollectionProps,
  FieldOverrides
} from "@/better-auth/plugin/types";
import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

export function buildInvitationsCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const invitationSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.invitation
  );
  const invitationSchema = resolvedSchemas[baModelKey.invitation];
  const existingInvitationCollection = incomingCollections.find(
    (collection) => collection.slug === invitationSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof Invitation> = {
    email: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "The email of the user being invited."
      }
    }),
    inviterId: () => ({
      admin: { readOnly: true, description: "The user who invited the user." }
    }),
    teamId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "The team that the user is being invited to."
      }
    }),
    organizationId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "The organization that the user is being invited to."
      }
    }),
    role: () => ({
      admin: {
        readOnly: true,
        description: "The role of the user being invited."
      }
    }),
    status: () => ({
      defaultValue: "pending",
      admin: { readOnly: true, description: "The status of the invitation." }
    }),
    expiresAt: () => ({
      admin: {
        readOnly: true,
        description: "The date and time when the invitation will expire."
      }
    })
  };

  const collectionFields = getCollectionFields({
    schema: invitationSchema,
    additionalProperties: fieldOverrides
  });

  let invitationCollection: CollectionConfig = {
    ...existingInvitationCollection,
    slug: invitationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.invitation,
        "email"
      ),
      description: "Invitations to join an organization",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingInvitationCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingInvitationCollection?.access ?? {})
    },
    custom: {
      ...(existingInvitationCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.invitation
    },
    fields: [
      ...(existingInvitationCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.invitations === "function"
  ) {
    invitationCollection = pluginOptions.pluginCollectionOverrides.invitations({
      collection: invitationCollection
    });
  }

  assertAllSchemaFields(invitationCollection, invitationSchema);

  return invitationCollection;
}
