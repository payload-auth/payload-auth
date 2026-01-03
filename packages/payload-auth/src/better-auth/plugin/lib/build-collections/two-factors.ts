import type { CollectionConfig } from "payload";
import type { TwoFactor } from "@/better-auth/generated-types";
import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import type { BuildCollectionProps, FieldOverrides } from "../../types";
import {
  assertAllSchemaFields,
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";

export function buildTwoFactorsCollection({
  incomingCollections,
  pluginOptions,
  resolvedSchemas
}: BuildCollectionProps): CollectionConfig {
  const twoFactorSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.twoFactor
  );
  const twoFactorSchema = resolvedSchemas[baModelKey.twoFactor];

  const existingTwoFactorCollection = incomingCollections.find(
    (collection) => collection.slug === twoFactorSlug
  ) as CollectionConfig | undefined;

  const fieldOverrides: FieldOverrides<keyof TwoFactor> = {
    userId: () => ({
      admin: {
        readOnly: true,
        description:
          "The user that the two factor authentication secret belongs to"
      }
    }),
    secret: () => ({
      index: true,
      admin: {
        readOnly: true,
        description: "The secret used to generate the TOTP code."
      }
    }),
    backupCodes: () => ({
      admin: {
        readOnly: true,
        description:
          "The backup codes used to recover access to the account if the user loses access to their phone or email"
      }
    })
  };

  const collectionFields = getCollectionFields({
    schema: twoFactorSchema,
    additionalProperties: fieldOverrides
  });

  let twoFactorCollection: CollectionConfig = {
    ...existingTwoFactorCollection,
    slug: twoFactorSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(
        resolvedSchemas,
        baModelKey.twoFactor,
        "secret"
      ),
      description: "Two factor authentication secrets",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingTwoFactorCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingTwoFactorCollection?.access ?? {})
    },
    custom: {
      ...(existingTwoFactorCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.twoFactor
    },
    fields: [
      ...(existingTwoFactorCollection?.fields ?? []),
      ...(collectionFields ?? [])
    ]
  };

  if (
    typeof pluginOptions.pluginCollectionOverrides?.twoFactors === "function"
  ) {
    twoFactorCollection = pluginOptions.pluginCollectionOverrides.twoFactors({
      collection: twoFactorCollection
    });
  }

  assertAllSchemaFields(twoFactorCollection, twoFactorSchema);

  return twoFactorCollection;
}
