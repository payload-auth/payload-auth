import type { DBFieldAttribute } from "better-auth/db";
import { getAuthTables } from "better-auth/db";
import type { ModelKey } from "@/better-auth/generated-types";
import {
  baModelFieldKeysToFieldNames,
  baModelKey,
  defaults
} from "../constants";
import { BetterAuthSchemas, PayloadAuthOptions } from "../types";
import { set } from "../utils/set";
import { getDefaultCollectionSlug } from "./get-collection-slug";

/**
 * Whether a schema field is a "natural key" reference to the oauth-provider
 * plugin's `oauthClient` model, i.e. its `references.field` is the public
 * `clientId` (an opaque OAuth client_id string chosen by the plugin or the
 * registering client) rather than the document `id`.
 *
 * Payload relationships are always keyed by document id, so these fields cannot
 * be mapped to relationships: Better Auth reads and writes the public
 * `client_id` string, which would never match a Payload document id. They are
 * stored as plain indexed text instead, under their own `clientId` field name.
 *
 * The older oidc-provider / mcp plugins reference `oauthApplication.clientId`;
 * those fields are deliberately left untouched.
 */
export function isOauthClientNaturalKeyReference(
  references: DBFieldAttribute["references"],
  pluginOptions: PayloadAuthOptions
): boolean {
  if (!references || !references.field || references.field === "id") {
    return false;
  }
  const oauthClientSlug = getDefaultCollectionSlug({
    modelKey: baModelKey.oauthClient,
    pluginOptions
  });
  return (
    references.model === baModelKey.oauthClient ||
    references.model === oauthClientSlug
  );
}

/**
 * A consistent BetterAuth schema generator.
 *
 * Differences from the original `getSchema` implementation in BetterAuth:
 * 1. Keys in the returned object are always the **static table identifiers** coming from
 *    `getAuthTables`, never the possibly-overridden `modelName`.  This guarantees that
 *    subsequent look-ups remain stable even if the user renames collections.
 * 2. Each schema entry now contains an explicit `modelName` property exposing the current
 *    (potentially user-overridden) model name, while `fields` continue to be referenced by
 *    their static BetterAuth field keys.
 * 3. When converting fields, we store them under their original key (`actualFields[key] = field`)
 *    instead of `field.fieldName || key` to avoid accidental renames.
 *
 * @param config - The BetterAuth options fed into `getAuthTables`.
 * @returns A map keyed by static table keys, each value containing `{ modelName, fields, order }`.
 */
export function getDefaultBetterAuthSchema(
  pluginOptions: PayloadAuthOptions
): BetterAuthSchemas {
  const betterAuthOptions = pluginOptions.betterAuthOptions ?? {};

  // We need to add the additional role field to the user schema here or else the built collections will not pick it up.
  set(betterAuthOptions as any, `${baModelKey.user}.additionalFields.role`, {
    type: "string",
    defaultValue: pluginOptions.users?.defaultRole || defaults.userRole,
    input: false
  });

  const tables = getAuthTables(betterAuthOptions);

  const schema: Partial<BetterAuthSchemas> = {};

  for (const modelKey of Object.keys(tables) as ModelKey[]) {
    const table = tables[modelKey];

    // Resolve the canonical collection slug / model name for this key
    const resolvedModelName = getDefaultCollectionSlug({
      modelKey,
      pluginOptions
    });

    const defaultFieldMap =
      (baModelFieldKeysToFieldNames as Record<string, Record<string, string>>)[
        modelKey
      ] ?? {};

    const actualFields: Record<string, DBFieldAttribute> = {};

    Object.entries(table.fields).forEach(([fieldKey, fieldValue]) => {
      // oauth-provider `clientId` fields reference `oauthClient.clientId`, not
      // the document id, so they stay plain text (see helper above).
      if (
        isOauthClientNaturalKeyReference(fieldValue.references, pluginOptions)
      ) {
        const { references: _references, ...rest } = fieldValue;
        actualFields[fieldKey] = { ...rest, fieldName: fieldKey };
        return;
      }

      // Build the field ensuring a fieldName exists
      const newField: DBFieldAttribute = {
        ...fieldValue,
        fieldName: defaultFieldMap[fieldKey] ?? fieldKey
      };

      // Rewrite references to use the resolved modelName for the target table
      if (fieldValue.references) {
        const refModelKey = fieldValue.references.model as string;
        const resolvedRefModelName = getDefaultCollectionSlug({
          modelKey: refModelKey,
          pluginOptions
        });
        newField.references = {
          model: resolvedRefModelName,
          field: fieldValue.references.field
        };
      }

      actualFields[fieldKey] = newField;
    });

    if (schema[modelKey]) {
      schema[modelKey].fields = {
        ...schema[modelKey].fields,
        ...actualFields
      };
      continue;
    }

    schema[modelKey] = {
      modelName: resolvedModelName,
      fields: actualFields,
      order: table.order || Infinity
    };
  }

  return schema as BetterAuthSchemas;
}
