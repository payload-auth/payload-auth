import type { BetterAuthOptions, Where } from "better-auth";
import type { DBFieldAttribute } from "better-auth/db";
import { getAuthTables } from "better-auth/db";
import {
  type BasePayload,
  type CollectionSlug,
  flattenAllFields,
  type Where as PayloadWhere
} from "payload";
import type { ModelKey } from "@/better-auth/generated-types";
import {
  getCollectionByModelKey,
  getCollectionFieldNameByFieldKeyUntyped,
  getFieldKeyByCollectionFieldName
} from "@/better-auth/plugin/helpers/get-collection";

export const createTransform = (
  options: BetterAuthOptions,
  enableDebugLogs: boolean
) => {
  const schema = getAuthTables(options);

  function debugLog(message: any[]) {
    if (enableDebugLogs) {
      console.log(`[payload-db-adapter]`, ...message);
    }
  }

  /**
   * Maps a BetterAuth schema model name to its corresponding Payload CMS collection slug.
   *
   * This function resolves the appropriate collection slug by:
   * 1. Looking up the model in the BetterAuth schema to find its configured modelName
   * 2. Falling back to the original model name if no mapping exists
   *
   * Collection slug resolution follows these rules:
   * - For base collections: The sanitizeBetterAuthOptions function ensures the collection slug
   *   from plugin options is set as the model name in the schema
   * - For plugins: The betterAuthPluginSlugs constant is used as the modelName
   *
   * @param model - The BetterAuth model name to resolve
   * @returns The corresponding Payload CMS collection slug
   *
   * @example
   * // If schema['user'].modelName is 'users'
   * getCollectionSlug('user') // Returns 'users'
   *
   * @example
   * // If model doesn't exist in schema
   * getCollectionSlug('custom') // Returns 'custom'
   *
   * @warning If a collection is overridden using the collectionOverride option
   * without updating the schema mapping, this function may return incorrect slugs
   */
  function getCollectionSlug(model: ModelKey): CollectionSlug {
    // First try to get the modelName from schema, otherwise fall back to the original model name
    const collection = schema?.[model]?.modelName || model;
    debugLog(["getCollectionSlug:", { model, resolvedSlug: collection }]);
    return collection as CollectionSlug;
  }

  /**
   * Resolves a model identifier to its BA schema model key.
   *
   * Accepts either a BA model key ("user") or a Payload collection slug ("users"/"members")
   * and returns the canonical BA model key used to index the schema.
   *
   * This enables adapter functions (transformInput, transformOutput, convertWhereClause)
   * to work correctly regardless of whether callers pass a BA model key or a Payload slug.
   */
  const modelKeyCache = new Map<string, ModelKey>();

  function resolveModelKey(model: string): ModelKey {
    const cached = modelKeyCache.get(model);
    if (cached) return cached;

    // Direct match — already a BA model key
    if (schema?.[model]) {
      modelKeyCache.set(model, model as ModelKey);
      return model as ModelKey;
    }

    // Reverse lookup — find the BA model key whose modelName matches this Payload slug
    for (const [key, value] of Object.entries(schema)) {
      if (value.modelName === model) {
        modelKeyCache.set(model, key as ModelKey);
        return key as ModelKey;
      }
    }

    // No match found — return as-is (custom collections not in the BA schema)
    return model as ModelKey;
  }

  /**
   * Checks if a field in the Payload collection is a relationship or upload field.
   *
   * @param payload - The Payload client instance
   * @param collectionSlug - The slug of the collection
   * @param fieldName - The name of the field to check
   * @returns True if the field is a relationship or upload field, false otherwise
   */
  const flattenedFieldsCache = new Map<string, ReturnType<typeof flattenAllFields>>();

  function isPayloadRelationship(
    payload: BasePayload,
    collectionSlug: string,
    fieldName: string
  ): boolean {
    const collection = payload.collections[collectionSlug];
    if (!collection) return false;

    let fields = flattenedFieldsCache.get(collectionSlug);
    if (!fields) {
      fields = flattenAllFields({ fields: collection.config.fields });
      flattenedFieldsCache.set(collectionSlug, fields);
    }
    const field = fields.find((f) => f.name === fieldName);

    return field?.type === "relationship" || field?.type === "upload";
  }

  /**
   * Maps a BetterAuth schema field to its corresponding Payload CMS field name.
   *
   * This function resolves the appropriate field name by:
   * 1. Preserving 'id' or '_id' fields as-is (special case handling)
   * 2. Looking up the field in the BetterAuth schema to find its configured fieldName
   * 3. Falling back to the original field name if no mapping exists
   *
   * @param model - The BetterAuth model name containing the field
   * @param field - The original field name to resolve
   * @returns The corresponding Payload CMS field name
   *
   * @example
   * // If schema['user'].fields['email'].fieldName is 'emailAddress'
   * getFieldName('user', 'email') // Returns 'emailAddress'
   *
   * @example
   * // Special case for ID fields
   * getFieldName('user', 'id') // Always returns 'id'
   *
   * @example
   * // If field doesn't exist in schema or has no fieldName mapping
   * getFieldName('user', 'custom') // Returns 'custom'
   *
   * @warning If a fieldName is overridden in the payload collection config using the collectionOverride option
   * without updating the schema mapping, this function may return incorrect field names
   */
  function getFieldName(model: ModelKey, field: string): string {
    // Special case: 'id' or '_id' is always preserved as-is
    if (["id", "_id"].includes(field)) {
      return field;
    }

    // Look up the field in the schema
    const fieldDefinition = schema[model]?.fields[field];

    // Use the configured fieldName if available, otherwise fall back to original
    const fieldName = fieldDefinition?.fieldName || field;

    // Log the field resolution for debugging
    debugLog(["getField: ", { model, originalField: field, fieldName }]);

    return fieldName;
  }

  /**
   * Determines if a field is a relationship field by checking for a references property.
   *
   * Relationship fields in the schema have a 'references' property that points to another model.
   * This function checks if this property exists to identify relationship fields.
   *
   * @param fieldKey - The key of the field to check in the schema
   * @param schemaFields - Object containing all fields from the schema for a specific model
   * @returns True if the field is a relationship field (has references), false otherwise
   *
   * @example
   * // If schema.user.fields.posts has { references: {} }
   * isRelationshipField('posts', schema.user.fields) // Returns true
   *
   * @example
   * // If schema.user.fields.email has no references property
   * isRelationshipField('email', schema.user.fields) // Returns false
   */
  function isRelationshipField(
    fieldKey: string,
    schemaFields: Record<string, DBFieldAttribute>
  ): boolean {
    // A field is a relationship field if it has a 'references' property defined
    return schemaFields[fieldKey]?.references !== undefined;
  }
  /**
   * Extracts a single ID value from a Payload where clause if it represents a simple ID query.
   *
   * This function analyzes a Payload where clause to determine if it's a simple query for a
   * single document by ID. It supports both 'id' and '_id' fields with 'equals' or 'contains'
   * operators. This is useful for optimizing queries when we only need to fetch a single document.
   *
   * @param where - The Payload where clause to analyze
   * @returns The ID value (string or number) if the where clause is a simple ID query, null otherwise
   *
   * @example
   * // Returns '123' for a simple equals query
   * singleIdQuery({ id: { equals: '123' } }) // '123'
   *
   * @example
   * // Returns 456 for a simple equals query with number ID
   * singleIdQuery({ _id: { equals: 456 } }) // 456
   *
   * @example
   * // Returns '789' for a contains query with a single value
   * singleIdQuery({ id: { contains: ['789'] } }) // '789'
   *
   * @example
   * // Returns null for complex queries
   * singleIdQuery({ and: [{ id: { equals: '123' } }] }) // null
   */
  function singleIdQuery(where: PayloadWhere) {
    // Return null for empty where clauses or complex queries with 'and'/'or' operators
    if (!where || "and" in where || "or" in where) return null;

    // Check if the where clause contains either 'id' or '_id' field
    if (["id", "_id"].some((field) => field in where)) {
      // Determine which ID field is being used (support both 'id' and '_id')
      const idField = "id" in where ? "id" : "_id";
      const condition = where[idField];

      // Process the equals operator case
      if (
        condition &&
        typeof condition === "object" &&
        !Array.isArray(condition) &&
        "equals" in condition
      ) {
        const value = condition.equals;
        // Only return string or number ID values
        if (typeof value === "string" || typeof value === "number") {
          return value;
        }
      }

      // Process the contains operator case with a single value
      if (
        condition &&
        typeof condition === "object" &&
        !Array.isArray(condition) &&
        "contains" in condition &&
        Array.isArray(condition.contains) &&
        condition.contains.length === 1
      ) {
        const value = condition.contains[0];
        // Only return string or number ID values
        if (typeof value === "string" || typeof value === "number") {
          return value;
        }
      }
    }

    // Return null if no valid ID query was found
    return null;
  }

  /**
   * Normalizes data values based on field type and required ID type
   *
   * This function handles type conversion for relationship fields to ensure
   * IDs are in the correct format (string or number) based on the configuration.
   *
   * @param key - The field key/name
   * @param value - The value to normalize
   * @param isRelatedField - Whether this field is a relationship field
   * @param idType - The expected ID type ('number' or 'text')
   * @returns The normalized value
   */
  function normalizeData({
    key,
    value,
    isRelatedField,
    idType
  }: {
    key: string;
    value: any;
    isRelatedField: boolean;
    idType: "number" | "text";
  }) {
    // Skip processing for null/undefined values
    if (value === null || value === undefined) {
      return value;
    }

    if (["id", "_id"].includes(key)) {
      if (typeof value === "string" && idType === "number") {
        const parsed = Number(value);
        if (!isNaN(parsed)) {
          debugLog([
            `ID conversion: ${key} converting string ID to number`,
            { original: value, converted: parsed }
          ]);
          return parsed;
        }
      }
      if (typeof value === "number" && idType === "text") {
        const stringId = String(value);
        debugLog([
          `ID conversion: ${key} converting number ID to string`,
          { original: value, converted: stringId }
        ]);
        return stringId;
      }
    }

    // Only process relationship fields that need type conversion
    if (isRelatedField) {
      // Handle single ID value conversion
      if (typeof value === "string" && idType === "number") {
        const parsed = Number(value);
        if (!isNaN(parsed)) {
          debugLog([
            `ID conversion: ${key} converting string ID to number`,
            { original: value, converted: parsed }
          ]);
          return parsed;
        }
      } else if (typeof value === "number" && idType === "text") {
        const stringId = String(value);
        debugLog([
          `ID conversion: ${key} converting number ID to string`,
          { original: value, converted: stringId }
        ]);
        return stringId;
      }

      // Handle array of IDs - map each value to the correct type
      if (Array.isArray(value)) {
        return value.map((id) => {
          // Skip null/undefined values in arrays
          if (id === null || id === undefined) return id;

          if (idType === "number" && typeof id === "string") {
            const parsed = Number(id);
            return !isNaN(parsed) ? parsed : id;
          } else if (idType === "text" && typeof id === "number") {
            return String(id);
          }
          return id;
        });
      }
    }

    // Handle role fields (Coming from better auth, will be a single string separated by commas if there are multiple roles)
    if (key === "role" || key === "roles") {
      if (Array.isArray(value)) {
        return value.map((role: string) =>
          typeof role === "string" ? role.trim().toLowerCase() : role
        );
      }
      if (typeof value === "string") {
        return value.split(",").map((role: string) => role.trim().toLowerCase());
      }
      return value;
    }

    // Return original value if no conversion was needed or applicable
    return value;
  }

  /**
   * Transforms input data from better-auth to Payload CMS format
   *
   * This function handles:
   * 1. Field name mapping according to schema definitions
   * 2. ID type conversion for relationship fields
   * 3. Proper data normalization based on field types
   *
   * @param data - The input data from better-auth
   * @param model - The model name in the schema
   * @param idType - The expected ID type ('number' or 'text')
   * @returns Transformed data compatible with Payload CMS
   */
  function transformInput({
    data,
    model: rawModel,
    idType,
    payload
  }: {
    data: Record<string, any>;
    model: ModelKey;
    idType: "number" | "text";
    payload: BasePayload;
  }): Record<string, any> {
    const model = resolveModelKey(rawModel);
    const transformedData: Record<string, any> = {};
    const schemaFields = schema?.[model]?.fields ?? {};

    // Process each field in the input data
    Object.entries(data).forEach(([key, value]) => {
      // Skip undefined values (but allow null through to clear fields)
      if (value === undefined) {
        return;
      }

      // Get the mapped field name from schema (if any)
      const schemaFieldName = schemaFields[key]?.fieldName;
      const targetFieldName = schemaFieldName || key;

      // Check Payload schema for relationship fields
      const collectionSlug = getCollectionSlug(model);
      const isPayloadRel = isPayloadRelationship(
        payload,
        collectionSlug,
        targetFieldName
      );

      // Determine if this is a relationship field
      const isRelatedField =
        isRelationshipField(key, schemaFields) || isPayloadRel;

      // Normalize the data value based on field type and ID type
      const normalizedData = normalizeData({
        idType,
        key,
        value,
        isRelatedField
      });

      const targetFieldKey = getCollectionFieldNameByFieldKeyUntyped(
        getCollectionByModelKey(payload.collections, model),
        targetFieldName
      );
      transformedData[targetFieldKey] = normalizedData;
    });

    return transformedData;
  }

  /**
   * Checks if a value is a Payload join result (has docs array structure)
   */
  function isJoinResult(
    value: any
  ): value is { docs: any[]; hasNextPage?: boolean; totalDocs?: number } {
    return (
      value !== null &&
      typeof value === "object" &&
      "docs" in value &&
      Array.isArray(value.docs)
    );
  }

  /**
   * Flattens a Payload join result to just the array of documents.
   * Handles both direct documents and polymorphic { relationTo, value } format.
   */
  function flattenJoinResult(joinResult: { docs: any[] }): any[] {
    return joinResult.docs.map((item) => {
      // Handle polymorphic join format: { relationTo: string, value: doc }
      if (
        item &&
        typeof item === "object" &&
        "value" in item &&
        "relationTo" in item
      ) {
        return item.value;
      }
      return item;
    });
  }

  /**
   * Transforms Payload CMS document output to match BetterAuth schema expectations.
   *
   * This function handles several critical transformations:
   *
   * 1. ID Conversion: Ensures all ID fields are strings as required by BetterAuth
   *    (see: https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/db/schema.ts#L125)
   *
   * 2. Relationship Field Mapping: Aligns relationship fields with BetterAuth schema naming conventions
   *    and ensures proper ID type handling
   *
   * 3. Date Conversion: Transforms date strings from Payload into Date objects for BetterAuth
   *
   * 4. Join Result Flattening: Converts Payload's { docs: [...] } join format to plain arrays
   *
   * Note: While setting depth: 1 in Payload operations simplifies this process by avoiding
   * deeply nested objects, we maintain comprehensive checks for robustness.
   *
   * @param doc - The document returned from Payload CMS
   * @param model - The model name in the BetterAuth schema
   * @returns The transformed document compatible with BetterAuth
   */
  function transformOutput<T extends Record<string, any> | null>({
    doc,
    model: rawModel,
    payload
  }: {
    doc: T;
    model: ModelKey;
    payload: BasePayload;
  }): T {
    if (!doc || typeof doc !== "object") return doc;

    const model = resolveModelKey(rawModel);
    const result = { ...doc };
    const schemaFields = schema?.[model]?.fields ?? {};

    // Identify relationship fields with custom field name mappings
    const relationshipFields = Object.fromEntries(
      Object.entries(schemaFields).filter(([key]) => {
        if (isRelationshipField(key, schemaFields)) return true;

        // Also check payload schema
        const fieldName = schemaFields[key]?.fieldName || key;
        const collectionSlug = getCollectionSlug(model);
        return isPayloadRelationship(payload, collectionSlug, fieldName);
      })
    );
    const dateFields = Object.fromEntries(
      Object.entries(schemaFields).filter(([_, value]) => value.type === "date")
    );

    // First make sure all the fields keys are correct
    Object.keys(result).forEach((key) => {
      const targetFieldKey = getFieldKeyByCollectionFieldName(
        getCollectionByModelKey(payload.collections, model),
        key
      );
      if (targetFieldKey !== key) {
        result[targetFieldKey] = result[key];
        delete result[key];
      }
    });

    Object.entries(doc).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      const targetFieldKey = getFieldKeyByCollectionFieldName(
        getCollectionByModelKey(payload.collections, model),
        key
      );

      // Convert ID fields to strings for BetterAuth compatibility
      if (["id", "_id"].includes(key)) {
        result[targetFieldKey] = String(value);
        return;
      }
	    
      // Convert role array to comma separated string
      if ((targetFieldKey === "role" || targetFieldKey === "roles") && Array.isArray(value)) {
				result[targetFieldKey] = value.join(",")
			}
      
      // Flatten join results from { docs: [...] } to plain arrays,
      // then transform each nested document so relationship fields
      // (e.g. member.userId) are normalized to string IDs for BetterAuth.
      if (isJoinResult(value)) {
        debugLog([
          "transformOutput: flattening join result",
          { key, targetFieldKey, isArray: Array.isArray(value.docs) }
        ]);
        const flatDocs = flattenJoinResult(value);

        // Determine the BA model key for the joined collection.
        // The join field on the parent collection points to a target collection;
        // resolve that slug back to a BA model key so we can transform nested docs.
        const parentCollectionSlug = getCollectionSlug(model);
        const parentCollection = payload.collections[parentCollectionSlug];
        if (parentCollection) {
          const joinField = flattenAllFields({ fields: parentCollection.config.fields })
            .find((f: any) => f.type === "join" && f.name === key);
          if (joinField && "collection" in joinField) {
            const joinedModelKey = resolveModelKey(joinField.collection as string);
            result[targetFieldKey] = flatDocs.map((d: any) =>
              transformOutput({ doc: d, model: joinedModelKey, payload })
            );
            return;
          }
        }

        result[targetFieldKey] = flatDocs;
        return;
      }

      // Handle relationship fields (both renamed and non-renamed)
      const originalRelatedFieldKey = Object.keys(relationshipFields).find(
        (k) => {
          const mappedName = relationshipFields[k].fieldName || k;
          return mappedName === key;
        }
      );
      if (originalRelatedFieldKey) {
        normalizeDocumentIds(result, originalRelatedFieldKey, key, value);
        return;
      }

      // Handle date fields (both renamed and non-renamed)
      const originalDateFieldKey = Object.keys(dateFields).find((k) => {
        const mappedName = dateFields[k].fieldName || k;
        return mappedName === key;
      });
      if (originalDateFieldKey) {
        // Convert ISO date strings to Date objects for BetterAuth
        result[targetFieldKey] = new Date(value);
        return;
      }
    });

    // Strip Payload-internal fields that aren't part of the schema.
    // Payload injects fields like `collection` and internal metadata
    // that callers don't expect. We allow both BA schema fields AND
    // Payload collection fields — this ensures plugin-added fields
    // (e.g. role/token/url on admin-invitations) survive even when
    // the BA schema doesn't declare them.
    if (Object.keys(schemaFields).length > 0) {
      const collectionSlug = getCollectionSlug(model);
      let payloadFieldNames = flattenedFieldsCache.get(collectionSlug);
      if (!payloadFieldNames) {
        const collection = payload.collections[collectionSlug];
        if (collection) {
          payloadFieldNames = flattenAllFields({ fields: collection.config.fields });
          flattenedFieldsCache.set(collectionSlug, payloadFieldNames);
        }
      }
      const payloadNames = new Set(payloadFieldNames?.map((f) => f.name) ?? []);
      const allowedKeys = new Set(["id", "_id", ...Object.keys(schemaFields), ...payloadNames]);
      for (const key of Object.keys(result)) {
        if (!allowedKeys.has(key)) {
          delete result[key];
        }
      }
    }

    return result as T;
  }

  /**
   * Normalizes ID fields for both primary and relationship documents.
   *
   * This function ensures consistent ID handling between BetterAuth and Payload CMS by:
   * 1. Converting all IDs to strings for BetterAuth (stored in originalKey)
   * 2. Preserving original ID types for Payload CMS (stored in fieldName)
   *
   * The function handles various ID formats:
   * - Primitive values (string/number IDs)
   * - Object references with ID properties
   * - Arrays of either primitive IDs or object references
   *
   * @param result - The result object being transformed
   * @param originalKey - The original field key from BetterAuth schema
   * @param fieldName - The renamed field as used in Payload CMS
   * @param value - The ID value to normalize (primitive, object, or array)
   */
  function normalizeDocumentIds(
    result: Record<string, any>,
    originalKey: string,
    fieldName: string,
    value: any
  ): void {
    // Case 1: Primitive ID value (string or number)
    if (typeof value === "string" || typeof value === "number") {
      // For BetterAuth: Always use string IDs
      result[originalKey] = String(value);
      // For Payload: Keep original type
      result[fieldName] = value;
      return;
    }

    // Case 2: Object with ID property
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "id" in value
    ) {
      // For BetterAuth: Extract and stringify the ID
      result[originalKey] = String(value.id);
      // Preserve the populated relationship object so joins return full documents
      result[fieldName] = {
        ...value,
        id: String(value.id)
      };
      return;
    }

    // Case 3: Array of IDs or references
    if (Array.isArray(value) && value.length > 0) {
      // Check if array contains objects with ID properties
      if (
        value.every(
          (item) => typeof item === "object" && item !== null && "id" in item
        )
      ) {
        // Array of objects with IDs
        result[originalKey] = value.map((item) => String(item.id));
        // Keep joined documents intact while normalizing ID type
        result[fieldName] = value.map((item) => ({
          ...item,
          id: String(item.id)
        }));
      } else {
        // Array of primitive IDs
        result[originalKey] = value.map((item) => String(item));
        result[fieldName] = value.map((item) => item);
      }
      return;
    }

    // Note: If value doesn't match any expected format, no changes are made
  }

  /**
   * Converts a BetterAuth operator to the equivalent Payload CMS query operator
   *
   * This function maps standard query operators from BetterAuth's format to
   * the specific format expected by Payload CMS's query engine.
   *
   * @param operator - The BetterAuth operator string (e.g., 'eq', 'gt', 'contains')
   * @param value - The value to be used with the operator
   * @returns An object with the Payload-compatible operator and value
   *
   * @example
   * // Returns { equals: 'test@example.com' }
   * operatorToPayload('eq', 'test@example.com')
   *
   * @example
   * // Returns { greater_than: 100 }
   * operatorToPayload('gt', 100)
   */
  function operatorToPayload(
    operator: string,
    value: any
  ): Record<string, any> {
    switch (operator) {
      case "eq":
        return { equals: value };
      case "ne":
        return { not_equals: value };
      case "gt":
        return { greater_than: value };
      case "gte":
        return { greater_than_equal: value };
      case "lt":
        return { less_than: value };
      case "lte":
        return { less_than_equal: value };
      case "contains":
        return { contains: value };
      case "in":
        return { in: value };
      case "starts_with":
        return { like: `${value}%` };
      case "ends_with":
        return { like: `%${value}` };
      default:
        // Fall back to equals for unrecognized operators
        return { equals: value };
    }
  }

  /**
   * Converts a where clause value to the appropriate type based on field name and ID type configuration
   *
   * This function handles three main scenarios:
   * 1. ID field conversion - ensures IDs match the database's expected type (number or string)
   * 2. Relationship field conversion - ensures foreign key values match the expected ID type
   * 3. Object with embedded ID - extracts and converts the ID property from objects
   *
   * @param value - The value to convert (can be primitive, object with ID, or array)
   * @param fieldName - The name of the field being queried
   * @param model - The model/collection name for schema lookups
   * @param idType - The expected ID type in the database
   * @returns The converted value appropriate for the database query
   */
  function convertWhereValue({
    value,
    fieldName,
    originalFieldKey,
    model,
    idType
  }: {
    value: any;
    fieldName: string;
    originalFieldKey?: string;
    model: ModelKey;
    idType: "number" | "text";
  }): any {
    const schemaFields = schema?.[model]?.fields ?? {};
    const lookupKey = originalFieldKey ?? fieldName;
    const needsIdConversion =
      ["id", "_id"].includes(fieldName) ||
      isRelationshipField(lookupKey, schemaFields);

    if (!needsIdConversion) {
      return value;
    }

    // Case 0: Value is an array (e.g. for the `in` operator) — convert each element
    if (Array.isArray(value)) {
      return value.map((v) =>
        convertWhereValue({
          value: v,
          fieldName,
          originalFieldKey,
          model,
          idType
        })
      );
    }

    // Case 1: Value is an object containing an ID property
    if (typeof value === "object" && value !== null && "id" in value) {
      const id = value.id;
      if (idType === "number" && typeof id === "string") {
        const numId = Number(id);
        return !isNaN(numId) ? numId : id;
      }
      if (idType === "text" && typeof id === "number") {
        return String(id);
      }
      return id;
    }

    // Case 2: Value is a standalone ID that needs type conversion
    if (
      idType === "number" &&
      typeof value === "string" &&
      !isNaN(Number(value))
    ) {
      return Number(value);
    }
    if (idType === "text" && typeof value === "number") {
      return String(value);
    }

    return value;
  }

  /**
   * Converts Better Auth where clauses to Payload CMS compatible where conditions
   *
   * This function transforms the Better Auth query format into Payload's query format,
   * handling field name mapping, value type conversion, and logical operators (AND/OR).
   *
   * The function handles three main cases:
   * 1. Empty or undefined where clause - returns empty object
   * 2. Single condition - converts to a simple field-value pair
   * 3. Multiple conditions - groups by AND/OR connectors and builds a complex query
   *
   * @param idType - The database ID type ('number' or 'text')
   * @param model - The model/collection name to query
   * @param where - Array of Better Auth where conditions
   * @returns A Payload-compatible where clause object
   */
  function convertWhereClause({
    idType,
    model: rawModel,
    where,
    payload
  }: {
    idType: "number" | "text";
    model: ModelKey;
    where?: Where[];
    payload: BasePayload;
  }): PayloadWhere {
    const model = resolveModelKey(rawModel);
    // Handle empty where clause
    if (!where) return {};

    function getPayloadFieldName(fieldKey: string): string {
      return getCollectionFieldNameByFieldKeyUntyped(
        getCollectionByModelKey(payload.collections, model),
        fieldKey
      );
    }

    // Handle single condition case for optimization
    if (where.length === 1) {
      const w = where[0];
      if (!w) {
        return {};
      }

      // Map field name according to schema and convert value to appropriate type
      const fieldName = getFieldName(model, w.field);
      const value = convertWhereValue({
        value: w.value,
        fieldName,
        originalFieldKey: w.field,
        model,
        idType
      });

      // Create the Payload where condition with proper operator
      const res = {
        [getPayloadFieldName(fieldName)]: operatorToPayload(
          w.operator ?? "",
          value
        )
      };

      return res;
    }

    // Handle multiple conditions by separating AND/OR clauses
    // Default to AND if no connector is specified
    const and = where.filter((w) => w.connector === "AND" || !w.connector);
    const or = where.filter((w) => w.connector === "OR");

    // Process AND conditions
    const andClause = and.map((w) => {
      const fieldName = getFieldName(model, w.field);
      const value = convertWhereValue({
        value: w.value,
        fieldName,
        originalFieldKey: w.field,
        model,
        idType
      });
      return {
        [getPayloadFieldName(fieldName)]: operatorToPayload(
          w.operator ?? "",
          value
        )
      };
    });

    // Process OR conditions
    const orClause = or.map((w) => {
      const fieldName = getFieldName(model, w.field);
      const value = convertWhereValue({
        value: w.value,
        fieldName,
        originalFieldKey: w.field,
        model,
        idType
      });
      return {
        [getPayloadFieldName(fieldName)]: operatorToPayload(
          w.operator ?? "",
          value
        )
      };
    });

    // Combine AND and OR clauses into final Payload where object
    // Only include non-empty clause arrays
    return {
      ...(andClause.length ? { AND: andClause } : {}),
      ...(orClause.length ? { OR: orClause } : {})
    };
  }

  /**
   * Converts a better-auth select array to a Payload select object
   *
   * This function transforms the better-auth select array (which contains field names)
   * into the format expected by Payload CMS's query API (an object with field names as keys
   * and boolean true as values).
   *
   * It also handles field name mapping between better-auth schema and Payload collections
   * by using the getFieldName helper to resolve the correct field names.
   *
   * @param model - The model/collection name to get field mappings from
   * @param select - Optional array of field names to select
   * @returns A Payload-compatible select object or undefined if no fields to select
   * @example
   * // Input: ['email', 'name']
   * // Output: { email: true, name: true }
   */
  function convertSelect(
    rawModel: ModelKey,
    select?: string[],
    payload?: BasePayload
  ) {
    const model = resolveModelKey(rawModel);
    // Return undefined if select is empty or not provided
    if (!select || select.length === 0) return undefined;

    // Transform the array of field names into a Payload select object
    // applying both schema-level and collection-level field name mapping
    return select.reduce((acc, field) => {
      const schemaFieldName = getFieldName(model, field);
      const fieldName = payload
        ? getCollectionFieldNameByFieldKeyUntyped(
            getCollectionByModelKey(payload.collections, model),
            schemaFieldName
          )
        : schemaFieldName;
      return { ...acc, [fieldName]: true };
    }, {});
  }

  /**
   * Converts a better-auth sort object to a Payload sort string
   *
   * This function transforms the better-auth sort object (which contains field name and direction)
   * into the format expected by Payload CMS's query API (a string with optional '-' prefix for descending order).
   *
   * It also handles field name mapping between better-auth schema and Payload collections
   * by using the getFieldName helper to resolve the correct field names.
   *
   * @param model - The model/collection name to get field mappings from
   * @param sortBy - Optional object containing field name and sort direction
   * @returns A Payload-compatible sort string or undefined if no sort specified
   * @example
   * // Input: { field: 'email', direction: 'desc' }
   * // Output: '-email'
   * // Input: { field: 'createdAt', direction: 'asc' }
   * // Output: 'createdAt'
   */
  function convertSort(
    rawModel: ModelKey,
    sortBy?: { field: string; direction: "asc" | "desc" },
    payload?: BasePayload
  ): string | undefined {
    const model = resolveModelKey(rawModel);
    if (!sortBy) return undefined;
    const schemaFieldName = getFieldName(model, sortBy.field);
    // Apply collection-level field name mapping if payload is available
    const fieldName = payload
      ? getCollectionFieldNameByFieldKeyUntyped(
          getCollectionByModelKey(payload.collections, model),
          schemaFieldName
        )
      : schemaFieldName;
    const prefix = sortBy.direction === "desc" ? "-" : "";
    return `${prefix}${fieldName}`;
  }

  return {
    getFieldName,
    getCollectionSlug,
    singleIdQuery,
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort
  };
};
