import { ConfigAdminCustom } from "../types";

export function getAdminRoutes(
  config: any
): ConfigAdminCustom["betterAuth"]["adminRoutes"] | undefined {
  return config?.admin?.custom?.betterAuth?.adminRoutes;
}
