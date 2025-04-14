import { SanitizedBetterAuthOptions } from "../types";

export function checkPasskeyPlugin(options: SanitizedBetterAuthOptions) {
  return options.plugins?.some((plugin) => plugin.id === "passkey") || false;
}
