import { CollectionConfig } from "payload";
import {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../types";
import { baseCollectionSlugs, betterAuthPluginSlugs } from "../constants";
import { getTimestampFields } from "./utils/get-timestamp-fields";
import { getAdminAccess } from "../../helpers/get-admin-access";

export function buildSessionsCollection({
  incomingCollections,
  pluginOptions,
  betterAuthOptions,
}: {
  incomingCollections: CollectionConfig[];
  pluginOptions: BetterAuthPluginOptions;
  betterAuthOptions: SanitizedBetterAuthOptions;
}) {
  const sessionSlug =
    pluginOptions.sessions?.slug ?? baseCollectionSlugs.sessions;
  const userSlug = pluginOptions.users?.slug ?? baseCollectionSlugs.users;
  const baPlugins = betterAuthOptions.plugins ?? null;

  const existingSessionCollection = incomingCollections.find(
    (collection) => collection.slug === sessionSlug
  ) as CollectionConfig | undefined;
  let sessionCollection: CollectionConfig = {
    slug: sessionSlug,
    admin: {
      ...existingSessionCollection?.admin,
      hidden: pluginOptions.sessions?.hidden,
      description:
        "Sessions are active sessions for users. They are used to authenticate users with a session token",
      group: pluginOptions?.collectionAdminGroup ?? "Auth",
    },
    access: {
      ...getAdminAccess(pluginOptions),
    },
    fields: [
      ...(existingSessionCollection?.fields ?? []),
      {
        name: "user",
        type: "relationship",
        relationTo: userSlug,
        required: true,
        saveToJWT: true,
        index: true,
        admin: {
          readOnly: true,
          description: "The user that the session belongs to",
        },
      },
      {
        name: "token",
        type: "text",
        required: true,
        unique: true,
        index: true,
        saveToJWT: true,
        label: "Token",
        admin: {
          description: "The unique session token",
          readOnly: true,
        },
      },
      {
        name: "expiresAt",
        type: "date",
        required: true,
        label: "Expires At",
        saveToJWT: true,
        admin: {
          description: "The date and time when the session will expire",
          readOnly: true,
        },
      },
      {
        name: "ipAddress",
        type: "text",
        label: "IP Address",
        saveToJWT: true,
        admin: {
          description: "The IP address of the device",
          readOnly: true,
        },
      },
      {
        name: "userAgent",
        type: "text",
        label: "User Agent",
        saveToJWT: true,
        admin: {
          description: "The user agent information of the device",
          readOnly: true,
        },
      },
      ...getTimestampFields(),
    ],
    ...existingSessionCollection,
  };
  if (baPlugins) {
    baPlugins.forEach((plugin) => {
      switch (plugin.id) {
        case "admin":
          sessionCollection.fields.push({
            name: "impersonatedBy",
            type: "relationship",
            relationTo: userSlug,
            required: false,
            label: "Impersonated By",
            admin: {
              readOnly: true,
              description: "The admin who is impersonating this session",
            },
          });
          break;
        case "organization":
          sessionCollection.fields.push({
            name: "activeOrganization",
            type: "relationship",
            relationTo: betterAuthPluginSlugs.organizations,
            label: "Active Organization",
            admin: {
              readOnly: true,
              description: "The currently active organization for the session",
            },
          });
          break;
        default:
          break;
      }
    });
  }

  if (pluginOptions.sessions?.collectionOverrides) {
    sessionCollection = pluginOptions.sessions.collectionOverrides({
      collection: sessionCollection,
    });
  }

  return sessionCollection;
}
