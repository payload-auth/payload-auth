import {
  baModelFieldKeys,
  baModelKey,
  baseSlugs,
  supportedBAPluginIds
} from "@/better-auth/plugin/constants";
import type {
  BetterAuthSchemas,
  PayloadAuthOptions,
  SanitizedBetterAuthOptions
} from "@/better-auth/plugin/types";
import type { CollectionConfig, Config, Payload } from "payload";
import { checkPluginExists } from "../../helpers/check-plugin-exists";
import { set } from "../../utils/set";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../build-collections/utils/collection-schema";
import { configureAdminPlugin } from "./admin-plugin";
import { configureApiKeyPlugin } from "./api-key-plugin";
import { configureDeviceAuthorizationPlugin } from "./device-authorization-plugin";
import { configureOidcPlugin } from "./oidc-plugin";
import { configureOrganizationPlugin } from "./organizations-plugin";
import { configurePasskeyPlugin } from "./passkey-plugin";
import { configureSsoPlugin } from "./sso-plugin";
import { configureTwoFactorPlugin } from "./two-factor-plugin";
import { adminAfterRoleMiddleware } from "./utils/admin-after-role-middleware";
import { adminBeforeRoleMiddleware } from "./utils/admin-before-role-middleware";
import { applySaveToJwtReturned } from "./utils/apply-save-to-jwt-returned";
import { ensurePasswordSetBeforeUserCreate } from "./utils/ensure-password-set-before-create";
import { hashPassword, verifyPassword } from "./utils/password";
import { requireAdminInviteForSignUpMiddleware } from "./utils/require-admin-invite-for-sign-up-middleware";
import { useAdminInviteAfterEmailSignUpMiddleware } from "./utils/use-admin-invite-after-email-sign-up-middleware";

/**
 * Sanitizes the BetterAuth options
 */
export function sanitizeBetterAuthOptions({
  config,
  pluginOptions,
  resolvedSchemas,
  collections
}: {
  config: Payload["config"] | Config | Promise<Payload["config"] | Config>;
  pluginOptions: PayloadAuthOptions;
  resolvedSchemas: BetterAuthSchemas;
  collections: CollectionConfig[];
}): SanitizedBetterAuthOptions {
  const betterAuthOptions: SanitizedBetterAuthOptions = {
    ...(pluginOptions.betterAuthOptions ?? {})
  };

  const userCollectionSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.user
  );
  const adminInvitationCollectionSlug =
    pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations;

  set(betterAuthOptions, `${baModelKey.user}.modelName`, userCollectionSlug);

  const baseModels = [
    baModelKey.account,
    baModelKey.session,
    baModelKey.verification
  ] as const;
  baseModels.forEach((model) =>
    set(
      betterAuthOptions,
      `${model}.modelName`,
      getSchemaCollectionSlug(resolvedSchemas, model)
    )
  );

  set(
    betterAuthOptions,
    `${baModelKey.account}.fields.userId`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.account,
      baModelFieldKeys.account.userId
    )
  );
  set(
    betterAuthOptions,
    `${baModelKey.session}.fields.userId`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.session,
      baModelFieldKeys.session.userId
    )
  );

  set(
    betterAuthOptions,
    `emailAndPassword.enabled`,
    betterAuthOptions.emailAndPassword?.enabled ?? true
  );

  // Configure password handling
  if (
    betterAuthOptions.emailAndPassword?.enabled &&
    !pluginOptions.disableDefaultPayloadAuth
  ) {
    betterAuthOptions.emailAndPassword.password = {
      ...(betterAuthOptions.emailAndPassword.password || {}),
      verify: ({ hash, password }) => verifyPassword({ hash, password }),
      hash: (password) => hashPassword(password)
    };
  }

  // Handle admin invite for sign up
  if (pluginOptions.requireAdminInviteForSignUp) {
    betterAuthOptions.socialProviders = betterAuthOptions.socialProviders || {};
    betterAuthOptions.socialProviders = Object.fromEntries(
      Object.entries(betterAuthOptions.socialProviders).map(
        ([provider, config]) => [
          provider,
          { ...config, disableImplicitSignUp: true }
        ]
      )
    );
    requireAdminInviteForSignUpMiddleware({
      options: betterAuthOptions,
      pluginOptions
    });
  }

  useAdminInviteAfterEmailSignUpMiddleware({
    options: betterAuthOptions,
    adminInvitationCollectionSlug,
    userCollectionSlug
  });

  // Mirror Payload saveToJWT=false onto BetterAuth additionalFields so cookie cache never includes filtered fields.
  // Safe here because collections are already built (final schema is known).
  applySaveToJwtReturned({
    betterAuthOptions,
    collections,
    resolvedSchemas,
    modelKey: baModelKey.user
  });
  applySaveToJwtReturned({
    betterAuthOptions,
    collections,
    resolvedSchemas,
    modelKey: baModelKey.session
  });

  // Handle verification email blocking
  if (
    pluginOptions.users?.blockFirstBetterAuthVerificationEmail &&
    !pluginOptions.disableDefaultPayloadAuth
  ) {
    const originalSendEmail =
      betterAuthOptions?.emailVerification?.sendVerificationEmail;
    if (typeof originalSendEmail === "function") {
      betterAuthOptions.emailVerification =
        betterAuthOptions.emailVerification || {};
      betterAuthOptions.emailVerification.sendVerificationEmail = async (
        data,
        request
      ) => {
        try {
          const timeSinceCreation =
            new Date().getTime() - new Date(data.user.createdAt).getTime();
          // Skip if user was created less than a minute ago (rely on Payload's email)
          if (timeSinceCreation >= 60000) {
            await originalSendEmail(data, request);
          }
        } catch (error) {
          console.error("Error sending verification email:", error);
        }
      };
    }
  }

  // Ensure password is set before user creation
  if (!pluginOptions.disableDefaultPayloadAuth) {
    ensurePasswordSetBeforeUserCreate(betterAuthOptions);
  }

  // Process plugins
  if (betterAuthOptions.plugins?.length) {
    try {
      // Filter to only supported plugins
      const supportedPlugins = betterAuthOptions.plugins.filter((plugin) =>
        Object.values(supportedBAPluginIds).includes(plugin.id as any)
      );

      // Log warning for unsupported plugins
      if (supportedPlugins.length !== betterAuthOptions.plugins.length) {
        const unsupportedIds = betterAuthOptions.plugins
          .filter(
            (p) => !Object.values(supportedBAPluginIds).includes(p.id as any)
          )
          .map((p) => p.id)
          .join(", ");

        console.warn(
          `Unsupported BetterAuth plugins: ${unsupportedIds}. Supported: ${Object.values(supportedBAPluginIds).join(", ")}`
        );
      }

      // Configure plugins by type
      const pluginConfigurators = {
        [supportedBAPluginIds.admin]: (p: any) =>
          configureAdminPlugin(p, pluginOptions, resolvedSchemas),
        [supportedBAPluginIds.apiKey]: (p: any) =>
          configureApiKeyPlugin(p, resolvedSchemas),
        [supportedBAPluginIds.passkey]: (p: any) =>
          configurePasskeyPlugin(p, resolvedSchemas),
        [supportedBAPluginIds.organization]: (p: any) =>
          configureOrganizationPlugin(p, resolvedSchemas),
        [supportedBAPluginIds.sso]: (p: any) =>
          configureSsoPlugin(p, resolvedSchemas),
        [supportedBAPluginIds.oidc]: (p: any) =>
          configureOidcPlugin(p, resolvedSchemas),
        [supportedBAPluginIds.twoFactor]: (p: any) =>
          configureTwoFactorPlugin(p, resolvedSchemas),
        [supportedBAPluginIds.deviceAuthorization]: (p: any) =>
          configureDeviceAuthorizationPlugin(p, resolvedSchemas)
      };

      supportedPlugins.forEach((plugin) => {
        const configurator =
          pluginConfigurators[plugin.id as keyof typeof pluginConfigurators];
        if (configurator) configurator(plugin as any);
      });

      betterAuthOptions.plugins = supportedPlugins;
    } catch (error) {
      throw new Error(`Error sanitizing BetterAuth plugins: ${error}`);
    }
  }

  if (checkPluginExists(betterAuthOptions, supportedBAPluginIds.admin)) {
    adminBeforeRoleMiddleware({
      sanitizedOptions: betterAuthOptions
    });

    adminAfterRoleMiddleware({
      sanitizedOptions: betterAuthOptions
    });
  }

  return betterAuthOptions;
}
