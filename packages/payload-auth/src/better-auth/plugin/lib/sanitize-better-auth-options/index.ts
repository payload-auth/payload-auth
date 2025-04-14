import { configureAdminPlugin } from "./admin-plugin";
import { configureApiKeyPlugin } from "./api-key-plugin";
import { configureOrganizationPlugin } from "./organizations-plugin";
import { configurePasskeyPlugin } from "./passkey-plugin";
import { configureSsoPlugin } from "./sso-plugin";
import { configureOidcPlugin } from "./oidc-plugin";
import type {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../types";
import { supportedBetterAuthPluginIds } from "../constants";
import { ensurePasswordSetBeforeUserCreate } from "./utils/ensure-password-set-before-create";
import { verifyPassword, hashPassword } from "./utils/password";
import type { Config, Payload } from "payload";
import { saveToJwtMiddleware } from "./utils/save-to-jwt-middleware";
/**
 * Sanitizes the BetterAuth options
 */
export function sanitizeBetterAuthOptions({
  config,
  options,
}: {
  config: Payload["config"] | Config;
  options: BetterAuthPluginOptions;
}): SanitizedBetterAuthOptions {
  const baOptions = options.betterAuthOptions || {};
  const userCollectionSlug = options.users?.slug ?? "users";
  const accountCollectionSlug = options.accounts?.slug ?? "accounts";
  const sessionCollectionSlug = options.sessions?.slug ?? "sessions";
  const verificationCollectionSlug =
    options.verifications?.slug ?? "verifications";

  // Initialize with base configuration
  let res: SanitizedBetterAuthOptions = {
    ...baOptions,
    user: {
      ...(baOptions.user || {}),
      modelName: userCollectionSlug,
    },
    account: {
      ...(baOptions.account || {}),
      modelName: accountCollectionSlug,
      fields: { userId: "user" },
    },
    session: {
      ...(baOptions.session || {}),
      modelName: sessionCollectionSlug,
      fields: { userId: "user" },
    },
    verification: {
      ...(baOptions.verification || {}),
      modelName: verificationCollectionSlug,
    },
    emailAndPassword: {
      ...(baOptions.emailAndPassword || {}),
      enabled: baOptions.emailAndPassword?.enabled ?? true,
    },
  };

  // Configure password handling
  if (res.emailAndPassword?.enabled && !options.disableDefaultPayloadAuth) {
    res.emailAndPassword.password = {
      ...(res.emailAndPassword.password || {}),
      verify: ({ hash, password }) => verifyPassword({ hash, password }),
      hash: (password) => hashPassword(password),
    };
  }

  // Handle verification email blocking
  if (
    options.users?.blockFirstBetterAuthVerificationEmail &&
    !options.disableDefaultPayloadAuth
  ) {
    const originalSendEmail =
      baOptions?.emailVerification?.sendVerificationEmail;
    if (typeof originalSendEmail === "function") {
      res.emailVerification = res.emailVerification || {};
      res.emailVerification.sendVerificationEmail = async (data, request) => {
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
  if (!options.disableDefaultPayloadAuth) {
    ensurePasswordSetBeforeUserCreate(res);
  }

  // Process plugins
  if (res.plugins?.length) {
    try {
      // Filter to only supported plugins
      const supportedPlugins = res.plugins.filter((plugin) =>
        Object.values(supportedBetterAuthPluginIds).includes(plugin.id as any)
      );

      // Log warning for unsupported plugins
      if (supportedPlugins.length !== res.plugins.length) {
        const unsupportedIds = res.plugins
          .filter(
            (p) =>
              !Object.values(supportedBetterAuthPluginIds).includes(p.id as any)
          )
          .map((p) => p.id)
          .join(", ");

        console.warn(
          `Unsupported BetterAuth plugins: ${unsupportedIds}. Supported: ${Object.values(supportedBetterAuthPluginIds).join(", ")}`
        );
      }

      // Configure plugins by type
      const pluginConfigurators = {
        [supportedBetterAuthPluginIds.admin]: (p: any) =>
          configureAdminPlugin(p, options),
        [supportedBetterAuthPluginIds.apiKey]: (p: any) =>
          configureApiKeyPlugin(p),
        [supportedBetterAuthPluginIds.passkey]: (p: any) =>
          configurePasskeyPlugin(p),
        [supportedBetterAuthPluginIds.organization]: (p: any) =>
          configureOrganizationPlugin(p),
        [supportedBetterAuthPluginIds.sso]: (p: any) => configureSsoPlugin(p),
        [supportedBetterAuthPluginIds.oidc]: (p: any) => configureOidcPlugin(p),
      };

      supportedPlugins.forEach((plugin) => {
        const configurator =
          pluginConfigurators[plugin.id as keyof typeof pluginConfigurators];
        if (configurator) configurator(plugin as any);
      });

      res.plugins = supportedPlugins;
    } catch (error) {
      throw new Error(`Error sanitizing BetterAuth plugins: ${error}`);
    }
  }

  saveToJwtMiddleware({
    sanitizedOptions: res,
    payloadConfig: config,
    pluginOptions: options,
  });

  return res;
}
