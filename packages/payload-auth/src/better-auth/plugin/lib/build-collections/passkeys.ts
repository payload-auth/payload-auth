import { CollectionConfig } from "payload";
import { BetterAuthPluginOptions } from "../../types";
import { baseCollectionSlugs, betterAuthPluginSlugs } from "../config";
import { getTimestampFields } from "./utils/get-timestamp-fields";

export function buildPasskeysCollection({
  pluginOptions,
}: {
  pluginOptions: BetterAuthPluginOptions;
}) {
  const passkeySlug = betterAuthPluginSlugs.passkeys;
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users;

  const passkeyCollection: CollectionConfig = {
    slug: passkeySlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: "name",
      description: "Passkeys are used to authenticate users",
    },
    fields: [
      {
        name: "name",
        type: "text",
        label: "Name",
        admin: {
          readOnly: true,
          description: "The name of the passkey",
        },
      },
      {
        name: "publicKey",
        type: "text",
        required: true,
        index: true,
        label: "Public Key",
        admin: {
          readOnly: true,
          description: "The public key of the passkey",
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
          description: "The user that the passkey belongs to",
        },
      },
      {
        name: "credentialID",
        type: "text",
        required: true,
        unique: true,
        label: "Credential ID",
        admin: {
          readOnly: true,
          description: "The unique identifier of the registered credential",
        },
      },
      {
        name: "counter",
        type: "number",
        required: true,
        label: "Counter",
        admin: {
          readOnly: true,
          description: "The counter of the passkey",
        },
      },
      {
        name: "deviceType",
        type: "text",
        required: true,
        label: "Device Type",
        admin: {
          readOnly: true,
          description: "The type of device used to register the passkey",
        },
      },
      {
        name: "backedUp",
        type: "checkbox",
        required: true,
        label: "Backed Up",
        admin: {
          readOnly: true,
          description: "Whether the passkey is backed up",
        },
      },
      {
        name: "transports",
        type: "text",
        required: true,
        label: "Transports",
        admin: {
          readOnly: true,
          description: "The transports used to register the passkey",
        },
      },
      ...getTimestampFields(),
    ],
  };

  return passkeyCollection;
}
