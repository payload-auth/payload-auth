import { ConfigAdminCustom } from "../types";

export function getAdminRoutes(custom: { [key: string]: any }) {
  const typedCustom = custom as ConfigAdminCustom;
  return typedCustom.betterAuth.adminRoutes;
}
