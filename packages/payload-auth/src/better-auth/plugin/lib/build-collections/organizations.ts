import type { CollectionConfig, JoinField } from "payload";
import type { Organization } from "@/better-auth/generated-types";
import type {
  BuildCollectionProps,
  FieldOverrides
} from "@/better-auth/plugin/types";
import { baModelFieldKeys, baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

export function buildOrganizationsCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const organizationSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.organization
  );
  const organizationSchema = resolvedSchemas[baModelKey.organization];

  const organizationRoleSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.organizationRole
  );
  const memberSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.member
  );
  const invitationSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.invitation
  );
  const teamSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.team);
  const teamMemberSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.teamMember
  );
  const scimProviderSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.scimProvider
  );

  const existingOrganizationCollection = incomingCollections.find(
    (collection) => collection.slug === organizationSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof Organization> = {
    name: () => ({
      admin: { description: "The name of the organization." }
    }),
    slug: () => ({
      unique: true,
      index: true,
      admin: { description: "The slug of the organization." }
    }),
    logo: () => ({
      admin: { description: "The logo of the organization." }
    }),
    metadata: () => ({
      admin: { description: "Additional metadata for the organization." }
    })
  };

  const collectionFields = getCollectionFields({
    schema: organizationSchema,
    additionalProperties: fieldOverrides
  });

  const joinFields: JoinField[] = [
    {
      label: "Members",
      name: baModelKey.member,
      type: "join",
      hasMany: true,
      collection: memberSlug,
      on: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.member,
        baModelFieldKeys.member.organizationId
      ),
      maxDepth: 1,
      saveToJWT: false
    },
    {
      label: "Invitations",
      name: baModelKey.invitation,
      type: "join",
      hasMany: true,
      collection: invitationSlug,
      on: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.invitation,
        baModelFieldKeys.invitation.organizationId
      ),
      maxDepth: 1,
      saveToJWT: false
    },
    {
      label: "Teams",
      name: baModelKey.team,
      type: "join",
      hasMany: true,
      collection: teamSlug,
      on: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.team,
        baModelFieldKeys.team.organizationId
      ),
      maxDepth: 1,
      saveToJWT: false
    },
    {
      label: "Organization Roles",
      name: baModelKey.organizationRole,
      type: "join",
      hasMany: true,
      collection: organizationRoleSlug,
      on: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.organizationRole,
        baModelFieldKeys.organizationRole.organizationId
      ),
      maxDepth: 1,
      saveToJWT: false
    }
  ];

  let organizationCollection: CollectionConfig = {
    ...existingOrganizationCollection,
    slug: organizationSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.organization,
        "name"
      ),
      description:
        "Organizations are groups of users that share access to certain resources.",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingOrganizationCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingOrganizationCollection?.access ?? {})
    },
    custom: {
      ...(existingOrganizationCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.organization
    },
    fields: [
      ...(existingOrganizationCollection?.fields ?? []),
      ...(collectionFields ?? []),
      ...joinFields
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.organizations === "function"
  ) {
    organizationCollection =
      pluginOptions.pluginCollectionOverrides.organizations({
        collection: organizationCollection
      });
  }

  assertAllSchemaFields(organizationCollection, organizationSchema);

  return organizationCollection;
}
