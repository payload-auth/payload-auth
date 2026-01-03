import type { BetterAuthOptions } from "../types";

/**
 * Checks if a plugin with the specified ID exists in the Better Auth options
 *
 * This utility function examines the plugins array in the provided Better Auth options
 * to determine if a plugin with the given ID is already registered.
 *
 * @param options - The Better Auth configuration options
 * @param pluginId - The unique identifier of the plugin to check for
 * @returns `true` if a plugin with the specified ID exists, `false` otherwise
 */
export function checkPluginExists(
  options: BetterAuthOptions,
  pluginId: string
): boolean {
  return options.plugins?.some((plugin) => plugin.id === pluginId) || false;
}
