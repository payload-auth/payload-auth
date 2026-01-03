import { baModelKeyToSlug, baseSlugs } from "../constants";
import type { PayloadAuthOptions } from "../types";

export function getDefaultCollectionSlug({
  pluginOptions,
  modelKey
}: {
  pluginOptions: PayloadAuthOptions;
  modelKey: string;
}): string {
  const baseSlug =
    baModelKeyToSlug[modelKey as keyof typeof baModelKeyToSlug] ?? modelKey;

  switch (modelKey) {
    case "user":
      return pluginOptions.users?.slug ?? baseSlugs.users;
    case "account":
      return pluginOptions.accounts?.slug ?? baseSlugs.accounts;
    case "session":
      return pluginOptions.sessions?.slug ?? baseSlugs.sessions;
    case "verification":
      return pluginOptions.verifications?.slug ?? baseSlugs.verifications;
    case "adminInvitation":
      return pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations;
    default:
      return baseSlug;
  }
}
