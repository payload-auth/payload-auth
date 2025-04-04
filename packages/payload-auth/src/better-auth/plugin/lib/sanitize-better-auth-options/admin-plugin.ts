import type { BetterAuthPluginOptions } from "../../types";

type AdminPluginConfig = {
  plugin: any;
  options: BetterAuthPluginOptions;
};

export function configureAdminPlugin({ plugin, options }: AdminPluginConfig) {
  plugin.adminRoles = options.users?.adminRoles ?? ["admin"];
}
