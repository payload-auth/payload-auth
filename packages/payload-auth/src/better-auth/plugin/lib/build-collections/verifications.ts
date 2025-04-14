import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../types";
import { baseCollectionSlugs } from "../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";

export function buildVerificationsCollection({
  incomingCollections,
  pluginOptions,
}: {
  incomingCollections: CollectionConfig[];
  pluginOptions: BetterAuthPluginOptions;
}) {
  const verificationSlug =
    pluginOptions.verifications?.slug ?? baseCollectionSlugs.verifications;
  const existingVerificationCollection = incomingCollections.find(
    (collection) => collection.slug === verificationSlug
  );
  let verificationCollection: CollectionConfig = {
    slug: verificationSlug,
    admin: {
      useAsTitle: "identifier",
      description: "Verifications are used to verify authentication requests",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
      ...existingVerificationCollection?.admin,
      hidden: pluginOptions.verifications?.hidden,
    },
    access: {
      ...getAdminAccess(pluginOptions),
    },
    fields: [
      ...(existingVerificationCollection?.fields ?? []),
      {
        name: "identifier",
        type: "text",
        required: true,
        index: true,
        label: "Identifier",
        admin: {
          description: "The identifier of the verification request",
          readOnly: true,
        },
      },
      {
        name: "value",
        type: "text",
        required: true,
        label: "Value",
        admin: {
          description: "The value to be verified",
          readOnly: true,
        },
      },
      {
        name: "expiresAt",
        type: "date",
        required: true,
        label: "Expires At",
        admin: {
          description:
            "The date and time when the verification request will expire",
          readOnly: true,
        },
      },
    ],
    timestamps: true,
    ...existingVerificationCollection,
  };

  if (pluginOptions.verifications?.collectionOverrides) {
    verificationCollection = pluginOptions.verifications.collectionOverrides({
      collection: verificationCollection,
    });
  }

  return verificationCollection;
}
