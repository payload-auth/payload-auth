import type { BetterAuthPluginOptions } from "../../types";

export function configureAdminPlugin(
  plugin: any,
  options: BetterAuthPluginOptions
) {
  plugin.adminRoles = options.users?.adminRoles ?? ["admin"];
}
