import { baModelFieldKeys, baModelKey } from "@/better-auth/plugin/constants";
import { set } from "@/better-auth/plugin/utils/set";
import type { BetterAuthSchemas } from "@/better-auth/types";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../build-collections/utils/collection-schema";

export function configureSsoPlugin(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas
): void {
  const model = baModelKey.ssoProvider;
  set(
    plugin,
    `schema.${model}.modelName`,
    getSchemaCollectionSlug(resolvedSchemas, model)
  );
  set(
    plugin,
    `schema.${model}.fields.userId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      model,
      baModelFieldKeys.ssoProvider.userId
    )
  );
}
