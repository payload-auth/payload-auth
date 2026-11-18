import { baModelFieldKeys, baModelKey } from "@/better-auth/plugin/constants";
import type { BetterAuthSchemas } from "@/better-auth/types";
import { set } from "../../utils/set";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../build-collections/utils/collection-schema";

/**
 * Configures the `@better-auth/oauth-provider` plugin (plugin id
 * `oauth-provider`) so its models address the Payload collections.
 *
 * Models: `oauthClient`, `oauthRefreshToken`, `oauthAccessToken`, `oauthConsent`.
 *
 * `oauthAccessToken` and `oauthConsent` are shared model keys with the older
 * `oidc-provider` / `mcp` plugins. Those plugins and this one declare
 * incompatible shapes for them (e.g. `scopes` is a string vs a string[]), so a
 * single Better Auth instance should enable only one of them.
 *
 * The `clientId` fields of the token and consent models reference
 * `oauthClient.clientId` (the public client_id string), not the document id.
 * Payload relationships are keyed by document id, so the reference is removed
 * here and the field is stored as plain indexed text. This mirrors
 * `isOauthClientNaturalKeyReference` in `helpers/get-better-auth-schema.ts`,
 * which makes the Payload collections do the same.
 */
export function configureOauthProviderPlugin(
  plugin: any,
  resolvedSchemas: BetterAuthSchemas
): void {
  const models = [
    baModelKey.oauthClient,
    baModelKey.oauthRefreshToken,
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

  const userCollectionSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.user
  );
  const sessionCollectionSlug = getSchemaCollectionSlug(
    resolvedSchemas,
    baModelKey.session
  );

  // userId -> users
  set(
    plugin,
    `schema.${baModelKey.oauthClient}.fields.userId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthClient,
      baModelFieldKeys.oauthClient.userId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthClient}.fields.userId.references.model`,
    userCollectionSlug
  );

  set(
    plugin,
    `schema.${baModelKey.oauthRefreshToken}.fields.userId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthRefreshToken,
      baModelFieldKeys.oauthRefreshToken.userId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthRefreshToken}.fields.userId.references.model`,
    userCollectionSlug
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
    `schema.${baModelKey.oauthAccessToken}.fields.userId.references.model`,
    userCollectionSlug
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
    `schema.${baModelKey.oauthConsent}.fields.userId.references.model`,
    userCollectionSlug
  );

  // sessionId -> sessions
  set(
    plugin,
    `schema.${baModelKey.oauthRefreshToken}.fields.sessionId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthRefreshToken,
      baModelFieldKeys.oauthRefreshToken.sessionId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthRefreshToken}.fields.sessionId.references.model`,
    sessionCollectionSlug
  );

  set(
    plugin,
    `schema.${baModelKey.oauthAccessToken}.fields.sessionId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthAccessToken,
      baModelFieldKeys.oauthAccessToken.sessionId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthAccessToken}.fields.sessionId.references.model`,
    sessionCollectionSlug
  );

  // refreshId -> oauthRefreshTokens
  set(
    plugin,
    `schema.${baModelKey.oauthAccessToken}.fields.refreshId.fieldName`,
    getSchemaFieldName(
      resolvedSchemas,
      baModelKey.oauthAccessToken,
      baModelFieldKeys.oauthAccessToken.refreshId
    )
  );
  set(
    plugin,
    `schema.${baModelKey.oauthAccessToken}.fields.refreshId.references.model`,
    getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthRefreshToken)
  );

  // clientId stays plain text: drop the natural-key reference to oauthClient so
  // the adapter does not treat it as a Payload relationship (document id).
  const clientIdModels = [
    baModelKey.oauthRefreshToken,
    baModelKey.oauthAccessToken,
    baModelKey.oauthConsent
  ] as const;

  clientIdModels.forEach((model) => {
    const field = plugin?.schema?.[model]?.fields?.clientId;
    if (!field) return;
    set(
      plugin,
      `schema.${model}.fields.clientId.fieldName`,
      getSchemaFieldName(
        resolvedSchemas,
        model,
        baModelFieldKeys[model].clientId
      )
    );
    delete field.references;
  });
}
