import type { CollectionConfig } from "payload";
import type { ModelKey } from "@/better-auth/generated-types";
import type { BuildCollectionProps } from "@/better-auth/plugin/types";
import { baModelKeyToSlug } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

/**
 * Builds a collection for a Better Auth model that has no model-specific
 * builder. Every field the model declares in the Better Auth schema is
 * mirrored with its default mapping; the collection inherits the plugin's
 * admin access and collection overrides.
 */
export function buildDefaultCollection({
  modelKey,
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps & { modelKey: ModelKey }): CollectionConfig {
  const slug = getSchemaCollectionSlug(resolvedSchemas, modelKey);
  const schema = resolvedSchemas[modelKey];

  const existingCollection = incomingCollections.find(
    (collection) => collection.slug === slug
  ) as CollectionConfig | undefined;

  const collectionFields = getCollectionFields({ schema });

  let collection: CollectionConfig = {
    ...existingCollection,
    slug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingCollection?.access ?? {})
    },
    custom: {
      ...(existingCollection?.custom ?? {}),
      betterAuthModelKey: modelKey
    },
    fields: [
      ...(existingCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  const overrideKey = (baModelKeyToSlug as Record<string, string>)[modelKey];
  const override = overrideKey
    ? (
        pluginOptions.pluginCollectionOverrides as Record<
          string,
          | ((options: { collection: CollectionConfig }) => CollectionConfig)
          | undefined
        >
      )?.[overrideKey]
    : undefined;
  if (typeof override === "function") {
    collection = override({ collection });
  }

  assertAllSchemaFields(collection, schema);

  return collection;
}
