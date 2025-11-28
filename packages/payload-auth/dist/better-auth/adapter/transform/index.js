import { getAuthTables } from "better-auth/db";
import { getCollectionByModelKey, getCollectionFieldNameByFieldKeyUntyped, getFieldKeyByCollectionFieldName } from "../../plugin/helpers/get-collection";
export const createTransform = (options, enableDebugLogs)=>{
    const schema = getAuthTables(options);
    function debugLog(message) {
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
   */ function getCollectionSlug(model) {
        // First try to get the modelName from schema, otherwise fall back to the original model name
        const collection = schema?.[model]?.modelName || model;
        debugLog([
            'getCollectionSlug:',
            {
                model,
                resolvedSlug: collection
            }
        ]);
        return collection;
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
   */ function getFieldName(model, field) {
        // Special case: 'id' or '_id' is always preserved as-is
        if ([
            'id',
            '_id'
        ].includes(field)) {
            return field;
        }
        // Look up the field in the schema
        const fieldDefinition = schema[model]?.fields[field];
        // Use the configured fieldName if available, otherwise fall back to original
        const fieldName = fieldDefinition?.fieldName || field;
        // Log the field resolution for debugging
        debugLog([
            'getField: ',
            {
                model,
                originalField: field,
                fieldName
            }
        ]);
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
   */ function isRelationshipField(fieldKey, schemaFields) {
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
   */ function singleIdQuery(where) {
        // Return null for empty where clauses or complex queries with 'and'/'or' operators
        if (!where || 'and' in where || 'or' in where) return null;
        // Check if the where clause contains either 'id' or '_id' field
        if ([
            'id',
            '_id'
        ].some((field)=>field in where)) {
            // Determine which ID field is being used (support both 'id' and '_id')
            const idField = 'id' in where ? 'id' : '_id';
            const condition = where[idField];
            // Process the equals operator case
            if (condition && typeof condition === 'object' && !Array.isArray(condition) && 'equals' in condition) {
                const value = condition.equals;
                // Only return string or number ID values
                if (typeof value === 'string' || typeof value === 'number') {
                    return value;
                }
            }
            // Process the contains operator case with a single value
            if (condition && typeof condition === 'object' && !Array.isArray(condition) && 'contains' in condition && Array.isArray(condition.contains) && condition.contains.length === 1) {
                const value = condition.contains[0];
                // Only return string or number ID values
                if (typeof value === 'string' || typeof value === 'number') {
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
   */ function normalizeData({ key, value, isRelatedField, idType }) {
        // Skip processing for null/undefined values
        if (value === null || value === undefined) {
            return value;
        }
        if ([
            'id',
            '_id'
        ].includes(key)) {
            if (typeof value === 'string' && idType === 'number') {
                const parsed = parseInt(value, 10);
                if (!isNaN(parsed)) {
                    debugLog([
                        `ID conversion: ${key} converting string ID to number`,
                        {
                            original: value,
                            converted: parsed
                        }
                    ]);
                    return parsed;
                }
            }
            if (typeof value === 'number' && idType === 'text') {
                const stringId = String(value);
                debugLog([
                    `ID conversion: ${key} converting number ID to string`,
                    {
                        original: value,
                        converted: stringId
                    }
                ]);
                return stringId;
            }
        }
        // Only process relationship fields that need type conversion
        if (isRelatedField) {
            // Handle single ID value conversion
            if (typeof value === 'string' && idType === 'number') {
                const parsed = parseInt(value, 10);
                if (!isNaN(parsed)) {
                    debugLog([
                        `ID conversion: ${key} converting string ID to number`,
                        {
                            original: value,
                            converted: parsed
                        }
                    ]);
                    return parsed;
                }
            } else if (typeof value === 'number' && idType === 'text') {
                const stringId = String(value);
                debugLog([
                    `ID conversion: ${key} converting number ID to string`,
                    {
                        original: value,
                        converted: stringId
                    }
                ]);
                return stringId;
            }
            // Handle array of IDs - map each value to the correct type
            if (Array.isArray(value)) {
                return value.map((id)=>{
                    // Skip null/undefined values in arrays
                    if (id === null || id === undefined) return id;
                    if (idType === 'number' && typeof id === 'string') {
                        const parsed = parseInt(id, 10);
                        return !isNaN(parsed) ? parsed : id;
                    } else if (idType === 'text' && typeof id === 'number') {
                        return String(id);
                    }
                    return id;
                });
            }
        }
        // Handle role fields (Coming from better auth, will be a single string seperated by commas if theres multiple roles)
        if (key === 'role' || key === 'roles') {
            return value.split(',').map((role)=>role.trim().toLowerCase());
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
   */ function transformInput({ data, model, idType, payload }) {
        const transformedData = {};
        const schemaFields = schema?.[model]?.fields ?? {};
        // Process each field in the input data
        Object.entries(data).forEach(([key, value])=>{
            // Skip null/undefined values
            if (value === null || value === undefined) {
                return;
            }
            // Determine if this is a relationship field
            const isRelatedField = isRelationshipField(key, schemaFields);
            // Get the mapped field name from schema (if any)
            const schemaFieldName = schemaFields[key]?.fieldName;
            // Normalize the data value based on field type and ID type
            const normalizedData = normalizeData({
                idType,
                key,
                value,
                isRelatedField
            });
            // Use the schema-defined field name if available, otherwise use original key
            const targetFieldName = schemaFieldName || key;
            const targetFieldKey = getCollectionFieldNameByFieldKeyUntyped(getCollectionByModelKey(payload.collections, model), targetFieldName);
            transformedData[targetFieldKey] = normalizedData;
        });
        return transformedData;
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
   * Note: While setting depth: 1 in Payload operations simplifies this process by avoiding
   * deeply nested objects, we maintain comprehensive checks for robustness.
   *
   * @param doc - The document returned from Payload CMS
   * @param model - The model name in the BetterAuth schema
   * @returns The transformed document compatible with BetterAuth
   */ function transformOutput({ doc, model, payload }) {
        if (!doc || typeof doc !== 'object') return doc;
        const result = {
            ...doc
        };
        const schemaFields = schema?.[model]?.fields ?? {};
        // Identify relationship fields with custom field name mappings
        const relationshipFields = Object.fromEntries(Object.entries(schemaFields).filter(([key])=>isRelationshipField(key, schemaFields)));
        const dateFields = Object.fromEntries(Object.entries(schemaFields).filter(([_, value])=>value.type === 'date'));
        // First make sure all the fields keys are correct
        Object.keys(result).forEach((key)=>{
            const targetFieldKey = getFieldKeyByCollectionFieldName(getCollectionByModelKey(payload.collections, model), key);
            if (targetFieldKey !== key) {
                result[targetFieldKey] = result[key];
                delete result[key];
            }
        });
        Object.entries(doc).forEach(([key, value])=>{
            if (value === null || value === undefined) return;
            // Convert ID fields to strings for BetterAuth compatibility
            if ([
                'id',
                '_id'
            ].includes(key)) {
                result[key] = String(value);
                return;
            }
            // Handle relationship fields with renamed fieldNames
            const originalRelatedFieldKey = Object.keys(relationshipFields).find((k)=>relationshipFields[k].fieldName === key);
            if (originalRelatedFieldKey) {
                normalizeDocumentIds(result, originalRelatedFieldKey, key, value);
                return;
            }
            const originalDateFieldKey = Object.keys(dateFields).find((k)=>dateFields[k].fieldName === key);
            if (originalDateFieldKey) {
                // Convert ISO date strings to Date objects for BetterAuth
                result[key] = new Date(value);
                return;
            }
        });
        return result;
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
   */ function normalizeDocumentIds(result, originalKey, fieldName, value) {
        // Case 1: Primitive ID value (string or number)
        if (typeof value === 'string' || typeof value === 'number') {
            // For BetterAuth: Always use string IDs
            result[originalKey] = String(value);
            // For Payload: Keep original type
            result[fieldName] = value;
            return;
        }
        // Case 2: Object with ID property
        if (typeof value === 'object' && value !== null && 'id' in value) {
            // For BetterAuth: Extract and stringify the ID
            result[originalKey] = String(value.id);
            // For Payload: Extract ID but preserve type
            result[fieldName] = value.id;
            return;
        }
        // Case 3: Array of IDs or references
        if (Array.isArray(value) && value.length > 0) {
            // Check if array contains objects with ID properties
            if (value.every((item)=>typeof item === 'object' && item !== null && 'id' in item)) {
                // Array of objects with IDs
                result[originalKey] = value.map((item)=>String(item.id));
                result[fieldName] = value.map((item)=>item.id);
            } else {
                // Array of primitive IDs
                result[originalKey] = value.map((item)=>String(item));
                result[fieldName] = value.map((item)=>item);
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
   */ function operatorToPayload(operator, value) {
        switch(operator){
            case 'eq':
                return {
                    equals: value
                };
            case 'ne':
                return {
                    not_equals: value
                };
            case 'gt':
                return {
                    greater_than: value
                };
            case 'gte':
                return {
                    greater_than_equal: value
                };
            case 'lt':
                return {
                    less_than: value
                };
            case 'lte':
                return {
                    less_than_equal: value
                };
            case 'contains':
                return {
                    contains: value
                };
            case 'in':
                return {
                    in: value
                };
            case 'starts_with':
                return {
                    like: `${value}%`
                };
            case 'ends_with':
                return {
                    like: `%${value}`
                };
            default:
                // Fall back to equals for unrecognized operators
                return {
                    equals: value
                };
        }
    }
    /**
   * Converts a where clause value to the appropriate type based on field name and ID type configuration
   *
   * This function handles two main scenarios:
   * 1. ID field conversion - ensures IDs match the database's expected type (number or string)
   * 2. Object with embedded ID - extracts and converts the ID property from objects
   *
   * @param value - The value to convert (can be primitive, object with ID, or array)
   * @param fieldName - The name of the field being queried
   * @param idType - The expected ID type in the database
   * @returns The converted value appropriate for the database query
   */ function convertWhereValue({ value, fieldName, idType }) {
        // Check if field is an ID field (supporting both MongoDB-style _id and standard id)
        if ([
            'id',
            '_id'
        ].includes(fieldName)) {
            // Case 1: Value is an object containing an ID property
            if (typeof value === 'object' && value !== null && 'id' in value) {
                // Extract ID from object
                const id = value.id;
                // Use type conversion based on database configuration
                if (idType === 'number' && typeof id === 'string') {
                    const numId = Number(id);
                    return !isNaN(numId) ? numId : id;
                }
                if (idType === 'text' && typeof id === 'number') {
                    return String(id);
                }
                return id;
            }
            // Case 2: Value is a standalone ID that needs type conversion
            // Convert string ID to number if database expects numeric IDs
            if (idType === 'number' && typeof value === 'string' && !isNaN(Number(value))) {
                return Number(value);
            } else if (idType === 'text' && typeof value === 'number') {
                return String(value);
            }
            return value;
        }
        // For non-ID fields, return the value unchanged
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
   */ function convertWhereClause({ idType, model, where, payload }) {
        // Handle empty where clause
        if (!where) return {};
        function getPayloadFieldName(fieldKey) {
            return getCollectionFieldNameByFieldKeyUntyped(getCollectionByModelKey(payload.collections, model), fieldKey);
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
                idType
            });
            // Create the Payload where condition with proper operator
            const res = {
                [getPayloadFieldName(fieldName)]: operatorToPayload(w.operator ?? '', value)
            };
            return res;
        }
        // Handle multiple conditions by separating AND/OR clauses
        // Default to AND if no connector is specified
        const and = where.filter((w)=>w.connector === 'AND' || !w.connector);
        const or = where.filter((w)=>w.connector === 'OR');
        // Process AND conditions
        const andClause = and.map((w)=>{
            const fieldName = getFieldName(model, w.field);
            const value = convertWhereValue({
                value: w.value,
                fieldName,
                idType
            });
            return {
                [getPayloadFieldName(fieldName)]: operatorToPayload(w.operator ?? '', value)
            };
        });
        // Process OR conditions
        const orClause = or.map((w)=>{
            const fieldName = getFieldName(model, w.field);
            const value = convertWhereValue({
                value: w.value,
                fieldName,
                idType
            });
            return {
                [getPayloadFieldName(fieldName)]: operatorToPayload(w.operator ?? '', value)
            };
        });
        // Combine AND and OR clauses into final Payload where object
        // Only include non-empty clause arrays
        return {
            ...andClause.length ? {
                AND: andClause
            } : {},
            ...orClause.length ? {
                OR: orClause
            } : {}
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
   */ function convertSelect(model, select) {
        // Return undefined if select is empty or not provided
        if (!select || select.length === 0) return undefined;
        // Transform the array of field names into a Payload select object
        // while also mapping any field names that might be different in Payload
        return select.reduce((acc, field)=>({
                ...acc,
                [getFieldName(model, field)]: true
            }), {});
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
   */ function convertSort(model, sortBy) {
        if (!sortBy) return undefined;
        const fieldName = getFieldName(model, sortBy.field);
        const prefix = sortBy.direction === 'desc' ? '-' : '';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9hZGFwdGVyL3RyYW5zZm9ybS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRBdXRoVGFibGVzIH0gZnJvbSAnYmV0dGVyLWF1dGgvZGInXG5pbXBvcnQgdHlwZSB7IE1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJldHRlckF1dGhPcHRpb25zLCBXaGVyZSB9IGZyb20gJ2JldHRlci1hdXRoJ1xuaW1wb3J0IHR5cGUgeyBEQkZpZWxkQXR0cmlidXRlIH0gZnJvbSAnYmV0dGVyLWF1dGgvZGInXG5pbXBvcnQgdHlwZSB7IEJhc2VQYXlsb2FkLCBDb2xsZWN0aW9uU2x1ZywgV2hlcmUgYXMgUGF5bG9hZFdoZXJlIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7XG4gIGdldENvbGxlY3Rpb25CeU1vZGVsS2V5LFxuICBnZXRDb2xsZWN0aW9uRmllbGROYW1lQnlGaWVsZEtleVVudHlwZWQsXG4gIGdldEZpZWxkS2V5QnlDb2xsZWN0aW9uRmllbGROYW1lXG59IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24nXG5cbmV4cG9ydCBjb25zdCBjcmVhdGVUcmFuc2Zvcm0gPSAob3B0aW9uczogQmV0dGVyQXV0aE9wdGlvbnMsIGVuYWJsZURlYnVnTG9nczogYm9vbGVhbikgPT4ge1xuICBjb25zdCBzY2hlbWEgPSBnZXRBdXRoVGFibGVzKG9wdGlvbnMpXG5cbiAgZnVuY3Rpb24gZGVidWdMb2cobWVzc2FnZTogYW55W10pIHtcbiAgICBpZiAoZW5hYmxlRGVidWdMb2dzKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW3BheWxvYWQtZGItYWRhcHRlcl1gLCAuLi5tZXNzYWdlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGEgQmV0dGVyQXV0aCBzY2hlbWEgbW9kZWwgbmFtZSB0byBpdHMgY29ycmVzcG9uZGluZyBQYXlsb2FkIENNUyBjb2xsZWN0aW9uIHNsdWcuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gcmVzb2x2ZXMgdGhlIGFwcHJvcHJpYXRlIGNvbGxlY3Rpb24gc2x1ZyBieTpcbiAgICogMS4gTG9va2luZyB1cCB0aGUgbW9kZWwgaW4gdGhlIEJldHRlckF1dGggc2NoZW1hIHRvIGZpbmQgaXRzIGNvbmZpZ3VyZWQgbW9kZWxOYW1lXG4gICAqIDIuIEZhbGxpbmcgYmFjayB0byB0aGUgb3JpZ2luYWwgbW9kZWwgbmFtZSBpZiBubyBtYXBwaW5nIGV4aXN0c1xuICAgKlxuICAgKiBDb2xsZWN0aW9uIHNsdWcgcmVzb2x1dGlvbiBmb2xsb3dzIHRoZXNlIHJ1bGVzOlxuICAgKiAtIEZvciBiYXNlIGNvbGxlY3Rpb25zOiBUaGUgc2FuaXRpemVCZXR0ZXJBdXRoT3B0aW9ucyBmdW5jdGlvbiBlbnN1cmVzIHRoZSBjb2xsZWN0aW9uIHNsdWdcbiAgICogICBmcm9tIHBsdWdpbiBvcHRpb25zIGlzIHNldCBhcyB0aGUgbW9kZWwgbmFtZSBpbiB0aGUgc2NoZW1hXG4gICAqIC0gRm9yIHBsdWdpbnM6IFRoZSBiZXR0ZXJBdXRoUGx1Z2luU2x1Z3MgY29uc3RhbnQgaXMgdXNlZCBhcyB0aGUgbW9kZWxOYW1lXG4gICAqXG4gICAqIEBwYXJhbSBtb2RlbCAtIFRoZSBCZXR0ZXJBdXRoIG1vZGVsIG5hbWUgdG8gcmVzb2x2ZVxuICAgKiBAcmV0dXJucyBUaGUgY29ycmVzcG9uZGluZyBQYXlsb2FkIENNUyBjb2xsZWN0aW9uIHNsdWdcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgc2NoZW1hWyd1c2VyJ10ubW9kZWxOYW1lIGlzICd1c2VycydcbiAgICogZ2V0Q29sbGVjdGlvblNsdWcoJ3VzZXInKSAvLyBSZXR1cm5zICd1c2VycydcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgbW9kZWwgZG9lc24ndCBleGlzdCBpbiBzY2hlbWFcbiAgICogZ2V0Q29sbGVjdGlvblNsdWcoJ2N1c3RvbScpIC8vIFJldHVybnMgJ2N1c3RvbSdcbiAgICpcbiAgICogQHdhcm5pbmcgSWYgYSBjb2xsZWN0aW9uIGlzIG92ZXJyaWRkZW4gdXNpbmcgdGhlIGNvbGxlY3Rpb25PdmVycmlkZSBvcHRpb25cbiAgICogd2l0aG91dCB1cGRhdGluZyB0aGUgc2NoZW1hIG1hcHBpbmcsIHRoaXMgZnVuY3Rpb24gbWF5IHJldHVybiBpbmNvcnJlY3Qgc2x1Z3NcbiAgICovXG4gIGZ1bmN0aW9uIGdldENvbGxlY3Rpb25TbHVnKG1vZGVsOiBNb2RlbEtleSk6IENvbGxlY3Rpb25TbHVnIHtcbiAgICAvLyBGaXJzdCB0cnkgdG8gZ2V0IHRoZSBtb2RlbE5hbWUgZnJvbSBzY2hlbWEsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gdGhlIG9yaWdpbmFsIG1vZGVsIG5hbWVcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gc2NoZW1hPy5bbW9kZWxdPy5tb2RlbE5hbWUgfHwgbW9kZWxcbiAgICBkZWJ1Z0xvZyhbJ2dldENvbGxlY3Rpb25TbHVnOicsIHsgbW9kZWwsIHJlc29sdmVkU2x1ZzogY29sbGVjdGlvbiB9XSlcbiAgICByZXR1cm4gY29sbGVjdGlvbiBhcyBDb2xsZWN0aW9uU2x1Z1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcHMgYSBCZXR0ZXJBdXRoIHNjaGVtYSBmaWVsZCB0byBpdHMgY29ycmVzcG9uZGluZyBQYXlsb2FkIENNUyBmaWVsZCBuYW1lLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHJlc29sdmVzIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCBuYW1lIGJ5OlxuICAgKiAxLiBQcmVzZXJ2aW5nICdpZCcgb3IgJ19pZCcgZmllbGRzIGFzLWlzIChzcGVjaWFsIGNhc2UgaGFuZGxpbmcpXG4gICAqIDIuIExvb2tpbmcgdXAgdGhlIGZpZWxkIGluIHRoZSBCZXR0ZXJBdXRoIHNjaGVtYSB0byBmaW5kIGl0cyBjb25maWd1cmVkIGZpZWxkTmFtZVxuICAgKiAzLiBGYWxsaW5nIGJhY2sgdG8gdGhlIG9yaWdpbmFsIGZpZWxkIG5hbWUgaWYgbm8gbWFwcGluZyBleGlzdHNcbiAgICpcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIEJldHRlckF1dGggbW9kZWwgbmFtZSBjb250YWluaW5nIHRoZSBmaWVsZFxuICAgKiBAcGFyYW0gZmllbGQgLSBUaGUgb3JpZ2luYWwgZmllbGQgbmFtZSB0byByZXNvbHZlXG4gICAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIFBheWxvYWQgQ01TIGZpZWxkIG5hbWVcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgc2NoZW1hWyd1c2VyJ10uZmllbGRzWydlbWFpbCddLmZpZWxkTmFtZSBpcyAnZW1haWxBZGRyZXNzJ1xuICAgKiBnZXRGaWVsZE5hbWUoJ3VzZXInLCAnZW1haWwnKSAvLyBSZXR1cm5zICdlbWFpbEFkZHJlc3MnXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFNwZWNpYWwgY2FzZSBmb3IgSUQgZmllbGRzXG4gICAqIGdldEZpZWxkTmFtZSgndXNlcicsICdpZCcpIC8vIEFsd2F5cyByZXR1cm5zICdpZCdcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgZmllbGQgZG9lc24ndCBleGlzdCBpbiBzY2hlbWEgb3IgaGFzIG5vIGZpZWxkTmFtZSBtYXBwaW5nXG4gICAqIGdldEZpZWxkTmFtZSgndXNlcicsICdjdXN0b20nKSAvLyBSZXR1cm5zICdjdXN0b20nXG4gICAqXG4gICAqIEB3YXJuaW5nIElmIGEgZmllbGROYW1lIGlzIG92ZXJyaWRkZW4gaW4gdGhlIHBheWxvYWQgY29sbGVjdGlvbiBjb25maWcgdXNpbmcgdGhlIGNvbGxlY3Rpb25PdmVycmlkZSBvcHRpb25cbiAgICogd2l0aG91dCB1cGRhdGluZyB0aGUgc2NoZW1hIG1hcHBpbmcsIHRoaXMgZnVuY3Rpb24gbWF5IHJldHVybiBpbmNvcnJlY3QgZmllbGQgbmFtZXNcbiAgICovXG4gIGZ1bmN0aW9uIGdldEZpZWxkTmFtZShtb2RlbDogTW9kZWxLZXksIGZpZWxkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogJ2lkJyBvciAnX2lkJyBpcyBhbHdheXMgcHJlc2VydmVkIGFzLWlzXG4gICAgaWYgKFsnaWQnLCAnX2lkJ10uaW5jbHVkZXMoZmllbGQpKSB7XG4gICAgICByZXR1cm4gZmllbGRcbiAgICB9XG5cbiAgICAvLyBMb29rIHVwIHRoZSBmaWVsZCBpbiB0aGUgc2NoZW1hXG4gICAgY29uc3QgZmllbGREZWZpbml0aW9uID0gc2NoZW1hW21vZGVsXT8uZmllbGRzW2ZpZWxkXVxuXG4gICAgLy8gVXNlIHRoZSBjb25maWd1cmVkIGZpZWxkTmFtZSBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gb3JpZ2luYWxcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZERlZmluaXRpb24/LmZpZWxkTmFtZSB8fCBmaWVsZFxuXG4gICAgLy8gTG9nIHRoZSBmaWVsZCByZXNvbHV0aW9uIGZvciBkZWJ1Z2dpbmdcbiAgICBkZWJ1Z0xvZyhbJ2dldEZpZWxkOiAnLCB7IG1vZGVsLCBvcmlnaW5hbEZpZWxkOiBmaWVsZCwgZmllbGROYW1lIH1dKVxuXG4gICAgcmV0dXJuIGZpZWxkTmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYSBmaWVsZCBpcyBhIHJlbGF0aW9uc2hpcCBmaWVsZCBieSBjaGVja2luZyBmb3IgYSByZWZlcmVuY2VzIHByb3BlcnR5LlxuICAgKlxuICAgKiBSZWxhdGlvbnNoaXAgZmllbGRzIGluIHRoZSBzY2hlbWEgaGF2ZSBhICdyZWZlcmVuY2VzJyBwcm9wZXJ0eSB0aGF0IHBvaW50cyB0byBhbm90aGVyIG1vZGVsLlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiB0aGlzIHByb3BlcnR5IGV4aXN0cyB0byBpZGVudGlmeSByZWxhdGlvbnNoaXAgZmllbGRzLlxuICAgKlxuICAgKiBAcGFyYW0gZmllbGRLZXkgLSBUaGUga2V5IG9mIHRoZSBmaWVsZCB0byBjaGVjayBpbiB0aGUgc2NoZW1hXG4gICAqIEBwYXJhbSBzY2hlbWFGaWVsZHMgLSBPYmplY3QgY29udGFpbmluZyBhbGwgZmllbGRzIGZyb20gdGhlIHNjaGVtYSBmb3IgYSBzcGVjaWZpYyBtb2RlbFxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBmaWVsZCBpcyBhIHJlbGF0aW9uc2hpcCBmaWVsZCAoaGFzIHJlZmVyZW5jZXMpLCBmYWxzZSBvdGhlcndpc2VcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgc2NoZW1hLnVzZXIuZmllbGRzLnBvc3RzIGhhcyB7IHJlZmVyZW5jZXM6IHt9IH1cbiAgICogaXNSZWxhdGlvbnNoaXBGaWVsZCgncG9zdHMnLCBzY2hlbWEudXNlci5maWVsZHMpIC8vIFJldHVybnMgdHJ1ZVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBJZiBzY2hlbWEudXNlci5maWVsZHMuZW1haWwgaGFzIG5vIHJlZmVyZW5jZXMgcHJvcGVydHlcbiAgICogaXNSZWxhdGlvbnNoaXBGaWVsZCgnZW1haWwnLCBzY2hlbWEudXNlci5maWVsZHMpIC8vIFJldHVybnMgZmFsc2VcbiAgICovXG4gIGZ1bmN0aW9uIGlzUmVsYXRpb25zaGlwRmllbGQoZmllbGRLZXk6IHN0cmluZywgc2NoZW1hRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBEQkZpZWxkQXR0cmlidXRlPik6IGJvb2xlYW4ge1xuICAgIC8vIEEgZmllbGQgaXMgYSByZWxhdGlvbnNoaXAgZmllbGQgaWYgaXQgaGFzIGEgJ3JlZmVyZW5jZXMnIHByb3BlcnR5IGRlZmluZWRcbiAgICByZXR1cm4gc2NoZW1hRmllbGRzW2ZpZWxkS2V5XT8ucmVmZXJlbmNlcyAhPT0gdW5kZWZpbmVkXG4gIH1cbiAgLyoqXG4gICAqIEV4dHJhY3RzIGEgc2luZ2xlIElEIHZhbHVlIGZyb20gYSBQYXlsb2FkIHdoZXJlIGNsYXVzZSBpZiBpdCByZXByZXNlbnRzIGEgc2ltcGxlIElEIHF1ZXJ5LlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGFuYWx5emVzIGEgUGF5bG9hZCB3aGVyZSBjbGF1c2UgdG8gZGV0ZXJtaW5lIGlmIGl0J3MgYSBzaW1wbGUgcXVlcnkgZm9yIGFcbiAgICogc2luZ2xlIGRvY3VtZW50IGJ5IElELiBJdCBzdXBwb3J0cyBib3RoICdpZCcgYW5kICdfaWQnIGZpZWxkcyB3aXRoICdlcXVhbHMnIG9yICdjb250YWlucydcbiAgICogb3BlcmF0b3JzLiBUaGlzIGlzIHVzZWZ1bCBmb3Igb3B0aW1pemluZyBxdWVyaWVzIHdoZW4gd2Ugb25seSBuZWVkIHRvIGZldGNoIGEgc2luZ2xlIGRvY3VtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gd2hlcmUgLSBUaGUgUGF5bG9hZCB3aGVyZSBjbGF1c2UgdG8gYW5hbHl6ZVxuICAgKiBAcmV0dXJucyBUaGUgSUQgdmFsdWUgKHN0cmluZyBvciBudW1iZXIpIGlmIHRoZSB3aGVyZSBjbGF1c2UgaXMgYSBzaW1wbGUgSUQgcXVlcnksIG51bGwgb3RoZXJ3aXNlXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFJldHVybnMgJzEyMycgZm9yIGEgc2ltcGxlIGVxdWFscyBxdWVyeVxuICAgKiBzaW5nbGVJZFF1ZXJ5KHsgaWQ6IHsgZXF1YWxzOiAnMTIzJyB9IH0pIC8vICcxMjMnXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFJldHVybnMgNDU2IGZvciBhIHNpbXBsZSBlcXVhbHMgcXVlcnkgd2l0aCBudW1iZXIgSURcbiAgICogc2luZ2xlSWRRdWVyeSh7IF9pZDogeyBlcXVhbHM6IDQ1NiB9IH0pIC8vIDQ1NlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBSZXR1cm5zICc3ODknIGZvciBhIGNvbnRhaW5zIHF1ZXJ5IHdpdGggYSBzaW5nbGUgdmFsdWVcbiAgICogc2luZ2xlSWRRdWVyeSh7IGlkOiB7IGNvbnRhaW5zOiBbJzc4OSddIH0gfSkgLy8gJzc4OSdcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gUmV0dXJucyBudWxsIGZvciBjb21wbGV4IHF1ZXJpZXNcbiAgICogc2luZ2xlSWRRdWVyeSh7IGFuZDogW3sgaWQ6IHsgZXF1YWxzOiAnMTIzJyB9IH1dIH0pIC8vIG51bGxcbiAgICovXG4gIGZ1bmN0aW9uIHNpbmdsZUlkUXVlcnkod2hlcmU6IFBheWxvYWRXaGVyZSkge1xuICAgIC8vIFJldHVybiBudWxsIGZvciBlbXB0eSB3aGVyZSBjbGF1c2VzIG9yIGNvbXBsZXggcXVlcmllcyB3aXRoICdhbmQnLydvcicgb3BlcmF0b3JzXG4gICAgaWYgKCF3aGVyZSB8fCAnYW5kJyBpbiB3aGVyZSB8fCAnb3InIGluIHdoZXJlKSByZXR1cm4gbnVsbFxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHdoZXJlIGNsYXVzZSBjb250YWlucyBlaXRoZXIgJ2lkJyBvciAnX2lkJyBmaWVsZFxuICAgIGlmIChbJ2lkJywgJ19pZCddLnNvbWUoKGZpZWxkKSA9PiBmaWVsZCBpbiB3aGVyZSkpIHtcbiAgICAgIC8vIERldGVybWluZSB3aGljaCBJRCBmaWVsZCBpcyBiZWluZyB1c2VkIChzdXBwb3J0IGJvdGggJ2lkJyBhbmQgJ19pZCcpXG4gICAgICBjb25zdCBpZEZpZWxkID0gJ2lkJyBpbiB3aGVyZSA/ICdpZCcgOiAnX2lkJ1xuICAgICAgY29uc3QgY29uZGl0aW9uID0gd2hlcmVbaWRGaWVsZF1cblxuICAgICAgLy8gUHJvY2VzcyB0aGUgZXF1YWxzIG9wZXJhdG9yIGNhc2VcbiAgICAgIGlmIChjb25kaXRpb24gJiYgdHlwZW9mIGNvbmRpdGlvbiA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoY29uZGl0aW9uKSAmJiAnZXF1YWxzJyBpbiBjb25kaXRpb24pIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjb25kaXRpb24uZXF1YWxzXG4gICAgICAgIC8vIE9ubHkgcmV0dXJuIHN0cmluZyBvciBudW1iZXIgSUQgdmFsdWVzXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBQcm9jZXNzIHRoZSBjb250YWlucyBvcGVyYXRvciBjYXNlIHdpdGggYSBzaW5nbGUgdmFsdWVcbiAgICAgIGlmIChcbiAgICAgICAgY29uZGl0aW9uICYmXG4gICAgICAgIHR5cGVvZiBjb25kaXRpb24gPT09ICdvYmplY3QnICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KGNvbmRpdGlvbikgJiZcbiAgICAgICAgJ2NvbnRhaW5zJyBpbiBjb25kaXRpb24gJiZcbiAgICAgICAgQXJyYXkuaXNBcnJheShjb25kaXRpb24uY29udGFpbnMpICYmXG4gICAgICAgIGNvbmRpdGlvbi5jb250YWlucy5sZW5ndGggPT09IDFcbiAgICAgICkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGNvbmRpdGlvbi5jb250YWluc1swXVxuICAgICAgICAvLyBPbmx5IHJldHVybiBzdHJpbmcgb3IgbnVtYmVyIElEIHZhbHVlc1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gbnVsbCBpZiBubyB2YWxpZCBJRCBxdWVyeSB3YXMgZm91bmRcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgZGF0YSB2YWx1ZXMgYmFzZWQgb24gZmllbGQgdHlwZSBhbmQgcmVxdWlyZWQgSUQgdHlwZVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGhhbmRsZXMgdHlwZSBjb252ZXJzaW9uIGZvciByZWxhdGlvbnNoaXAgZmllbGRzIHRvIGVuc3VyZVxuICAgKiBJRHMgYXJlIGluIHRoZSBjb3JyZWN0IGZvcm1hdCAoc3RyaW5nIG9yIG51bWJlcikgYmFzZWQgb24gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBrZXkgLSBUaGUgZmllbGQga2V5L25hbWVcbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIG5vcm1hbGl6ZVxuICAgKiBAcGFyYW0gaXNSZWxhdGVkRmllbGQgLSBXaGV0aGVyIHRoaXMgZmllbGQgaXMgYSByZWxhdGlvbnNoaXAgZmllbGRcbiAgICogQHBhcmFtIGlkVHlwZSAtIFRoZSBleHBlY3RlZCBJRCB0eXBlICgnbnVtYmVyJyBvciAndGV4dCcpXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIHZhbHVlXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVEYXRhKHtcbiAgICBrZXksXG4gICAgdmFsdWUsXG4gICAgaXNSZWxhdGVkRmllbGQsXG4gICAgaWRUeXBlXG4gIH06IHtcbiAgICBrZXk6IHN0cmluZ1xuICAgIHZhbHVlOiBhbnlcbiAgICBpc1JlbGF0ZWRGaWVsZDogYm9vbGVhblxuICAgIGlkVHlwZTogJ251bWJlcicgfCAndGV4dCdcbiAgfSkge1xuICAgIC8vIFNraXAgcHJvY2Vzc2luZyBmb3IgbnVsbC91bmRlZmluZWQgdmFsdWVzXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cblxuICAgIGlmIChbJ2lkJywgJ19pZCddLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIGlkVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQodmFsdWUsIDEwKVxuICAgICAgICBpZiAoIWlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgICBkZWJ1Z0xvZyhbYElEIGNvbnZlcnNpb246ICR7a2V5fSBjb252ZXJ0aW5nIHN0cmluZyBJRCB0byBudW1iZXJgLCB7IG9yaWdpbmFsOiB2YWx1ZSwgY29udmVydGVkOiBwYXJzZWQgfV0pXG4gICAgICAgICAgcmV0dXJuIHBhcnNlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpZFR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICBjb25zdCBzdHJpbmdJZCA9IFN0cmluZyh2YWx1ZSlcbiAgICAgICAgZGVidWdMb2coW2BJRCBjb252ZXJzaW9uOiAke2tleX0gY29udmVydGluZyBudW1iZXIgSUQgdG8gc3RyaW5nYCwgeyBvcmlnaW5hbDogdmFsdWUsIGNvbnZlcnRlZDogc3RyaW5nSWQgfV0pXG4gICAgICAgIHJldHVybiBzdHJpbmdJZFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9ubHkgcHJvY2VzcyByZWxhdGlvbnNoaXAgZmllbGRzIHRoYXQgbmVlZCB0eXBlIGNvbnZlcnNpb25cbiAgICBpZiAoaXNSZWxhdGVkRmllbGQpIHtcbiAgICAgIC8vIEhhbmRsZSBzaW5nbGUgSUQgdmFsdWUgY29udmVyc2lvblxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgaWRUeXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludCh2YWx1ZSwgMTApXG4gICAgICAgIGlmICghaXNOYU4ocGFyc2VkKSkge1xuICAgICAgICAgIGRlYnVnTG9nKFtgSUQgY29udmVyc2lvbjogJHtrZXl9IGNvbnZlcnRpbmcgc3RyaW5nIElEIHRvIG51bWJlcmAsIHsgb3JpZ2luYWw6IHZhbHVlLCBjb252ZXJ0ZWQ6IHBhcnNlZCB9XSlcbiAgICAgICAgICByZXR1cm4gcGFyc2VkXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpZFR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICBjb25zdCBzdHJpbmdJZCA9IFN0cmluZyh2YWx1ZSlcbiAgICAgICAgZGVidWdMb2coW2BJRCBjb252ZXJzaW9uOiAke2tleX0gY29udmVydGluZyBudW1iZXIgSUQgdG8gc3RyaW5nYCwgeyBvcmlnaW5hbDogdmFsdWUsIGNvbnZlcnRlZDogc3RyaW5nSWQgfV0pXG4gICAgICAgIHJldHVybiBzdHJpbmdJZFxuICAgICAgfVxuXG4gICAgICAvLyBIYW5kbGUgYXJyYXkgb2YgSURzIC0gbWFwIGVhY2ggdmFsdWUgdG8gdGhlIGNvcnJlY3QgdHlwZVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoKGlkKSA9PiB7XG4gICAgICAgICAgLy8gU2tpcCBudWxsL3VuZGVmaW5lZCB2YWx1ZXMgaW4gYXJyYXlzXG4gICAgICAgICAgaWYgKGlkID09PSBudWxsIHx8IGlkID09PSB1bmRlZmluZWQpIHJldHVybiBpZFxuXG4gICAgICAgICAgaWYgKGlkVHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQoaWQsIDEwKVxuICAgICAgICAgICAgcmV0dXJuICFpc05hTihwYXJzZWQpID8gcGFyc2VkIDogaWRcbiAgICAgICAgICB9IGVsc2UgaWYgKGlkVHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiBpZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcoaWQpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBpZFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSByb2xlIGZpZWxkcyAoQ29taW5nIGZyb20gYmV0dGVyIGF1dGgsIHdpbGwgYmUgYSBzaW5nbGUgc3RyaW5nIHNlcGVyYXRlZCBieSBjb21tYXMgaWYgdGhlcmVzIG11bHRpcGxlIHJvbGVzKVxuICAgIGlmIChrZXkgPT09ICdyb2xlJyB8fCBrZXkgPT09ICdyb2xlcycpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnLCcpLm1hcCgocm9sZTogc3RyaW5nKSA9PiByb2xlLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuICAgIH1cblxuICAgIC8vIFJldHVybiBvcmlnaW5hbCB2YWx1ZSBpZiBubyBjb252ZXJzaW9uIHdhcyBuZWVkZWQgb3IgYXBwbGljYWJsZVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgaW5wdXQgZGF0YSBmcm9tIGJldHRlci1hdXRoIHRvIFBheWxvYWQgQ01TIGZvcm1hdFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGhhbmRsZXM6XG4gICAqIDEuIEZpZWxkIG5hbWUgbWFwcGluZyBhY2NvcmRpbmcgdG8gc2NoZW1hIGRlZmluaXRpb25zXG4gICAqIDIuIElEIHR5cGUgY29udmVyc2lvbiBmb3IgcmVsYXRpb25zaGlwIGZpZWxkc1xuICAgKiAzLiBQcm9wZXIgZGF0YSBub3JtYWxpemF0aW9uIGJhc2VkIG9uIGZpZWxkIHR5cGVzXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gVGhlIGlucHV0IGRhdGEgZnJvbSBiZXR0ZXItYXV0aFxuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwgbmFtZSBpbiB0aGUgc2NoZW1hXG4gICAqIEBwYXJhbSBpZFR5cGUgLSBUaGUgZXhwZWN0ZWQgSUQgdHlwZSAoJ251bWJlcicgb3IgJ3RleHQnKVxuICAgKiBAcmV0dXJucyBUcmFuc2Zvcm1lZCBkYXRhIGNvbXBhdGlibGUgd2l0aCBQYXlsb2FkIENNU1xuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNmb3JtSW5wdXQoe1xuICAgIGRhdGEsXG4gICAgbW9kZWwsXG4gICAgaWRUeXBlLFxuICAgIHBheWxvYWRcbiAgfToge1xuICAgIGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT5cbiAgICBtb2RlbDogTW9kZWxLZXlcbiAgICBpZFR5cGU6ICdudW1iZXInIHwgJ3RleHQnXG4gICAgcGF5bG9hZDogQmFzZVBheWxvYWRcbiAgfSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG4gICAgY29uc3Qgc2NoZW1hRmllbGRzID0gc2NoZW1hPy5bbW9kZWxdPy5maWVsZHMgPz8ge31cblxuICAgIC8vIFByb2Nlc3MgZWFjaCBmaWVsZCBpbiB0aGUgaW5wdXQgZGF0YVxuICAgIE9iamVjdC5lbnRyaWVzKGRhdGEpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgLy8gU2tpcCBudWxsL3VuZGVmaW5lZCB2YWx1ZXNcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBpcyBhIHJlbGF0aW9uc2hpcCBmaWVsZFxuICAgICAgY29uc3QgaXNSZWxhdGVkRmllbGQgPSBpc1JlbGF0aW9uc2hpcEZpZWxkKGtleSwgc2NoZW1hRmllbGRzKVxuXG4gICAgICAvLyBHZXQgdGhlIG1hcHBlZCBmaWVsZCBuYW1lIGZyb20gc2NoZW1hIChpZiBhbnkpXG4gICAgICBjb25zdCBzY2hlbWFGaWVsZE5hbWUgPSBzY2hlbWFGaWVsZHNba2V5XT8uZmllbGROYW1lXG5cbiAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgZGF0YSB2YWx1ZSBiYXNlZCBvbiBmaWVsZCB0eXBlIGFuZCBJRCB0eXBlXG4gICAgICBjb25zdCBub3JtYWxpemVkRGF0YSA9IG5vcm1hbGl6ZURhdGEoe1xuICAgICAgICBpZFR5cGUsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGlzUmVsYXRlZEZpZWxkXG4gICAgICB9KVxuXG4gICAgICAvLyBVc2UgdGhlIHNjaGVtYS1kZWZpbmVkIGZpZWxkIG5hbWUgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgdXNlIG9yaWdpbmFsIGtleVxuICAgICAgY29uc3QgdGFyZ2V0RmllbGROYW1lID0gc2NoZW1hRmllbGROYW1lIHx8IGtleVxuICAgICAgY29uc3QgdGFyZ2V0RmllbGRLZXkgPSBnZXRDb2xsZWN0aW9uRmllbGROYW1lQnlGaWVsZEtleVVudHlwZWQoZ2V0Q29sbGVjdGlvbkJ5TW9kZWxLZXkocGF5bG9hZC5jb2xsZWN0aW9ucywgbW9kZWwpLCB0YXJnZXRGaWVsZE5hbWUpXG4gICAgICB0cmFuc2Zvcm1lZERhdGFbdGFyZ2V0RmllbGRLZXldID0gbm9ybWFsaXplZERhdGFcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRyYW5zZm9ybWVkRGF0YVxuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgUGF5bG9hZCBDTVMgZG9jdW1lbnQgb3V0cHV0IHRvIG1hdGNoIEJldHRlckF1dGggc2NoZW1hIGV4cGVjdGF0aW9ucy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBoYW5kbGVzIHNldmVyYWwgY3JpdGljYWwgdHJhbnNmb3JtYXRpb25zOlxuICAgKlxuICAgKiAxLiBJRCBDb252ZXJzaW9uOiBFbnN1cmVzIGFsbCBJRCBmaWVsZHMgYXJlIHN0cmluZ3MgYXMgcmVxdWlyZWQgYnkgQmV0dGVyQXV0aFxuICAgKiAgICAoc2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmV0dGVyLWF1dGgvYmV0dGVyLWF1dGgvYmxvYi9tYWluL3BhY2thZ2VzL2JldHRlci1hdXRoL3NyYy9kYi9zY2hlbWEudHMjTDEyNSlcbiAgICpcbiAgICogMi4gUmVsYXRpb25zaGlwIEZpZWxkIE1hcHBpbmc6IEFsaWducyByZWxhdGlvbnNoaXAgZmllbGRzIHdpdGggQmV0dGVyQXV0aCBzY2hlbWEgbmFtaW5nIGNvbnZlbnRpb25zXG4gICAqICAgIGFuZCBlbnN1cmVzIHByb3BlciBJRCB0eXBlIGhhbmRsaW5nXG4gICAqXG4gICAqIDMuIERhdGUgQ29udmVyc2lvbjogVHJhbnNmb3JtcyBkYXRlIHN0cmluZ3MgZnJvbSBQYXlsb2FkIGludG8gRGF0ZSBvYmplY3RzIGZvciBCZXR0ZXJBdXRoXG4gICAqXG4gICAqIE5vdGU6IFdoaWxlIHNldHRpbmcgZGVwdGg6IDEgaW4gUGF5bG9hZCBvcGVyYXRpb25zIHNpbXBsaWZpZXMgdGhpcyBwcm9jZXNzIGJ5IGF2b2lkaW5nXG4gICAqIGRlZXBseSBuZXN0ZWQgb2JqZWN0cywgd2UgbWFpbnRhaW4gY29tcHJlaGVuc2l2ZSBjaGVja3MgZm9yIHJvYnVzdG5lc3MuXG4gICAqXG4gICAqIEBwYXJhbSBkb2MgLSBUaGUgZG9jdW1lbnQgcmV0dXJuZWQgZnJvbSBQYXlsb2FkIENNU1xuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwgbmFtZSBpbiB0aGUgQmV0dGVyQXV0aCBzY2hlbWFcbiAgICogQHJldHVybnMgVGhlIHRyYW5zZm9ybWVkIGRvY3VtZW50IGNvbXBhdGlibGUgd2l0aCBCZXR0ZXJBdXRoXG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2Zvcm1PdXRwdXQ8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsPih7XG4gICAgZG9jLFxuICAgIG1vZGVsLFxuICAgIHBheWxvYWRcbiAgfToge1xuICAgIGRvYzogVFxuICAgIG1vZGVsOiBNb2RlbEtleVxuICAgIHBheWxvYWQ6IEJhc2VQYXlsb2FkXG4gIH0pOiBUIHtcbiAgICBpZiAoIWRvYyB8fCB0eXBlb2YgZG9jICE9PSAnb2JqZWN0JykgcmV0dXJuIGRvY1xuXG4gICAgY29uc3QgcmVzdWx0ID0geyAuLi5kb2MgfVxuICAgIGNvbnN0IHNjaGVtYUZpZWxkcyA9IHNjaGVtYT8uW21vZGVsXT8uZmllbGRzID8/IHt9XG5cbiAgICAvLyBJZGVudGlmeSByZWxhdGlvbnNoaXAgZmllbGRzIHdpdGggY3VzdG9tIGZpZWxkIG5hbWUgbWFwcGluZ3NcbiAgICBjb25zdCByZWxhdGlvbnNoaXBGaWVsZHMgPSBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMoc2NoZW1hRmllbGRzKS5maWx0ZXIoKFtrZXldKSA9PiBpc1JlbGF0aW9uc2hpcEZpZWxkKGtleSwgc2NoZW1hRmllbGRzKSkpXG4gICAgY29uc3QgZGF0ZUZpZWxkcyA9IE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhzY2hlbWFGaWVsZHMpLmZpbHRlcigoW18sIHZhbHVlXSkgPT4gdmFsdWUudHlwZSA9PT0gJ2RhdGUnKSlcblxuICAgIC8vIEZpcnN0IG1ha2Ugc3VyZSBhbGwgdGhlIGZpZWxkcyBrZXlzIGFyZSBjb3JyZWN0XG4gICAgT2JqZWN0LmtleXMocmVzdWx0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHRhcmdldEZpZWxkS2V5ID0gZ2V0RmllbGRLZXlCeUNvbGxlY3Rpb25GaWVsZE5hbWUoZ2V0Q29sbGVjdGlvbkJ5TW9kZWxLZXkocGF5bG9hZC5jb2xsZWN0aW9ucywgbW9kZWwpLCBrZXkpXG4gICAgICBpZiAodGFyZ2V0RmllbGRLZXkgIT09IGtleSkge1xuICAgICAgICByZXN1bHRbdGFyZ2V0RmllbGRLZXldID0gcmVzdWx0W2tleV1cbiAgICAgICAgZGVsZXRlIHJlc3VsdFtrZXldXG4gICAgICB9XG4gICAgfSlcblxuICAgIE9iamVjdC5lbnRyaWVzKGRvYykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG5cbiAgICAgIC8vIENvbnZlcnQgSUQgZmllbGRzIHRvIHN0cmluZ3MgZm9yIEJldHRlckF1dGggY29tcGF0aWJpbGl0eVxuICAgICAgaWYgKFsnaWQnLCAnX2lkJ10uaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IFN0cmluZyh2YWx1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSByZWxhdGlvbnNoaXAgZmllbGRzIHdpdGggcmVuYW1lZCBmaWVsZE5hbWVzXG4gICAgICBjb25zdCBvcmlnaW5hbFJlbGF0ZWRGaWVsZEtleSA9IE9iamVjdC5rZXlzKHJlbGF0aW9uc2hpcEZpZWxkcykuZmluZCgoaykgPT4gcmVsYXRpb25zaGlwRmllbGRzW2tdLmZpZWxkTmFtZSA9PT0ga2V5KVxuICAgICAgaWYgKG9yaWdpbmFsUmVsYXRlZEZpZWxkS2V5KSB7XG4gICAgICAgIG5vcm1hbGl6ZURvY3VtZW50SWRzKHJlc3VsdCwgb3JpZ2luYWxSZWxhdGVkRmllbGRLZXksIGtleSwgdmFsdWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcmlnaW5hbERhdGVGaWVsZEtleSA9IE9iamVjdC5rZXlzKGRhdGVGaWVsZHMpLmZpbmQoKGspID0+IGRhdGVGaWVsZHNba10uZmllbGROYW1lID09PSBrZXkpXG4gICAgICBpZiAob3JpZ2luYWxEYXRlRmllbGRLZXkpIHtcbiAgICAgICAgLy8gQ29udmVydCBJU08gZGF0ZSBzdHJpbmdzIHRvIERhdGUgb2JqZWN0cyBmb3IgQmV0dGVyQXV0aFxuICAgICAgICByZXN1bHRba2V5XSA9IG5ldyBEYXRlKHZhbHVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBUXG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBJRCBmaWVsZHMgZm9yIGJvdGggcHJpbWFyeSBhbmQgcmVsYXRpb25zaGlwIGRvY3VtZW50cy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBlbnN1cmVzIGNvbnNpc3RlbnQgSUQgaGFuZGxpbmcgYmV0d2VlbiBCZXR0ZXJBdXRoIGFuZCBQYXlsb2FkIENNUyBieTpcbiAgICogMS4gQ29udmVydGluZyBhbGwgSURzIHRvIHN0cmluZ3MgZm9yIEJldHRlckF1dGggKHN0b3JlZCBpbiBvcmlnaW5hbEtleSlcbiAgICogMi4gUHJlc2VydmluZyBvcmlnaW5hbCBJRCB0eXBlcyBmb3IgUGF5bG9hZCBDTVMgKHN0b3JlZCBpbiBmaWVsZE5hbWUpXG4gICAqXG4gICAqIFRoZSBmdW5jdGlvbiBoYW5kbGVzIHZhcmlvdXMgSUQgZm9ybWF0czpcbiAgICogLSBQcmltaXRpdmUgdmFsdWVzIChzdHJpbmcvbnVtYmVyIElEcylcbiAgICogLSBPYmplY3QgcmVmZXJlbmNlcyB3aXRoIElEIHByb3BlcnRpZXNcbiAgICogLSBBcnJheXMgb2YgZWl0aGVyIHByaW1pdGl2ZSBJRHMgb3Igb2JqZWN0IHJlZmVyZW5jZXNcbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdCAtIFRoZSByZXN1bHQgb2JqZWN0IGJlaW5nIHRyYW5zZm9ybWVkXG4gICAqIEBwYXJhbSBvcmlnaW5hbEtleSAtIFRoZSBvcmlnaW5hbCBmaWVsZCBrZXkgZnJvbSBCZXR0ZXJBdXRoIHNjaGVtYVxuICAgKiBAcGFyYW0gZmllbGROYW1lIC0gVGhlIHJlbmFtZWQgZmllbGQgYXMgdXNlZCBpbiBQYXlsb2FkIENNU1xuICAgKiBAcGFyYW0gdmFsdWUgLSBUaGUgSUQgdmFsdWUgdG8gbm9ybWFsaXplIChwcmltaXRpdmUsIG9iamVjdCwgb3IgYXJyYXkpXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVEb2N1bWVudElkcyhyZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4sIG9yaWdpbmFsS2V5OiBzdHJpbmcsIGZpZWxkTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gQ2FzZSAxOiBQcmltaXRpdmUgSUQgdmFsdWUgKHN0cmluZyBvciBudW1iZXIpXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgLy8gRm9yIEJldHRlckF1dGg6IEFsd2F5cyB1c2Ugc3RyaW5nIElEc1xuICAgICAgcmVzdWx0W29yaWdpbmFsS2V5XSA9IFN0cmluZyh2YWx1ZSlcbiAgICAgIC8vIEZvciBQYXlsb2FkOiBLZWVwIG9yaWdpbmFsIHR5cGVcbiAgICAgIHJlc3VsdFtmaWVsZE5hbWVdID0gdmFsdWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIENhc2UgMjogT2JqZWN0IHdpdGggSUQgcHJvcGVydHlcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAnaWQnIGluIHZhbHVlKSB7XG4gICAgICAvLyBGb3IgQmV0dGVyQXV0aDogRXh0cmFjdCBhbmQgc3RyaW5naWZ5IHRoZSBJRFxuICAgICAgcmVzdWx0W29yaWdpbmFsS2V5XSA9IFN0cmluZyh2YWx1ZS5pZClcbiAgICAgIC8vIEZvciBQYXlsb2FkOiBFeHRyYWN0IElEIGJ1dCBwcmVzZXJ2ZSB0eXBlXG4gICAgICByZXN1bHRbZmllbGROYW1lXSA9IHZhbHVlLmlkXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBDYXNlIDM6IEFycmF5IG9mIElEcyBvciByZWZlcmVuY2VzXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIENoZWNrIGlmIGFycmF5IGNvbnRhaW5zIG9iamVjdHMgd2l0aCBJRCBwcm9wZXJ0aWVzXG4gICAgICBpZiAodmFsdWUuZXZlcnkoKGl0ZW0pID0+IHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiBpdGVtICE9PSBudWxsICYmICdpZCcgaW4gaXRlbSkpIHtcbiAgICAgICAgLy8gQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIElEc1xuICAgICAgICByZXN1bHRbb3JpZ2luYWxLZXldID0gdmFsdWUubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbS5pZCkpXG4gICAgICAgIHJlc3VsdFtmaWVsZE5hbWVdID0gdmFsdWUubWFwKChpdGVtKSA9PiBpdGVtLmlkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgcHJpbWl0aXZlIElEc1xuICAgICAgICByZXN1bHRbb3JpZ2luYWxLZXldID0gdmFsdWUubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkpXG4gICAgICAgIHJlc3VsdFtmaWVsZE5hbWVdID0gdmFsdWUubWFwKChpdGVtKSA9PiBpdGVtKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gTm90ZTogSWYgdmFsdWUgZG9lc24ndCBtYXRjaCBhbnkgZXhwZWN0ZWQgZm9ybWF0LCBubyBjaGFuZ2VzIGFyZSBtYWRlXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBCZXR0ZXJBdXRoIG9wZXJhdG9yIHRvIHRoZSBlcXVpdmFsZW50IFBheWxvYWQgQ01TIHF1ZXJ5IG9wZXJhdG9yXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gbWFwcyBzdGFuZGFyZCBxdWVyeSBvcGVyYXRvcnMgZnJvbSBCZXR0ZXJBdXRoJ3MgZm9ybWF0IHRvXG4gICAqIHRoZSBzcGVjaWZpYyBmb3JtYXQgZXhwZWN0ZWQgYnkgUGF5bG9hZCBDTVMncyBxdWVyeSBlbmdpbmUuXG4gICAqXG4gICAqIEBwYXJhbSBvcGVyYXRvciAtIFRoZSBCZXR0ZXJBdXRoIG9wZXJhdG9yIHN0cmluZyAoZS5nLiwgJ2VxJywgJ2d0JywgJ2NvbnRhaW5zJylcbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGJlIHVzZWQgd2l0aCB0aGUgb3BlcmF0b3JcbiAgICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggdGhlIFBheWxvYWQtY29tcGF0aWJsZSBvcGVyYXRvciBhbmQgdmFsdWVcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gUmV0dXJucyB7IGVxdWFsczogJ3Rlc3RAZXhhbXBsZS5jb20nIH1cbiAgICogb3BlcmF0b3JUb1BheWxvYWQoJ2VxJywgJ3Rlc3RAZXhhbXBsZS5jb20nKVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBSZXR1cm5zIHsgZ3JlYXRlcl90aGFuOiAxMDAgfVxuICAgKiBvcGVyYXRvclRvUGF5bG9hZCgnZ3QnLCAxMDApXG4gICAqL1xuICBmdW5jdGlvbiBvcGVyYXRvclRvUGF5bG9hZChvcGVyYXRvcjogc3RyaW5nLCB2YWx1ZTogYW55KTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgY2FzZSAnZXEnOlxuICAgICAgICByZXR1cm4geyBlcXVhbHM6IHZhbHVlIH1cbiAgICAgIGNhc2UgJ25lJzpcbiAgICAgICAgcmV0dXJuIHsgbm90X2VxdWFsczogdmFsdWUgfVxuICAgICAgY2FzZSAnZ3QnOlxuICAgICAgICByZXR1cm4geyBncmVhdGVyX3RoYW46IHZhbHVlIH1cbiAgICAgIGNhc2UgJ2d0ZSc6XG4gICAgICAgIHJldHVybiB7IGdyZWF0ZXJfdGhhbl9lcXVhbDogdmFsdWUgfVxuICAgICAgY2FzZSAnbHQnOlxuICAgICAgICByZXR1cm4geyBsZXNzX3RoYW46IHZhbHVlIH1cbiAgICAgIGNhc2UgJ2x0ZSc6XG4gICAgICAgIHJldHVybiB7IGxlc3NfdGhhbl9lcXVhbDogdmFsdWUgfVxuICAgICAgY2FzZSAnY29udGFpbnMnOlxuICAgICAgICByZXR1cm4geyBjb250YWluczogdmFsdWUgfVxuICAgICAgY2FzZSAnaW4nOlxuICAgICAgICByZXR1cm4geyBpbjogdmFsdWUgfVxuICAgICAgY2FzZSAnc3RhcnRzX3dpdGgnOlxuICAgICAgICByZXR1cm4geyBsaWtlOiBgJHt2YWx1ZX0lYCB9XG4gICAgICBjYXNlICdlbmRzX3dpdGgnOlxuICAgICAgICByZXR1cm4geyBsaWtlOiBgJSR7dmFsdWV9YCB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBGYWxsIGJhY2sgdG8gZXF1YWxzIGZvciB1bnJlY29nbml6ZWQgb3BlcmF0b3JzXG4gICAgICAgIHJldHVybiB7IGVxdWFsczogdmFsdWUgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHdoZXJlIGNsYXVzZSB2YWx1ZSB0byB0aGUgYXBwcm9wcmlhdGUgdHlwZSBiYXNlZCBvbiBmaWVsZCBuYW1lIGFuZCBJRCB0eXBlIGNvbmZpZ3VyYXRpb25cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBoYW5kbGVzIHR3byBtYWluIHNjZW5hcmlvczpcbiAgICogMS4gSUQgZmllbGQgY29udmVyc2lvbiAtIGVuc3VyZXMgSURzIG1hdGNoIHRoZSBkYXRhYmFzZSdzIGV4cGVjdGVkIHR5cGUgKG51bWJlciBvciBzdHJpbmcpXG4gICAqIDIuIE9iamVjdCB3aXRoIGVtYmVkZGVkIElEIC0gZXh0cmFjdHMgYW5kIGNvbnZlcnRzIHRoZSBJRCBwcm9wZXJ0eSBmcm9tIG9iamVjdHNcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgKGNhbiBiZSBwcmltaXRpdmUsIG9iamVjdCB3aXRoIElELCBvciBhcnJheSlcbiAgICogQHBhcmFtIGZpZWxkTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBmaWVsZCBiZWluZyBxdWVyaWVkXG4gICAqIEBwYXJhbSBpZFR5cGUgLSBUaGUgZXhwZWN0ZWQgSUQgdHlwZSBpbiB0aGUgZGF0YWJhc2VcbiAgICogQHJldHVybnMgVGhlIGNvbnZlcnRlZCB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgdGhlIGRhdGFiYXNlIHF1ZXJ5XG4gICAqL1xuICBmdW5jdGlvbiBjb252ZXJ0V2hlcmVWYWx1ZSh7IHZhbHVlLCBmaWVsZE5hbWUsIGlkVHlwZSB9OiB7IHZhbHVlOiBhbnk7IGZpZWxkTmFtZTogc3RyaW5nOyBpZFR5cGU6ICdudW1iZXInIHwgJ3RleHQnIH0pIHtcbiAgICAvLyBDaGVjayBpZiBmaWVsZCBpcyBhbiBJRCBmaWVsZCAoc3VwcG9ydGluZyBib3RoIE1vbmdvREItc3R5bGUgX2lkIGFuZCBzdGFuZGFyZCBpZClcbiAgICBpZiAoWydpZCcsICdfaWQnXS5pbmNsdWRlcyhmaWVsZE5hbWUpKSB7XG4gICAgICAvLyBDYXNlIDE6IFZhbHVlIGlzIGFuIG9iamVjdCBjb250YWluaW5nIGFuIElEIHByb3BlcnR5XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAnaWQnIGluIHZhbHVlKSB7XG4gICAgICAgIC8vIEV4dHJhY3QgSUQgZnJvbSBvYmplY3RcbiAgICAgICAgY29uc3QgaWQgPSB2YWx1ZS5pZFxuXG4gICAgICAgIC8vIFVzZSB0eXBlIGNvbnZlcnNpb24gYmFzZWQgb24gZGF0YWJhc2UgY29uZmlndXJhdGlvblxuICAgICAgICBpZiAoaWRUeXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgbnVtSWQgPSBOdW1iZXIoaWQpXG4gICAgICAgICAgcmV0dXJuICFpc05hTihudW1JZCkgPyBudW1JZCA6IGlkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaWRUeXBlID09PSAndGV4dCcgJiYgdHlwZW9mIGlkID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHJldHVybiBTdHJpbmcoaWQpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaWRcbiAgICAgIH1cbiAgICAgIC8vIENhc2UgMjogVmFsdWUgaXMgYSBzdGFuZGFsb25lIElEIHRoYXQgbmVlZHMgdHlwZSBjb252ZXJzaW9uXG4gICAgICAvLyBDb252ZXJ0IHN0cmluZyBJRCB0byBudW1iZXIgaWYgZGF0YWJhc2UgZXhwZWN0cyBudW1lcmljIElEc1xuICAgICAgaWYgKGlkVHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oTnVtYmVyKHZhbHVlKSkpIHtcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSlcbiAgICAgIH1cbiAgICAgIC8vIENvbnZlcnQgbnVtZXJpYyBJRCB0byBzdHJpbmcgaWYgZGF0YWJhc2UgZXhwZWN0cyB0ZXh0IElEc1xuICAgICAgZWxzZSBpZiAoaWRUeXBlID09PSAndGV4dCcgJiYgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuXG4gICAgLy8gRm9yIG5vbi1JRCBmaWVsZHMsIHJldHVybiB0aGUgdmFsdWUgdW5jaGFuZ2VkXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgQmV0dGVyIEF1dGggd2hlcmUgY2xhdXNlcyB0byBQYXlsb2FkIENNUyBjb21wYXRpYmxlIHdoZXJlIGNvbmRpdGlvbnNcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB0cmFuc2Zvcm1zIHRoZSBCZXR0ZXIgQXV0aCBxdWVyeSBmb3JtYXQgaW50byBQYXlsb2FkJ3MgcXVlcnkgZm9ybWF0LFxuICAgKiBoYW5kbGluZyBmaWVsZCBuYW1lIG1hcHBpbmcsIHZhbHVlIHR5cGUgY29udmVyc2lvbiwgYW5kIGxvZ2ljYWwgb3BlcmF0b3JzIChBTkQvT1IpLlxuICAgKlxuICAgKiBUaGUgZnVuY3Rpb24gaGFuZGxlcyB0aHJlZSBtYWluIGNhc2VzOlxuICAgKiAxLiBFbXB0eSBvciB1bmRlZmluZWQgd2hlcmUgY2xhdXNlIC0gcmV0dXJucyBlbXB0eSBvYmplY3RcbiAgICogMi4gU2luZ2xlIGNvbmRpdGlvbiAtIGNvbnZlcnRzIHRvIGEgc2ltcGxlIGZpZWxkLXZhbHVlIHBhaXJcbiAgICogMy4gTXVsdGlwbGUgY29uZGl0aW9ucyAtIGdyb3VwcyBieSBBTkQvT1IgY29ubmVjdG9ycyBhbmQgYnVpbGRzIGEgY29tcGxleCBxdWVyeVxuICAgKlxuICAgKiBAcGFyYW0gaWRUeXBlIC0gVGhlIGRhdGFiYXNlIElEIHR5cGUgKCdudW1iZXInIG9yICd0ZXh0JylcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIG1vZGVsL2NvbGxlY3Rpb24gbmFtZSB0byBxdWVyeVxuICAgKiBAcGFyYW0gd2hlcmUgLSBBcnJheSBvZiBCZXR0ZXIgQXV0aCB3aGVyZSBjb25kaXRpb25zXG4gICAqIEByZXR1cm5zIEEgUGF5bG9hZC1jb21wYXRpYmxlIHdoZXJlIGNsYXVzZSBvYmplY3RcbiAgICovXG4gIGZ1bmN0aW9uIGNvbnZlcnRXaGVyZUNsYXVzZSh7XG4gICAgaWRUeXBlLFxuICAgIG1vZGVsLFxuICAgIHdoZXJlLFxuICAgIHBheWxvYWRcbiAgfToge1xuICAgIGlkVHlwZTogJ251bWJlcicgfCAndGV4dCdcbiAgICBtb2RlbDogTW9kZWxLZXlcbiAgICB3aGVyZT86IFdoZXJlW11cbiAgICBwYXlsb2FkOiBCYXNlUGF5bG9hZFxuICB9KTogUGF5bG9hZFdoZXJlIHtcbiAgICAvLyBIYW5kbGUgZW1wdHkgd2hlcmUgY2xhdXNlXG4gICAgaWYgKCF3aGVyZSkgcmV0dXJuIHt9XG5cbiAgICBmdW5jdGlvbiBnZXRQYXlsb2FkRmllbGROYW1lKGZpZWxkS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGdldENvbGxlY3Rpb25GaWVsZE5hbWVCeUZpZWxkS2V5VW50eXBlZChnZXRDb2xsZWN0aW9uQnlNb2RlbEtleShwYXlsb2FkLmNvbGxlY3Rpb25zLCBtb2RlbCksIGZpZWxkS2V5KVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzaW5nbGUgY29uZGl0aW9uIGNhc2UgZm9yIG9wdGltaXphdGlvblxuICAgIGlmICh3aGVyZS5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IHcgPSB3aGVyZVswXVxuICAgICAgaWYgKCF3KSB7XG4gICAgICAgIHJldHVybiB7fVxuICAgICAgfVxuXG4gICAgICAvLyBNYXAgZmllbGQgbmFtZSBhY2NvcmRpbmcgdG8gc2NoZW1hIGFuZCBjb252ZXJ0IHZhbHVlIHRvIGFwcHJvcHJpYXRlIHR5cGVcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGdldEZpZWxkTmFtZShtb2RlbCwgdy5maWVsZClcbiAgICAgIGNvbnN0IHZhbHVlID0gY29udmVydFdoZXJlVmFsdWUoe1xuICAgICAgICB2YWx1ZTogdy52YWx1ZSxcbiAgICAgICAgZmllbGROYW1lLFxuICAgICAgICBpZFR5cGVcbiAgICAgIH0pXG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgUGF5bG9hZCB3aGVyZSBjb25kaXRpb24gd2l0aCBwcm9wZXIgb3BlcmF0b3JcbiAgICAgIGNvbnN0IHJlcyA9IHtcbiAgICAgICAgW2dldFBheWxvYWRGaWVsZE5hbWUoZmllbGROYW1lKV06IG9wZXJhdG9yVG9QYXlsb2FkKHcub3BlcmF0b3IgPz8gJycsIHZhbHVlKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIG11bHRpcGxlIGNvbmRpdGlvbnMgYnkgc2VwYXJhdGluZyBBTkQvT1IgY2xhdXNlc1xuICAgIC8vIERlZmF1bHQgdG8gQU5EIGlmIG5vIGNvbm5lY3RvciBpcyBzcGVjaWZpZWRcbiAgICBjb25zdCBhbmQgPSB3aGVyZS5maWx0ZXIoKHcpID0+IHcuY29ubmVjdG9yID09PSAnQU5EJyB8fCAhdy5jb25uZWN0b3IpXG4gICAgY29uc3Qgb3IgPSB3aGVyZS5maWx0ZXIoKHcpID0+IHcuY29ubmVjdG9yID09PSAnT1InKVxuXG4gICAgLy8gUHJvY2VzcyBBTkQgY29uZGl0aW9uc1xuICAgIGNvbnN0IGFuZENsYXVzZSA9IGFuZC5tYXAoKHcpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGdldEZpZWxkTmFtZShtb2RlbCwgdy5maWVsZClcbiAgICAgIGNvbnN0IHZhbHVlID0gY29udmVydFdoZXJlVmFsdWUoe1xuICAgICAgICB2YWx1ZTogdy52YWx1ZSxcbiAgICAgICAgZmllbGROYW1lLFxuICAgICAgICBpZFR5cGVcbiAgICAgIH0pXG4gICAgICByZXR1cm4ge1xuICAgICAgICBbZ2V0UGF5bG9hZEZpZWxkTmFtZShmaWVsZE5hbWUpXTogb3BlcmF0b3JUb1BheWxvYWQody5vcGVyYXRvciA/PyAnJywgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFByb2Nlc3MgT1IgY29uZGl0aW9uc1xuICAgIGNvbnN0IG9yQ2xhdXNlID0gb3IubWFwKCh3KSA9PiB7XG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSBnZXRGaWVsZE5hbWUobW9kZWwsIHcuZmllbGQpXG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbnZlcnRXaGVyZVZhbHVlKHtcbiAgICAgICAgdmFsdWU6IHcudmFsdWUsXG4gICAgICAgIGZpZWxkTmFtZSxcbiAgICAgICAgaWRUeXBlXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgW2dldFBheWxvYWRGaWVsZE5hbWUoZmllbGROYW1lKV06IG9wZXJhdG9yVG9QYXlsb2FkKHcub3BlcmF0b3IgPz8gJycsIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBDb21iaW5lIEFORCBhbmQgT1IgY2xhdXNlcyBpbnRvIGZpbmFsIFBheWxvYWQgd2hlcmUgb2JqZWN0XG4gICAgLy8gT25seSBpbmNsdWRlIG5vbi1lbXB0eSBjbGF1c2UgYXJyYXlzXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLihhbmRDbGF1c2UubGVuZ3RoID8geyBBTkQ6IGFuZENsYXVzZSB9IDoge30pLFxuICAgICAgLi4uKG9yQ2xhdXNlLmxlbmd0aCA/IHsgT1I6IG9yQ2xhdXNlIH0gOiB7fSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBiZXR0ZXItYXV0aCBzZWxlY3QgYXJyYXkgdG8gYSBQYXlsb2FkIHNlbGVjdCBvYmplY3RcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB0cmFuc2Zvcm1zIHRoZSBiZXR0ZXItYXV0aCBzZWxlY3QgYXJyYXkgKHdoaWNoIGNvbnRhaW5zIGZpZWxkIG5hbWVzKVxuICAgKiBpbnRvIHRoZSBmb3JtYXQgZXhwZWN0ZWQgYnkgUGF5bG9hZCBDTVMncyBxdWVyeSBBUEkgKGFuIG9iamVjdCB3aXRoIGZpZWxkIG5hbWVzIGFzIGtleXNcbiAgICogYW5kIGJvb2xlYW4gdHJ1ZSBhcyB2YWx1ZXMpLlxuICAgKlxuICAgKiBJdCBhbHNvIGhhbmRsZXMgZmllbGQgbmFtZSBtYXBwaW5nIGJldHdlZW4gYmV0dGVyLWF1dGggc2NoZW1hIGFuZCBQYXlsb2FkIGNvbGxlY3Rpb25zXG4gICAqIGJ5IHVzaW5nIHRoZSBnZXRGaWVsZE5hbWUgaGVscGVyIHRvIHJlc29sdmUgdGhlIGNvcnJlY3QgZmllbGQgbmFtZXMuXG4gICAqXG4gICAqIEBwYXJhbSBtb2RlbCAtIFRoZSBtb2RlbC9jb2xsZWN0aW9uIG5hbWUgdG8gZ2V0IGZpZWxkIG1hcHBpbmdzIGZyb21cbiAgICogQHBhcmFtIHNlbGVjdCAtIE9wdGlvbmFsIGFycmF5IG9mIGZpZWxkIG5hbWVzIHRvIHNlbGVjdFxuICAgKiBAcmV0dXJucyBBIFBheWxvYWQtY29tcGF0aWJsZSBzZWxlY3Qgb2JqZWN0IG9yIHVuZGVmaW5lZCBpZiBubyBmaWVsZHMgdG8gc2VsZWN0XG4gICAqIEBleGFtcGxlXG4gICAqIC8vIElucHV0OiBbJ2VtYWlsJywgJ25hbWUnXVxuICAgKiAvLyBPdXRwdXQ6IHsgZW1haWw6IHRydWUsIG5hbWU6IHRydWUgfVxuICAgKi9cbiAgZnVuY3Rpb24gY29udmVydFNlbGVjdChtb2RlbDogTW9kZWxLZXksIHNlbGVjdD86IHN0cmluZ1tdKSB7XG4gICAgLy8gUmV0dXJuIHVuZGVmaW5lZCBpZiBzZWxlY3QgaXMgZW1wdHkgb3Igbm90IHByb3ZpZGVkXG4gICAgaWYgKCFzZWxlY3QgfHwgc2VsZWN0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBhcnJheSBvZiBmaWVsZCBuYW1lcyBpbnRvIGEgUGF5bG9hZCBzZWxlY3Qgb2JqZWN0XG4gICAgLy8gd2hpbGUgYWxzbyBtYXBwaW5nIGFueSBmaWVsZCBuYW1lcyB0aGF0IG1pZ2h0IGJlIGRpZmZlcmVudCBpbiBQYXlsb2FkXG4gICAgcmV0dXJuIHNlbGVjdC5yZWR1Y2UoKGFjYywgZmllbGQpID0+ICh7IC4uLmFjYywgW2dldEZpZWxkTmFtZShtb2RlbCwgZmllbGQpXTogdHJ1ZSB9KSwge30pXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBiZXR0ZXItYXV0aCBzb3J0IG9iamVjdCB0byBhIFBheWxvYWQgc29ydCBzdHJpbmdcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB0cmFuc2Zvcm1zIHRoZSBiZXR0ZXItYXV0aCBzb3J0IG9iamVjdCAod2hpY2ggY29udGFpbnMgZmllbGQgbmFtZSBhbmQgZGlyZWN0aW9uKVxuICAgKiBpbnRvIHRoZSBmb3JtYXQgZXhwZWN0ZWQgYnkgUGF5bG9hZCBDTVMncyBxdWVyeSBBUEkgKGEgc3RyaW5nIHdpdGggb3B0aW9uYWwgJy0nIHByZWZpeCBmb3IgZGVzY2VuZGluZyBvcmRlcikuXG4gICAqXG4gICAqIEl0IGFsc28gaGFuZGxlcyBmaWVsZCBuYW1lIG1hcHBpbmcgYmV0d2VlbiBiZXR0ZXItYXV0aCBzY2hlbWEgYW5kIFBheWxvYWQgY29sbGVjdGlvbnNcbiAgICogYnkgdXNpbmcgdGhlIGdldEZpZWxkTmFtZSBoZWxwZXIgdG8gcmVzb2x2ZSB0aGUgY29ycmVjdCBmaWVsZCBuYW1lcy5cbiAgICpcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIG1vZGVsL2NvbGxlY3Rpb24gbmFtZSB0byBnZXQgZmllbGQgbWFwcGluZ3MgZnJvbVxuICAgKiBAcGFyYW0gc29ydEJ5IC0gT3B0aW9uYWwgb2JqZWN0IGNvbnRhaW5pbmcgZmllbGQgbmFtZSBhbmQgc29ydCBkaXJlY3Rpb25cbiAgICogQHJldHVybnMgQSBQYXlsb2FkLWNvbXBhdGlibGUgc29ydCBzdHJpbmcgb3IgdW5kZWZpbmVkIGlmIG5vIHNvcnQgc3BlY2lmaWVkXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIElucHV0OiB7IGZpZWxkOiAnZW1haWwnLCBkaXJlY3Rpb246ICdkZXNjJyB9XG4gICAqIC8vIE91dHB1dDogJy1lbWFpbCdcbiAgICogLy8gSW5wdXQ6IHsgZmllbGQ6ICdjcmVhdGVkQXQnLCBkaXJlY3Rpb246ICdhc2MnIH1cbiAgICogLy8gT3V0cHV0OiAnY3JlYXRlZEF0J1xuICAgKi9cbiAgZnVuY3Rpb24gY29udmVydFNvcnQobW9kZWw6IE1vZGVsS2V5LCBzb3J0Qnk/OiB7IGZpZWxkOiBzdHJpbmc7IGRpcmVjdGlvbjogJ2FzYycgfCAnZGVzYycgfSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCFzb3J0QnkpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBnZXRGaWVsZE5hbWUobW9kZWwsIHNvcnRCeS5maWVsZClcbiAgICBjb25zdCBwcmVmaXggPSBzb3J0QnkuZGlyZWN0aW9uID09PSAnZGVzYycgPyAnLScgOiAnJ1xuICAgIHJldHVybiBgJHtwcmVmaXh9JHtmaWVsZE5hbWV9YFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRGaWVsZE5hbWUsXG4gICAgZ2V0Q29sbGVjdGlvblNsdWcsXG4gICAgc2luZ2xlSWRRdWVyeSxcbiAgICB0cmFuc2Zvcm1JbnB1dCxcbiAgICB0cmFuc2Zvcm1PdXRwdXQsXG4gICAgY29udmVydFdoZXJlQ2xhdXNlLFxuICAgIGNvbnZlcnRTZWxlY3QsXG4gICAgY29udmVydFNvcnRcbiAgfVxufVxuIl0sIm5hbWVzIjpbImdldEF1dGhUYWJsZXMiLCJnZXRDb2xsZWN0aW9uQnlNb2RlbEtleSIsImdldENvbGxlY3Rpb25GaWVsZE5hbWVCeUZpZWxkS2V5VW50eXBlZCIsImdldEZpZWxkS2V5QnlDb2xsZWN0aW9uRmllbGROYW1lIiwiY3JlYXRlVHJhbnNmb3JtIiwib3B0aW9ucyIsImVuYWJsZURlYnVnTG9ncyIsInNjaGVtYSIsImRlYnVnTG9nIiwibWVzc2FnZSIsImNvbnNvbGUiLCJsb2ciLCJnZXRDb2xsZWN0aW9uU2x1ZyIsIm1vZGVsIiwiY29sbGVjdGlvbiIsIm1vZGVsTmFtZSIsInJlc29sdmVkU2x1ZyIsImdldEZpZWxkTmFtZSIsImZpZWxkIiwiaW5jbHVkZXMiLCJmaWVsZERlZmluaXRpb24iLCJmaWVsZHMiLCJmaWVsZE5hbWUiLCJvcmlnaW5hbEZpZWxkIiwiaXNSZWxhdGlvbnNoaXBGaWVsZCIsImZpZWxkS2V5Iiwic2NoZW1hRmllbGRzIiwicmVmZXJlbmNlcyIsInVuZGVmaW5lZCIsInNpbmdsZUlkUXVlcnkiLCJ3aGVyZSIsInNvbWUiLCJpZEZpZWxkIiwiY29uZGl0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwidmFsdWUiLCJlcXVhbHMiLCJjb250YWlucyIsImxlbmd0aCIsIm5vcm1hbGl6ZURhdGEiLCJrZXkiLCJpc1JlbGF0ZWRGaWVsZCIsImlkVHlwZSIsInBhcnNlZCIsInBhcnNlSW50IiwiaXNOYU4iLCJvcmlnaW5hbCIsImNvbnZlcnRlZCIsInN0cmluZ0lkIiwiU3RyaW5nIiwibWFwIiwiaWQiLCJzcGxpdCIsInJvbGUiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJ0cmFuc2Zvcm1JbnB1dCIsImRhdGEiLCJwYXlsb2FkIiwidHJhbnNmb3JtZWREYXRhIiwiT2JqZWN0IiwiZW50cmllcyIsImZvckVhY2giLCJzY2hlbWFGaWVsZE5hbWUiLCJub3JtYWxpemVkRGF0YSIsInRhcmdldEZpZWxkTmFtZSIsInRhcmdldEZpZWxkS2V5IiwiY29sbGVjdGlvbnMiLCJ0cmFuc2Zvcm1PdXRwdXQiLCJkb2MiLCJyZXN1bHQiLCJyZWxhdGlvbnNoaXBGaWVsZHMiLCJmcm9tRW50cmllcyIsImZpbHRlciIsImRhdGVGaWVsZHMiLCJfIiwidHlwZSIsImtleXMiLCJvcmlnaW5hbFJlbGF0ZWRGaWVsZEtleSIsImZpbmQiLCJrIiwibm9ybWFsaXplRG9jdW1lbnRJZHMiLCJvcmlnaW5hbERhdGVGaWVsZEtleSIsIkRhdGUiLCJvcmlnaW5hbEtleSIsImV2ZXJ5IiwiaXRlbSIsIm9wZXJhdG9yVG9QYXlsb2FkIiwib3BlcmF0b3IiLCJub3RfZXF1YWxzIiwiZ3JlYXRlcl90aGFuIiwiZ3JlYXRlcl90aGFuX2VxdWFsIiwibGVzc190aGFuIiwibGVzc190aGFuX2VxdWFsIiwiaW4iLCJsaWtlIiwiY29udmVydFdoZXJlVmFsdWUiLCJudW1JZCIsIk51bWJlciIsImNvbnZlcnRXaGVyZUNsYXVzZSIsImdldFBheWxvYWRGaWVsZE5hbWUiLCJ3IiwicmVzIiwiYW5kIiwiY29ubmVjdG9yIiwib3IiLCJhbmRDbGF1c2UiLCJvckNsYXVzZSIsIkFORCIsIk9SIiwiY29udmVydFNlbGVjdCIsInNlbGVjdCIsInJlZHVjZSIsImFjYyIsImNvbnZlcnRTb3J0Iiwic29ydEJ5IiwicHJlZml4IiwiZGlyZWN0aW9uIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxhQUFhLFFBQVEsaUJBQWdCO0FBSzlDLFNBQ0VDLHVCQUF1QixFQUN2QkMsdUNBQXVDLEVBQ3ZD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