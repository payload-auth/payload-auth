import type { CollectionConfig } from "payload";
import type { DeviceCode } from "@/better-auth/generated-types";
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

export function buildDeviceCodeCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const deviceCodeSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.deviceCode
  );
  const deviceCodeSchema = resolvedSchemas[baModelKey.deviceCode];

  const existingDeviceCodeCollection = incomingCollections.find(
    (collection) => collection.slug === deviceCodeSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof DeviceCode> = {
    userId: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "The user that initiated the device authorization flow."
      }
    })
  };

  const collectionFields = getCollectionFields({
    schema: deviceCodeSchema,
    additionalProperties: fieldOverrides
  });

  let deviceCodeCollection: CollectionConfig = {
    ...existingDeviceCodeCollection,
    slug: deviceCodeSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.deviceCode,
        "deviceCode"
      ),
      description: "Device authorization codes for the OAuth 2.0 device flow.",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingDeviceCodeCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingDeviceCodeCollection?.access ?? {})
    },
    custom: {
      ...(existingDeviceCodeCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.deviceCode
    },
    fields: [
      ...(existingDeviceCodeCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.deviceCode === "function"
  ) {
    deviceCodeCollection =
      pluginOptions.pluginCollectionOverrides.deviceCode({
        collection: deviceCodeCollection
      });
  }

  assertAllSchemaFields(deviceCodeCollection, deviceCodeSchema);

  return deviceCodeCollection;
}
