import { baModelKey } from "@/better-auth/plugin/constants";
import type { BetterAuthSchemas } from "@/better-auth/types";
import { set } from "../../utils/set";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../build-collections/utils/collection-schema";

/**
 * Maps a Better Auth OAuth provider reference onto the Payload collection and
 * field names this plugin builds, so queries issued by the plugin target the
 * configured collections instead of Better Auth's default model names.
 */
function configureReference(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas,
  model: keyof typeof baModelKey,
  fieldKey: string,
  targetModel: keyof typeof baModelKey
): void {
  set(
    plugin,
    `schema.${baModelKey[model]}.fields.${fieldKey}.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey[model] as any,
      fieldKey as any
    )
  );
  set(
    plugin,
    `schema.${baModelKey[model]}.fields.${fieldKey}.references.model`,
    getSchemaCollectionSlug(resolvedSchemas, baModelKey[targetModel] as any)
  );
}

export function configureOidcPlugin(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas
): void {
  const models = [
    baModelKey.oauthClient,
    baModelKey.oauthResource,
    baModelKey.oauthClientResource,
    baModelKey.oauthRefreshToken,
    baModelKey.oauthAccessToken,
    baModelKey.oauthConsent,
    baModelKey.oauthClientAssertion
  ] as const;

  models.forEach((model) =>
    set(
      plugin,
      `schema.${model}.modelName`,
      getSchemaCollectionSlug(resolvedSchemas, model)
    )
  );

  configureReference(plugin, resolvedSchemas, "oauthClient", "userId", "user");

  configureReference(
    plugin,
    resolvedSchemas,
    "oauthAccessToken",
    "userId",
    "user"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthAccessToken",
    "clientId",
    "oauthClient"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthAccessToken",
    "sessionId",
    "session"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthAccessToken",
    "refreshId",
    "oauthRefreshToken"
  );

  configureReference(
    plugin,
    resolvedSchemas,
    "oauthConsent",
    "userId",
    "user"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthConsent",
    "clientId",
    "oauthClient"
  );

  configureReference(
    plugin,
    resolvedSchemas,
    "oauthRefreshToken",
    "userId",
    "user"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthRefreshToken",
    "clientId",
    "oauthClient"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthRefreshToken",
    "sessionId",
    "session"
  );

  configureReference(
    plugin,
    resolvedSchemas,
    "oauthClientResource",
    "clientId",
    "oauthClient"
  );
  configureReference(
    plugin,
    resolvedSchemas,
    "oauthClientResource",
    "resourceId",
    "oauthResource"
  );
}
