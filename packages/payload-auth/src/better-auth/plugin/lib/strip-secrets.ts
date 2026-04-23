import type { PayloadAuthOptions } from "../types";

/**
 * Returns a shallow clone of `pluginOptions` with secret values removed:
 *
 *  - `betterAuthOptions.secret`
 *  - `betterAuthOptions.socialProviders[*].clientSecret`
 *
 * This is intended for values that will be passed as `serverProps` to admin
 * view components. Payload serializes view `serverProps` into the admin
 * client config, which ends up in the RSC payload of the HTML response, so
 * anything in `serverProps` is visible to anyone who can load the login page.
 *
 * `clientId` is preserved — it is public by design and needed to render the
 * "Sign in with <provider>" button.
 */
export function stripSecretsFromPluginOptions(
  pluginOptions: PayloadAuthOptions
): PayloadAuthOptions {
  const clone: PayloadAuthOptions = { ...pluginOptions };
  if (!clone.betterAuthOptions) return clone;

  const ba = { ...clone.betterAuthOptions };
  delete (ba as Record<string, unknown>).secret;

  if (ba.socialProviders) {
    ba.socialProviders = Object.fromEntries(
      Object.entries(ba.socialProviders).map(([provider, cfg]) => {
        if (!cfg || typeof cfg !== "object") return [provider, cfg];
        const { clientSecret: _cs, ...rest } = cfg as Record<string, unknown>;
        return [provider, rest];
      })
    ) as typeof ba.socialProviders;
  }

  clone.betterAuthOptions = ba;
  return clone;
}
