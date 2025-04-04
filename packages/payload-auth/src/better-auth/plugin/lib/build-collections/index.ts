import { CollectionConfig } from "payload";
import { baseCollectionSlugs, betterAuthPluginSlugs } from "../config";
import type {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../types";
import { buildUsersCollection } from "./users/index";
import { buildAccountsCollection } from "./accounts/index";
import { buildSessionsCollection } from "./sessions";
import { buildVerificationsCollection } from "./verifications";
import { buildOrganizationsCollection } from "./organizations";
import { buildMembersCollection } from "./members";
import { buildInvitationsCollection } from "./invitations";
import { buildTeamsCollection } from "./teams";
import { buildJwksCollection } from "./jwks";
import { buildApiKeysCollection } from "./api-keys";
import { buildTwoFactorsCollection } from "./two-factors";
import { buildOauthApplicationsCollection } from "./oauth-applications";
import { buildOauthAccessTokensCollection } from "./oauth-access-tokens";
import { buildOauthConsentsCollection } from "./oauth-consents";
import { buildPasskeysCollection } from "./passkeys";
import { buildSsoProvidersCollection } from "./sso-providers";

/**
 * Builds the required collections based on the BetterAuth options and plugins
 */
export function buildCollections({
  incomingCollections,
  requiredCollectionSlugs,
  pluginOptions,
  sanitizedBAOptions,
}: {
  incomingCollections: CollectionConfig[];
  requiredCollectionSlugs: Set<string>;
  pluginOptions: BetterAuthPluginOptions;
  sanitizedBAOptions: SanitizedBetterAuthOptions;
}): CollectionConfig[] {
  const buildCollectionMap = {
    [baseCollectionSlugs.users]: () =>
      buildUsersCollection({
        incomingCollections,
        sanitizedBAOptions,
        pluginOptions,
      }),
    [baseCollectionSlugs.accounts]: () =>
      buildAccountsCollection({ incomingCollections, pluginOptions }),
    [baseCollectionSlugs.sessions]: () =>
      buildSessionsCollection({
        incomingCollections,
        sanitizedBAOptions,
        pluginOptions,
      }),
    [baseCollectionSlugs.verifications]: () =>
      buildVerificationsCollection({ incomingCollections, pluginOptions }),
    [betterAuthPluginSlugs.organizations]: () =>
      buildOrganizationsCollection({ pluginOptions }),
    [betterAuthPluginSlugs.members]: () =>
      buildMembersCollection({ pluginOptions }),
    [betterAuthPluginSlugs.invitations]: () =>
      buildInvitationsCollection({ pluginOptions }),
    [betterAuthPluginSlugs.teams]: () =>
      buildTeamsCollection({ pluginOptions }),
    [betterAuthPluginSlugs.jwks]: () => buildJwksCollection({ pluginOptions }),
    [betterAuthPluginSlugs.apiKeys]: () =>
      buildApiKeysCollection({ pluginOptions }),
    [betterAuthPluginSlugs.twoFactors]: () =>
      buildTwoFactorsCollection({ pluginOptions }),
    [betterAuthPluginSlugs.oauthAccessTokens]: () =>
      buildOauthAccessTokensCollection({ pluginOptions }),
    [betterAuthPluginSlugs.oauthApplications]: () =>
      buildOauthApplicationsCollection({ pluginOptions }),
    [betterAuthPluginSlugs.oauthConsents]: () =>
      buildOauthConsentsCollection({ pluginOptions }),
    [betterAuthPluginSlugs.passkeys]: () =>
      buildPasskeysCollection({ pluginOptions }),
    [betterAuthPluginSlugs.ssoProviders]: () =>
      buildSsoProvidersCollection({ pluginOptions }),
  };

  // Build required collections and filter out incoming collections that would conflict
  const collectionConfigs = Array.from(requiredCollectionSlugs)
    .map((slug) =>
      buildCollectionMap[slug as keyof typeof buildCollectionMap]?.()
    )
    .filter(Boolean);

  return [
    ...collectionConfigs,
    ...incomingCollections.filter(
      (col) => !collectionConfigs.some((config) => config.slug === col.slug)
    ),
  ];
}
