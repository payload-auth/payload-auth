import { baModelKey } from "@/better-auth/plugin/constants";
import type { BetterAuthSchemas } from "@/better-auth/types";
import { set } from "../../utils/set";
import { getSchemaCollectionSlug } from "../build-collections/utils/collection-schema";

export function configureDeviceAuthorizationPlugin(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas
): void {
  set(
    plugin,
    `schema.${baModelKey.deviceCode}.modelName`,
    getSchemaCollectionSlug(resolvedSchemas, baModelKey.deviceCode)
  );
}
