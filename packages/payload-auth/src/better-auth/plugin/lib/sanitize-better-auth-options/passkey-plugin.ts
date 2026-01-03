import { baModelFieldKeys, baModelKey } from "@/better-auth/plugin/constants";
import type { BetterAuthSchemas } from "@/better-auth/types";
import { set } from "../../utils/set";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../build-collections/utils/collection-schema";

export function configurePasskeyPlugin(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas
): void {
  const model = baModelKey.passkey;
  set(
    plugin,
    `schema.${model}.modelName`,
    getSchemaCollectionSlug(resolvedSchemas, model)
  );
  set(
    plugin,
    `schema.${model}.fields.userId.fieldName`,
    getSchemaFieldName(resolvedSchemas, model, baModelFieldKeys.passkey.userId)
  );
  set(
    plugin,
    `schema.${model}.fields.userId.references.model`,
    getSchemaCollectionSlug(resolvedSchemas, baModelKey.user)
  );
}
