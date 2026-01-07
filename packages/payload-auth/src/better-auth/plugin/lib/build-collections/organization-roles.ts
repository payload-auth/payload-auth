import type { CollectionConfig } from "payload";
import type { OrganizationRole } from "@/better-auth/generated-types";
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

export function buildOrganizationRolesCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const organizationRolesSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.organizationRole
  );
  const organizationRolesSchema = resolvedSchemas[baModelKey.organizationRole];

  const existingOrganizationRolesCollection = incomingCollections.find(
    (collection) => collection.slug === organizationRolesSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof OrganizationRole> = {
    organizationId: () => ({
      index: true,
      admin: { readOnly: true, description: "The ID of the organization" }
    }),
    role: () => ({
      admin: { description: "The name of the role" }
    }),
    permission: () => ({
      index: true,
      admin: { description: "The permission of the organization role" }
    })
  };

  const collectionFields = getCollectionFields({
    schema: organizationRolesSchema,
    additionalProperties: fieldOverrides
  });

  let organizationRolesCollection: CollectionConfig = {
    ...existingOrganizationRolesCollection,
    slug: organizationRolesSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.organizationRole,
        "role"
      ),
      description:
        "Organization roles are the roles that are available for an organization.",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingOrganizationRolesCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOrganizationRolesCollection?.access ?? {})
    },
    custom: {
      ...(existingOrganizationRolesCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.organizationRole
    },
    fields: [
      ...(existingOrganizationRolesCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.organizationRoles ===
    "function"
  ) {
    organizationRolesCollection =
      pluginOptions.pluginCollectionOverrides.organizationRoles({
        collection: organizationRolesCollection
      });
  }

  assertAllSchemaFields(organizationRolesCollection, organizationRolesSchema);

  return organizationRolesCollection;
}
