import { baModelFieldKeys, baModelKey } from "@/better-auth/plugin/constants";
import type { BetterAuthSchemas } from "@/better-auth/types";
import { set } from "../../utils/set";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../build-collections/utils/collection-schema";

export function configureOidcPlugin(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas
): void {
  const models = [
    baModelKey.oauthApplication,
    baModelKey.oauthAccessToken,
    baModelKey.oauthConsent
  ] as const;

  models.forEach((model) =>
    set(
      plugin,
      `schema.${model}.modelName`,
      getSchemaCollectionSlug(resolvedSchemas, model)
    )
  );

  set(
    plugin,
    `schema.${baModelKey.oauthApplication}.fields.userId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthApplication,
      baModelFieldKeys.oauthApplication.userId
    )
  );

  set(
    plugin,
    `schema.${baModelKey.oauthAccessToken}.fields.userId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthAccessToken,
      baModelFieldKeys.oauthAccessToken.userId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthAccessToken}.fields.clientId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthAccessToken,
      baModelFieldKeys.oauthAccessToken.clientId
    )
  );

  set(
    plugin,
    `schema.${baModelKey.oauthConsent}.fields.userId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthConsent,
      baModelFieldKeys.oauthConsent.userId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthConsent}.fields.clientId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthConsent,
      baModelFieldKeys.oauthConsent.clientId
    )
  );
}
