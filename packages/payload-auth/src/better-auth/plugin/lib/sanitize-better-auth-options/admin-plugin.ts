import type {
  BetterAuthSchemas,
  PayloadAuthOptions
} from "@/better-auth/types";
import { baModelKey, defaults } from "../../constants";
import { set } from "../../utils/set";
import { getSchemaCollectionSlug } from "../build-collections/utils/collection-schema";

export function configureAdminPlugin(
  plugin: any,
  options: PayloadAuthOptions,
  resolvedSchemas: BetterAuthSchemas
): void {
  plugin.defaultRole = options.users?.defaultRole ?? defaults.userRole;
  plugin.adminRoles = options.users?.adminRoles ?? [defaults.adminRole];

  set(
    plugin,
    `schema.${baModelKey.session}.fields.impersonatedBy.references.model`,
    getSchemaCollectionSlug(resolvedSchemas, baModelKey.user)
  );
}
