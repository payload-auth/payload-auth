import { BetterAuthPluginOptions } from "../types";

export function getAllRoleOptions(pluginOptions: BetterAuthPluginOptions) {
  const adminRoles = pluginOptions.users?.adminRoles ?? ["admin"];
  const roles = pluginOptions.users?.roles ?? ["user"];
  const allRoleOptions = [...new Set([...adminRoles, ...roles])].map(
    (role) => ({
      label: role
        .split(/[-_\s]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value: role,
    })
  );
  return allRoleOptions;
}
