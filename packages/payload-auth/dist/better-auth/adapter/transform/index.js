import { getAuthTables } from "better-auth/db";
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
   */ function transformInput({ data, model, idType }) {
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
            transformedData[targetFieldName] = normalizedData;
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
   */ function transformOutput({ doc, model }) {
        if (!doc || typeof doc !== 'object') return doc;
        const result = {
            ...doc
        };
        const schemaFields = schema?.[model]?.fields ?? {};
        // Identify relationship fields with custom field name mappings
        const relationshipFields = Object.fromEntries(Object.entries(schemaFields).filter(([key])=>isRelationshipField(key, schemaFields)));
        const dateFields = Object.fromEntries(Object.entries(schemaFields).filter(([_, value])=>value.type === 'date'));
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
   */ function convertWhereClause({ idType, model, where }) {
        // Handle empty where clause
        if (!where) return {};
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
                [fieldName]: operatorToPayload(w.operator ?? '', value)
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
                [fieldName]: operatorToPayload(w.operator ?? '', value)
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
                [fieldName]: operatorToPayload(w.operator ?? '', value)
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9hZGFwdGVyL3RyYW5zZm9ybS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJldHRlckF1dGhPcHRpb25zLCBXaGVyZSB9IGZyb20gJ2JldHRlci1hdXRoJ1xuaW1wb3J0IHR5cGUgeyBGaWVsZEF0dHJpYnV0ZSB9IGZyb20gJ2JldHRlci1hdXRoL2RiJ1xuaW1wb3J0IHsgdHlwZSBGaWVsZFR5cGUsIGdldEF1dGhUYWJsZXMgfSBmcm9tICdiZXR0ZXItYXV0aC9kYidcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvblNsdWcsIFdoZXJlIGFzIFBheWxvYWRXaGVyZSB9IGZyb20gJ3BheWxvYWQnXG5cbmV4cG9ydCBjb25zdCBjcmVhdGVUcmFuc2Zvcm0gPSAob3B0aW9uczogQmV0dGVyQXV0aE9wdGlvbnMsIGVuYWJsZURlYnVnTG9nczogYm9vbGVhbikgPT4ge1xuICBjb25zdCBzY2hlbWEgPSBnZXRBdXRoVGFibGVzKG9wdGlvbnMpXG5cbiAgZnVuY3Rpb24gZGVidWdMb2cobWVzc2FnZTogYW55W10pIHtcbiAgICBpZiAoZW5hYmxlRGVidWdMb2dzKSB7XG4gICAgICBjb25zb2xlLmxvZyhgW3BheWxvYWQtZGItYWRhcHRlcl1gLCAuLi5tZXNzYWdlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGEgQmV0dGVyQXV0aCBzY2hlbWEgbW9kZWwgbmFtZSB0byBpdHMgY29ycmVzcG9uZGluZyBQYXlsb2FkIENNUyBjb2xsZWN0aW9uIHNsdWcuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gcmVzb2x2ZXMgdGhlIGFwcHJvcHJpYXRlIGNvbGxlY3Rpb24gc2x1ZyBieTpcbiAgICogMS4gTG9va2luZyB1cCB0aGUgbW9kZWwgaW4gdGhlIEJldHRlckF1dGggc2NoZW1hIHRvIGZpbmQgaXRzIGNvbmZpZ3VyZWQgbW9kZWxOYW1lXG4gICAqIDIuIEZhbGxpbmcgYmFjayB0byB0aGUgb3JpZ2luYWwgbW9kZWwgbmFtZSBpZiBubyBtYXBwaW5nIGV4aXN0c1xuICAgKlxuICAgKiBDb2xsZWN0aW9uIHNsdWcgcmVzb2x1dGlvbiBmb2xsb3dzIHRoZXNlIHJ1bGVzOlxuICAgKiAtIEZvciBiYXNlIGNvbGxlY3Rpb25zOiBUaGUgc2FuaXRpemVCZXR0ZXJBdXRoT3B0aW9ucyBmdW5jdGlvbiBlbnN1cmVzIHRoZSBjb2xsZWN0aW9uIHNsdWdcbiAgICogICBmcm9tIHBsdWdpbiBvcHRpb25zIGlzIHNldCBhcyB0aGUgbW9kZWwgbmFtZSBpbiB0aGUgc2NoZW1hXG4gICAqIC0gRm9yIHBsdWdpbnM6IFRoZSBiZXR0ZXJBdXRoUGx1Z2luU2x1Z3MgY29uc3RhbnQgaXMgdXNlZCBhcyB0aGUgbW9kZWxOYW1lXG4gICAqXG4gICAqIEBwYXJhbSBtb2RlbCAtIFRoZSBCZXR0ZXJBdXRoIG1vZGVsIG5hbWUgdG8gcmVzb2x2ZVxuICAgKiBAcmV0dXJucyBUaGUgY29ycmVzcG9uZGluZyBQYXlsb2FkIENNUyBjb2xsZWN0aW9uIHNsdWdcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgc2NoZW1hWyd1c2VyJ10ubW9kZWxOYW1lIGlzICd1c2VycydcbiAgICogZ2V0Q29sbGVjdGlvblNsdWcoJ3VzZXInKSAvLyBSZXR1cm5zICd1c2VycydcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgbW9kZWwgZG9lc24ndCBleGlzdCBpbiBzY2hlbWFcbiAgICogZ2V0Q29sbGVjdGlvblNsdWcoJ2N1c3RvbScpIC8vIFJldHVybnMgJ2N1c3RvbSdcbiAgICpcbiAgICogQHdhcm5pbmcgSWYgYSBjb2xsZWN0aW9uIGlzIG92ZXJyaWRkZW4gdXNpbmcgdGhlIGNvbGxlY3Rpb25PdmVycmlkZSBvcHRpb25cbiAgICogd2l0aG91dCB1cGRhdGluZyB0aGUgc2NoZW1hIG1hcHBpbmcsIHRoaXMgZnVuY3Rpb24gbWF5IHJldHVybiBpbmNvcnJlY3Qgc2x1Z3NcbiAgICovXG4gIGZ1bmN0aW9uIGdldENvbGxlY3Rpb25TbHVnKG1vZGVsOiBNb2RlbEtleSk6IENvbGxlY3Rpb25TbHVnIHtcbiAgICAvLyBGaXJzdCB0cnkgdG8gZ2V0IHRoZSBtb2RlbE5hbWUgZnJvbSBzY2hlbWEsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gdGhlIG9yaWdpbmFsIG1vZGVsIG5hbWVcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gc2NoZW1hPy5bbW9kZWxdPy5tb2RlbE5hbWUgfHwgbW9kZWxcbiAgICBkZWJ1Z0xvZyhbJ2dldENvbGxlY3Rpb25TbHVnOicsIHsgbW9kZWwsIHJlc29sdmVkU2x1ZzogY29sbGVjdGlvbiB9XSlcbiAgICByZXR1cm4gY29sbGVjdGlvbiBhcyBDb2xsZWN0aW9uU2x1Z1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcHMgYSBCZXR0ZXJBdXRoIHNjaGVtYSBmaWVsZCB0byBpdHMgY29ycmVzcG9uZGluZyBQYXlsb2FkIENNUyBmaWVsZCBuYW1lLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHJlc29sdmVzIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCBuYW1lIGJ5OlxuICAgKiAxLiBQcmVzZXJ2aW5nICdpZCcgb3IgJ19pZCcgZmllbGRzIGFzLWlzIChzcGVjaWFsIGNhc2UgaGFuZGxpbmcpXG4gICAqIDIuIExvb2tpbmcgdXAgdGhlIGZpZWxkIGluIHRoZSBCZXR0ZXJBdXRoIHNjaGVtYSB0byBmaW5kIGl0cyBjb25maWd1cmVkIGZpZWxkTmFtZVxuICAgKiAzLiBGYWxsaW5nIGJhY2sgdG8gdGhlIG9yaWdpbmFsIGZpZWxkIG5hbWUgaWYgbm8gbWFwcGluZyBleGlzdHNcbiAgICpcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIEJldHRlckF1dGggbW9kZWwgbmFtZSBjb250YWluaW5nIHRoZSBmaWVsZFxuICAgKiBAcGFyYW0gZmllbGQgLSBUaGUgb3JpZ2luYWwgZmllbGQgbmFtZSB0byByZXNvbHZlXG4gICAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIFBheWxvYWQgQ01TIGZpZWxkIG5hbWVcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgc2NoZW1hWyd1c2VyJ10uZmllbGRzWydlbWFpbCddLmZpZWxkTmFtZSBpcyAnZW1haWxBZGRyZXNzJ1xuICAgKiBnZXRGaWVsZE5hbWUoJ3VzZXInLCAnZW1haWwnKSAvLyBSZXR1cm5zICdlbWFpbEFkZHJlc3MnXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFNwZWNpYWwgY2FzZSBmb3IgSUQgZmllbGRzXG4gICAqIGdldEZpZWxkTmFtZSgndXNlcicsICdpZCcpIC8vIEFsd2F5cyByZXR1cm5zICdpZCdcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgZmllbGQgZG9lc24ndCBleGlzdCBpbiBzY2hlbWEgb3IgaGFzIG5vIGZpZWxkTmFtZSBtYXBwaW5nXG4gICAqIGdldEZpZWxkTmFtZSgndXNlcicsICdjdXN0b20nKSAvLyBSZXR1cm5zICdjdXN0b20nXG4gICAqXG4gICAqIEB3YXJuaW5nIElmIGEgZmllbGROYW1lIGlzIG92ZXJyaWRkZW4gaW4gdGhlIHBheWxvYWQgY29sbGVjdGlvbiBjb25maWcgdXNpbmcgdGhlIGNvbGxlY3Rpb25PdmVycmlkZSBvcHRpb25cbiAgICogd2l0aG91dCB1cGRhdGluZyB0aGUgc2NoZW1hIG1hcHBpbmcsIHRoaXMgZnVuY3Rpb24gbWF5IHJldHVybiBpbmNvcnJlY3QgZmllbGQgbmFtZXNcbiAgICovXG4gIGZ1bmN0aW9uIGdldEZpZWxkTmFtZShtb2RlbDogTW9kZWxLZXksIGZpZWxkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogJ2lkJyBvciAnX2lkJyBpcyBhbHdheXMgcHJlc2VydmVkIGFzLWlzXG4gICAgaWYgKFsnaWQnLCAnX2lkJ10uaW5jbHVkZXMoZmllbGQpKSB7XG4gICAgICByZXR1cm4gZmllbGRcbiAgICB9XG5cbiAgICAvLyBMb29rIHVwIHRoZSBmaWVsZCBpbiB0aGUgc2NoZW1hXG4gICAgY29uc3QgZmllbGREZWZpbml0aW9uID0gc2NoZW1hW21vZGVsXT8uZmllbGRzW2ZpZWxkXVxuXG4gICAgLy8gVXNlIHRoZSBjb25maWd1cmVkIGZpZWxkTmFtZSBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gb3JpZ2luYWxcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZERlZmluaXRpb24/LmZpZWxkTmFtZSB8fCBmaWVsZFxuXG4gICAgLy8gTG9nIHRoZSBmaWVsZCByZXNvbHV0aW9uIGZvciBkZWJ1Z2dpbmdcbiAgICBkZWJ1Z0xvZyhbJ2dldEZpZWxkOiAnLCB7IG1vZGVsLCBvcmlnaW5hbEZpZWxkOiBmaWVsZCwgZmllbGROYW1lIH1dKVxuXG4gICAgcmV0dXJuIGZpZWxkTmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYSBmaWVsZCBpcyBhIHJlbGF0aW9uc2hpcCBmaWVsZCBieSBjaGVja2luZyBmb3IgYSByZWZlcmVuY2VzIHByb3BlcnR5LlxuICAgKlxuICAgKiBSZWxhdGlvbnNoaXAgZmllbGRzIGluIHRoZSBzY2hlbWEgaGF2ZSBhICdyZWZlcmVuY2VzJyBwcm9wZXJ0eSB0aGF0IHBvaW50cyB0byBhbm90aGVyIG1vZGVsLlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiB0aGlzIHByb3BlcnR5IGV4aXN0cyB0byBpZGVudGlmeSByZWxhdGlvbnNoaXAgZmllbGRzLlxuICAgKlxuICAgKiBAcGFyYW0gZmllbGRLZXkgLSBUaGUga2V5IG9mIHRoZSBmaWVsZCB0byBjaGVjayBpbiB0aGUgc2NoZW1hXG4gICAqIEBwYXJhbSBzY2hlbWFGaWVsZHMgLSBPYmplY3QgY29udGFpbmluZyBhbGwgZmllbGRzIGZyb20gdGhlIHNjaGVtYSBmb3IgYSBzcGVjaWZpYyBtb2RlbFxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBmaWVsZCBpcyBhIHJlbGF0aW9uc2hpcCBmaWVsZCAoaGFzIHJlZmVyZW5jZXMpLCBmYWxzZSBvdGhlcndpc2VcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSWYgc2NoZW1hLnVzZXIuZmllbGRzLnBvc3RzIGhhcyB7IHJlZmVyZW5jZXM6IHt9IH1cbiAgICogaXNSZWxhdGlvbnNoaXBGaWVsZCgncG9zdHMnLCBzY2hlbWEudXNlci5maWVsZHMpIC8vIFJldHVybnMgdHJ1ZVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBJZiBzY2hlbWEudXNlci5maWVsZHMuZW1haWwgaGFzIG5vIHJlZmVyZW5jZXMgcHJvcGVydHlcbiAgICogaXNSZWxhdGlvbnNoaXBGaWVsZCgnZW1haWwnLCBzY2hlbWEudXNlci5maWVsZHMpIC8vIFJldHVybnMgZmFsc2VcbiAgICovXG4gIGZ1bmN0aW9uIGlzUmVsYXRpb25zaGlwRmllbGQoZmllbGRLZXk6IHN0cmluZywgc2NoZW1hRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWVsZEF0dHJpYnV0ZT4pOiBib29sZWFuIHtcbiAgICAvLyBBIGZpZWxkIGlzIGEgcmVsYXRpb25zaGlwIGZpZWxkIGlmIGl0IGhhcyBhICdyZWZlcmVuY2VzJyBwcm9wZXJ0eSBkZWZpbmVkXG4gICAgcmV0dXJuIHNjaGVtYUZpZWxkc1tmaWVsZEtleV0/LnJlZmVyZW5jZXMgIT09IHVuZGVmaW5lZFxuICB9XG4gIC8qKlxuICAgKiBFeHRyYWN0cyBhIHNpbmdsZSBJRCB2YWx1ZSBmcm9tIGEgUGF5bG9hZCB3aGVyZSBjbGF1c2UgaWYgaXQgcmVwcmVzZW50cyBhIHNpbXBsZSBJRCBxdWVyeS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBhbmFseXplcyBhIFBheWxvYWQgd2hlcmUgY2xhdXNlIHRvIGRldGVybWluZSBpZiBpdCdzIGEgc2ltcGxlIHF1ZXJ5IGZvciBhXG4gICAqIHNpbmdsZSBkb2N1bWVudCBieSBJRC4gSXQgc3VwcG9ydHMgYm90aCAnaWQnIGFuZCAnX2lkJyBmaWVsZHMgd2l0aCAnZXF1YWxzJyBvciAnY29udGFpbnMnXG4gICAqIG9wZXJhdG9ycy4gVGhpcyBpcyB1c2VmdWwgZm9yIG9wdGltaXppbmcgcXVlcmllcyB3aGVuIHdlIG9ubHkgbmVlZCB0byBmZXRjaCBhIHNpbmdsZSBkb2N1bWVudC5cbiAgICpcbiAgICogQHBhcmFtIHdoZXJlIC0gVGhlIFBheWxvYWQgd2hlcmUgY2xhdXNlIHRvIGFuYWx5emVcbiAgICogQHJldHVybnMgVGhlIElEIHZhbHVlIChzdHJpbmcgb3IgbnVtYmVyKSBpZiB0aGUgd2hlcmUgY2xhdXNlIGlzIGEgc2ltcGxlIElEIHF1ZXJ5LCBudWxsIG90aGVyd2lzZVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBSZXR1cm5zICcxMjMnIGZvciBhIHNpbXBsZSBlcXVhbHMgcXVlcnlcbiAgICogc2luZ2xlSWRRdWVyeSh7IGlkOiB7IGVxdWFsczogJzEyMycgfSB9KSAvLyAnMTIzJ1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBSZXR1cm5zIDQ1NiBmb3IgYSBzaW1wbGUgZXF1YWxzIHF1ZXJ5IHdpdGggbnVtYmVyIElEXG4gICAqIHNpbmdsZUlkUXVlcnkoeyBfaWQ6IHsgZXF1YWxzOiA0NTYgfSB9KSAvLyA0NTZcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gUmV0dXJucyAnNzg5JyBmb3IgYSBjb250YWlucyBxdWVyeSB3aXRoIGEgc2luZ2xlIHZhbHVlXG4gICAqIHNpbmdsZUlkUXVlcnkoeyBpZDogeyBjb250YWluczogWyc3ODknXSB9IH0pIC8vICc3ODknXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIC8vIFJldHVybnMgbnVsbCBmb3IgY29tcGxleCBxdWVyaWVzXG4gICAqIHNpbmdsZUlkUXVlcnkoeyBhbmQ6IFt7IGlkOiB7IGVxdWFsczogJzEyMycgfSB9XSB9KSAvLyBudWxsXG4gICAqL1xuICBmdW5jdGlvbiBzaW5nbGVJZFF1ZXJ5KHdoZXJlOiBQYXlsb2FkV2hlcmUpIHtcbiAgICAvLyBSZXR1cm4gbnVsbCBmb3IgZW1wdHkgd2hlcmUgY2xhdXNlcyBvciBjb21wbGV4IHF1ZXJpZXMgd2l0aCAnYW5kJy8nb3InIG9wZXJhdG9yc1xuICAgIGlmICghd2hlcmUgfHwgJ2FuZCcgaW4gd2hlcmUgfHwgJ29yJyBpbiB3aGVyZSkgcmV0dXJuIG51bGxcblxuICAgIC8vIENoZWNrIGlmIHRoZSB3aGVyZSBjbGF1c2UgY29udGFpbnMgZWl0aGVyICdpZCcgb3IgJ19pZCcgZmllbGRcbiAgICBpZiAoWydpZCcsICdfaWQnXS5zb21lKChmaWVsZCkgPT4gZmllbGQgaW4gd2hlcmUpKSB7XG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggSUQgZmllbGQgaXMgYmVpbmcgdXNlZCAoc3VwcG9ydCBib3RoICdpZCcgYW5kICdfaWQnKVxuICAgICAgY29uc3QgaWRGaWVsZCA9ICdpZCcgaW4gd2hlcmUgPyAnaWQnIDogJ19pZCdcbiAgICAgIGNvbnN0IGNvbmRpdGlvbiA9IHdoZXJlW2lkRmllbGRdXG5cbiAgICAgIC8vIFByb2Nlc3MgdGhlIGVxdWFscyBvcGVyYXRvciBjYXNlXG4gICAgICBpZiAoY29uZGl0aW9uICYmIHR5cGVvZiBjb25kaXRpb24gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbmRpdGlvbikgJiYgJ2VxdWFscycgaW4gY29uZGl0aW9uKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gY29uZGl0aW9uLmVxdWFsc1xuICAgICAgICAvLyBPbmx5IHJldHVybiBzdHJpbmcgb3IgbnVtYmVyIElEIHZhbHVlc1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUHJvY2VzcyB0aGUgY29udGFpbnMgb3BlcmF0b3IgY2FzZSB3aXRoIGEgc2luZ2xlIHZhbHVlXG4gICAgICBpZiAoXG4gICAgICAgIGNvbmRpdGlvbiAmJlxuICAgICAgICB0eXBlb2YgY29uZGl0aW9uID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAhQXJyYXkuaXNBcnJheShjb25kaXRpb24pICYmXG4gICAgICAgICdjb250YWlucycgaW4gY29uZGl0aW9uICYmXG4gICAgICAgIEFycmF5LmlzQXJyYXkoY29uZGl0aW9uLmNvbnRhaW5zKSAmJlxuICAgICAgICBjb25kaXRpb24uY29udGFpbnMubGVuZ3RoID09PSAxXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjb25kaXRpb24uY29udGFpbnNbMF1cbiAgICAgICAgLy8gT25seSByZXR1cm4gc3RyaW5nIG9yIG51bWJlciBJRCB2YWx1ZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIG51bGwgaWYgbm8gdmFsaWQgSUQgcXVlcnkgd2FzIGZvdW5kXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGRhdGEgdmFsdWVzIGJhc2VkIG9uIGZpZWxkIHR5cGUgYW5kIHJlcXVpcmVkIElEIHR5cGVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBoYW5kbGVzIHR5cGUgY29udmVyc2lvbiBmb3IgcmVsYXRpb25zaGlwIGZpZWxkcyB0byBlbnN1cmVcbiAgICogSURzIGFyZSBpbiB0aGUgY29ycmVjdCBmb3JtYXQgKHN0cmluZyBvciBudW1iZXIpIGJhc2VkIG9uIHRoZSBjb25maWd1cmF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IC0gVGhlIGZpZWxkIGtleS9uYW1lXG4gICAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBub3JtYWxpemVcbiAgICogQHBhcmFtIGlzUmVsYXRlZEZpZWxkIC0gV2hldGhlciB0aGlzIGZpZWxkIGlzIGEgcmVsYXRpb25zaGlwIGZpZWxkXG4gICAqIEBwYXJhbSBpZFR5cGUgLSBUaGUgZXhwZWN0ZWQgSUQgdHlwZSAoJ251bWJlcicgb3IgJ3RleHQnKVxuICAgKiBAcmV0dXJucyBUaGUgbm9ybWFsaXplZCB2YWx1ZVxuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplRGF0YSh7XG4gICAga2V5LFxuICAgIHZhbHVlLFxuICAgIGlzUmVsYXRlZEZpZWxkLFxuICAgIGlkVHlwZVxuICB9OiB7XG4gICAga2V5OiBzdHJpbmdcbiAgICB2YWx1ZTogYW55XG4gICAgaXNSZWxhdGVkRmllbGQ6IGJvb2xlYW5cbiAgICBpZFR5cGU6ICdudW1iZXInIHwgJ3RleHQnXG4gIH0pIHtcbiAgICAvLyBTa2lwIHByb2Nlc3NpbmcgZm9yIG51bGwvdW5kZWZpbmVkIHZhbHVlc1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBpZiAoWydpZCcsICdfaWQnXS5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBpZFR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KHZhbHVlLCAxMClcbiAgICAgICAgaWYgKCFpc05hTihwYXJzZWQpKSB7XG4gICAgICAgICAgZGVidWdMb2coW2BJRCBjb252ZXJzaW9uOiAke2tleX0gY29udmVydGluZyBzdHJpbmcgSUQgdG8gbnVtYmVyYCwgeyBvcmlnaW5hbDogdmFsdWUsIGNvbnZlcnRlZDogcGFyc2VkIH1dKVxuICAgICAgICAgIHJldHVybiBwYXJzZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaWRUeXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgY29uc3Qgc3RyaW5nSWQgPSBTdHJpbmcodmFsdWUpXG4gICAgICAgIGRlYnVnTG9nKFtgSUQgY29udmVyc2lvbjogJHtrZXl9IGNvbnZlcnRpbmcgbnVtYmVyIElEIHRvIHN0cmluZ2AsIHsgb3JpZ2luYWw6IHZhbHVlLCBjb252ZXJ0ZWQ6IHN0cmluZ0lkIH1dKVxuICAgICAgICByZXR1cm4gc3RyaW5nSWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbmx5IHByb2Nlc3MgcmVsYXRpb25zaGlwIGZpZWxkcyB0aGF0IG5lZWQgdHlwZSBjb252ZXJzaW9uXG4gICAgaWYgKGlzUmVsYXRlZEZpZWxkKSB7XG4gICAgICAvLyBIYW5kbGUgc2luZ2xlIElEIHZhbHVlIGNvbnZlcnNpb25cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIGlkVHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQodmFsdWUsIDEwKVxuICAgICAgICBpZiAoIWlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgICBkZWJ1Z0xvZyhbYElEIGNvbnZlcnNpb246ICR7a2V5fSBjb252ZXJ0aW5nIHN0cmluZyBJRCB0byBudW1iZXJgLCB7IG9yaWdpbmFsOiB2YWx1ZSwgY29udmVydGVkOiBwYXJzZWQgfV0pXG4gICAgICAgICAgcmV0dXJuIHBhcnNlZFxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaWRUeXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgY29uc3Qgc3RyaW5nSWQgPSBTdHJpbmcodmFsdWUpXG4gICAgICAgIGRlYnVnTG9nKFtgSUQgY29udmVyc2lvbjogJHtrZXl9IGNvbnZlcnRpbmcgbnVtYmVyIElEIHRvIHN0cmluZ2AsIHsgb3JpZ2luYWw6IHZhbHVlLCBjb252ZXJ0ZWQ6IHN0cmluZ0lkIH1dKVxuICAgICAgICByZXR1cm4gc3RyaW5nSWRcbiAgICAgIH1cblxuICAgICAgLy8gSGFuZGxlIGFycmF5IG9mIElEcyAtIG1hcCBlYWNoIHZhbHVlIHRvIHRoZSBjb3JyZWN0IHR5cGVcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWUubWFwKChpZCkgPT4ge1xuICAgICAgICAgIC8vIFNraXAgbnVsbC91bmRlZmluZWQgdmFsdWVzIGluIGFycmF5c1xuICAgICAgICAgIGlmIChpZCA9PT0gbnVsbCB8fCBpZCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gaWRcblxuICAgICAgICAgIGlmIChpZFR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlSW50KGlkLCAxMClcbiAgICAgICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VkKSA/IHBhcnNlZCA6IGlkXG4gICAgICAgICAgfSBlbHNlIGlmIChpZFR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgaWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKGlkKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaWRcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gb3JpZ2luYWwgdmFsdWUgaWYgbm8gY29udmVyc2lvbiB3YXMgbmVlZGVkIG9yIGFwcGxpY2FibGVcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGlucHV0IGRhdGEgZnJvbSBiZXR0ZXItYXV0aCB0byBQYXlsb2FkIENNUyBmb3JtYXRcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBoYW5kbGVzOlxuICAgKiAxLiBGaWVsZCBuYW1lIG1hcHBpbmcgYWNjb3JkaW5nIHRvIHNjaGVtYSBkZWZpbml0aW9uc1xuICAgKiAyLiBJRCB0eXBlIGNvbnZlcnNpb24gZm9yIHJlbGF0aW9uc2hpcCBmaWVsZHNcbiAgICogMy4gUHJvcGVyIGRhdGEgbm9ybWFsaXphdGlvbiBiYXNlZCBvbiBmaWVsZCB0eXBlc1xuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFRoZSBpbnB1dCBkYXRhIGZyb20gYmV0dGVyLWF1dGhcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIG1vZGVsIG5hbWUgaW4gdGhlIHNjaGVtYVxuICAgKiBAcGFyYW0gaWRUeXBlIC0gVGhlIGV4cGVjdGVkIElEIHR5cGUgKCdudW1iZXInIG9yICd0ZXh0JylcbiAgICogQHJldHVybnMgVHJhbnNmb3JtZWQgZGF0YSBjb21wYXRpYmxlIHdpdGggUGF5bG9hZCBDTVNcbiAgICovXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybUlucHV0KHtcbiAgICBkYXRhLFxuICAgIG1vZGVsLFxuICAgIGlkVHlwZVxuICB9OiB7XG4gICAgZGF0YTogUmVjb3JkPHN0cmluZywgYW55PlxuICAgIG1vZGVsOiBNb2RlbEtleVxuICAgIGlkVHlwZTogJ251bWJlcicgfCAndGV4dCdcbiAgfSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG4gICAgY29uc3Qgc2NoZW1hRmllbGRzID0gc2NoZW1hPy5bbW9kZWxdPy5maWVsZHMgPz8ge31cblxuICAgIC8vIFByb2Nlc3MgZWFjaCBmaWVsZCBpbiB0aGUgaW5wdXQgZGF0YVxuICAgIE9iamVjdC5lbnRyaWVzKGRhdGEpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgLy8gU2tpcCBudWxsL3VuZGVmaW5lZCB2YWx1ZXNcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBpcyBhIHJlbGF0aW9uc2hpcCBmaWVsZFxuICAgICAgY29uc3QgaXNSZWxhdGVkRmllbGQgPSBpc1JlbGF0aW9uc2hpcEZpZWxkKGtleSwgc2NoZW1hRmllbGRzKVxuXG4gICAgICAvLyBHZXQgdGhlIG1hcHBlZCBmaWVsZCBuYW1lIGZyb20gc2NoZW1hIChpZiBhbnkpXG4gICAgICBjb25zdCBzY2hlbWFGaWVsZE5hbWUgPSBzY2hlbWFGaWVsZHNba2V5XT8uZmllbGROYW1lXG5cbiAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgZGF0YSB2YWx1ZSBiYXNlZCBvbiBmaWVsZCB0eXBlIGFuZCBJRCB0eXBlXG4gICAgICBjb25zdCBub3JtYWxpemVkRGF0YSA9IG5vcm1hbGl6ZURhdGEoe1xuICAgICAgICBpZFR5cGUsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGlzUmVsYXRlZEZpZWxkXG4gICAgICB9KVxuXG4gICAgICAvLyBVc2UgdGhlIHNjaGVtYS1kZWZpbmVkIGZpZWxkIG5hbWUgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgdXNlIG9yaWdpbmFsIGtleVxuICAgICAgY29uc3QgdGFyZ2V0RmllbGROYW1lID0gc2NoZW1hRmllbGROYW1lIHx8IGtleVxuICAgICAgdHJhbnNmb3JtZWREYXRhW3RhcmdldEZpZWxkTmFtZV0gPSBub3JtYWxpemVkRGF0YVxuICAgIH0pXG5cbiAgICByZXR1cm4gdHJhbnNmb3JtZWREYXRhXG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBQYXlsb2FkIENNUyBkb2N1bWVudCBvdXRwdXQgdG8gbWF0Y2ggQmV0dGVyQXV0aCBzY2hlbWEgZXhwZWN0YXRpb25zLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGhhbmRsZXMgc2V2ZXJhbCBjcml0aWNhbCB0cmFuc2Zvcm1hdGlvbnM6XG4gICAqXG4gICAqIDEuIElEIENvbnZlcnNpb246IEVuc3VyZXMgYWxsIElEIGZpZWxkcyBhcmUgc3RyaW5ncyBhcyByZXF1aXJlZCBieSBCZXR0ZXJBdXRoXG4gICAqICAgIChzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9iZXR0ZXItYXV0aC9iZXR0ZXItYXV0aC9ibG9iL21haW4vcGFja2FnZXMvYmV0dGVyLWF1dGgvc3JjL2RiL3NjaGVtYS50cyNMMTI1KVxuICAgKlxuICAgKiAyLiBSZWxhdGlvbnNoaXAgRmllbGQgTWFwcGluZzogQWxpZ25zIHJlbGF0aW9uc2hpcCBmaWVsZHMgd2l0aCBCZXR0ZXJBdXRoIHNjaGVtYSBuYW1pbmcgY29udmVudGlvbnNcbiAgICogICAgYW5kIGVuc3VyZXMgcHJvcGVyIElEIHR5cGUgaGFuZGxpbmdcbiAgICpcbiAgICogMy4gRGF0ZSBDb252ZXJzaW9uOiBUcmFuc2Zvcm1zIGRhdGUgc3RyaW5ncyBmcm9tIFBheWxvYWQgaW50byBEYXRlIG9iamVjdHMgZm9yIEJldHRlckF1dGhcbiAgICpcbiAgICogTm90ZTogV2hpbGUgc2V0dGluZyBkZXB0aDogMSBpbiBQYXlsb2FkIG9wZXJhdGlvbnMgc2ltcGxpZmllcyB0aGlzIHByb2Nlc3MgYnkgYXZvaWRpbmdcbiAgICogZGVlcGx5IG5lc3RlZCBvYmplY3RzLCB3ZSBtYWludGFpbiBjb21wcmVoZW5zaXZlIGNoZWNrcyBmb3Igcm9idXN0bmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGRvYyAtIFRoZSBkb2N1bWVudCByZXR1cm5lZCBmcm9tIFBheWxvYWQgQ01TXG4gICAqIEBwYXJhbSBtb2RlbCAtIFRoZSBtb2RlbCBuYW1lIGluIHRoZSBCZXR0ZXJBdXRoIHNjaGVtYVxuICAgKiBAcmV0dXJucyBUaGUgdHJhbnNmb3JtZWQgZG9jdW1lbnQgY29tcGF0aWJsZSB3aXRoIEJldHRlckF1dGhcbiAgICovXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybU91dHB1dDxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGw+KHsgZG9jLCBtb2RlbCB9OiB7IGRvYzogVDsgbW9kZWw6IE1vZGVsS2V5IH0pOiBUIHtcbiAgICBpZiAoIWRvYyB8fCB0eXBlb2YgZG9jICE9PSAnb2JqZWN0JykgcmV0dXJuIGRvY1xuXG4gICAgY29uc3QgcmVzdWx0ID0geyAuLi5kb2MgfVxuICAgIGNvbnN0IHNjaGVtYUZpZWxkcyA9IHNjaGVtYT8uW21vZGVsXT8uZmllbGRzID8/IHt9XG5cbiAgICAvLyBJZGVudGlmeSByZWxhdGlvbnNoaXAgZmllbGRzIHdpdGggY3VzdG9tIGZpZWxkIG5hbWUgbWFwcGluZ3NcbiAgICBjb25zdCByZWxhdGlvbnNoaXBGaWVsZHMgPSBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMoc2NoZW1hRmllbGRzKS5maWx0ZXIoKFtrZXldKSA9PiBpc1JlbGF0aW9uc2hpcEZpZWxkKGtleSwgc2NoZW1hRmllbGRzKSkpXG4gICAgY29uc3QgZGF0ZUZpZWxkcyA9IE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhzY2hlbWFGaWVsZHMpLmZpbHRlcigoW18sIHZhbHVlXSkgPT4gdmFsdWUudHlwZSA9PT0gJ2RhdGUnKSlcblxuICAgIE9iamVjdC5lbnRyaWVzKGRvYykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG5cbiAgICAgIC8vIENvbnZlcnQgSUQgZmllbGRzIHRvIHN0cmluZ3MgZm9yIEJldHRlckF1dGggY29tcGF0aWJpbGl0eVxuICAgICAgaWYgKFsnaWQnLCAnX2lkJ10uaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IFN0cmluZyh2YWx1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSByZWxhdGlvbnNoaXAgZmllbGRzIHdpdGggcmVuYW1lZCBmaWVsZE5hbWVzXG4gICAgICBjb25zdCBvcmlnaW5hbFJlbGF0ZWRGaWVsZEtleSA9IE9iamVjdC5rZXlzKHJlbGF0aW9uc2hpcEZpZWxkcykuZmluZCgoaykgPT4gcmVsYXRpb25zaGlwRmllbGRzW2tdLmZpZWxkTmFtZSA9PT0ga2V5KVxuICAgICAgaWYgKG9yaWdpbmFsUmVsYXRlZEZpZWxkS2V5KSB7XG4gICAgICAgIG5vcm1hbGl6ZURvY3VtZW50SWRzKHJlc3VsdCwgb3JpZ2luYWxSZWxhdGVkRmllbGRLZXksIGtleSwgdmFsdWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcmlnaW5hbERhdGVGaWVsZEtleSA9IE9iamVjdC5rZXlzKGRhdGVGaWVsZHMpLmZpbmQoKGspID0+IGRhdGVGaWVsZHNba10uZmllbGROYW1lID09PSBrZXkpXG4gICAgICBpZiAob3JpZ2luYWxEYXRlRmllbGRLZXkpIHtcbiAgICAgICAgLy8gQ29udmVydCBJU08gZGF0ZSBzdHJpbmdzIHRvIERhdGUgb2JqZWN0cyBmb3IgQmV0dGVyQXV0aFxuICAgICAgICByZXN1bHRba2V5XSA9IG5ldyBEYXRlKHZhbHVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBUXG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBJRCBmaWVsZHMgZm9yIGJvdGggcHJpbWFyeSBhbmQgcmVsYXRpb25zaGlwIGRvY3VtZW50cy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBlbnN1cmVzIGNvbnNpc3RlbnQgSUQgaGFuZGxpbmcgYmV0d2VlbiBCZXR0ZXJBdXRoIGFuZCBQYXlsb2FkIENNUyBieTpcbiAgICogMS4gQ29udmVydGluZyBhbGwgSURzIHRvIHN0cmluZ3MgZm9yIEJldHRlckF1dGggKHN0b3JlZCBpbiBvcmlnaW5hbEtleSlcbiAgICogMi4gUHJlc2VydmluZyBvcmlnaW5hbCBJRCB0eXBlcyBmb3IgUGF5bG9hZCBDTVMgKHN0b3JlZCBpbiBmaWVsZE5hbWUpXG4gICAqXG4gICAqIFRoZSBmdW5jdGlvbiBoYW5kbGVzIHZhcmlvdXMgSUQgZm9ybWF0czpcbiAgICogLSBQcmltaXRpdmUgdmFsdWVzIChzdHJpbmcvbnVtYmVyIElEcylcbiAgICogLSBPYmplY3QgcmVmZXJlbmNlcyB3aXRoIElEIHByb3BlcnRpZXNcbiAgICogLSBBcnJheXMgb2YgZWl0aGVyIHByaW1pdGl2ZSBJRHMgb3Igb2JqZWN0IHJlZmVyZW5jZXNcbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdCAtIFRoZSByZXN1bHQgb2JqZWN0IGJlaW5nIHRyYW5zZm9ybWVkXG4gICAqIEBwYXJhbSBvcmlnaW5hbEtleSAtIFRoZSBvcmlnaW5hbCBmaWVsZCBrZXkgZnJvbSBCZXR0ZXJBdXRoIHNjaGVtYVxuICAgKiBAcGFyYW0gZmllbGROYW1lIC0gVGhlIHJlbmFtZWQgZmllbGQgYXMgdXNlZCBpbiBQYXlsb2FkIENNU1xuICAgKiBAcGFyYW0gdmFsdWUgLSBUaGUgSUQgdmFsdWUgdG8gbm9ybWFsaXplIChwcmltaXRpdmUsIG9iamVjdCwgb3IgYXJyYXkpXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVEb2N1bWVudElkcyhyZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4sIG9yaWdpbmFsS2V5OiBzdHJpbmcsIGZpZWxkTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gQ2FzZSAxOiBQcmltaXRpdmUgSUQgdmFsdWUgKHN0cmluZyBvciBudW1iZXIpXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgLy8gRm9yIEJldHRlckF1dGg6IEFsd2F5cyB1c2Ugc3RyaW5nIElEc1xuICAgICAgcmVzdWx0W29yaWdpbmFsS2V5XSA9IFN0cmluZyh2YWx1ZSlcbiAgICAgIC8vIEZvciBQYXlsb2FkOiBLZWVwIG9yaWdpbmFsIHR5cGVcbiAgICAgIHJlc3VsdFtmaWVsZE5hbWVdID0gdmFsdWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIENhc2UgMjogT2JqZWN0IHdpdGggSUQgcHJvcGVydHlcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAnaWQnIGluIHZhbHVlKSB7XG4gICAgICAvLyBGb3IgQmV0dGVyQXV0aDogRXh0cmFjdCBhbmQgc3RyaW5naWZ5IHRoZSBJRFxuICAgICAgcmVzdWx0W29yaWdpbmFsS2V5XSA9IFN0cmluZyh2YWx1ZS5pZClcbiAgICAgIC8vIEZvciBQYXlsb2FkOiBFeHRyYWN0IElEIGJ1dCBwcmVzZXJ2ZSB0eXBlXG4gICAgICByZXN1bHRbZmllbGROYW1lXSA9IHZhbHVlLmlkXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBDYXNlIDM6IEFycmF5IG9mIElEcyBvciByZWZlcmVuY2VzXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIENoZWNrIGlmIGFycmF5IGNvbnRhaW5zIG9iamVjdHMgd2l0aCBJRCBwcm9wZXJ0aWVzXG4gICAgICBpZiAodmFsdWUuZXZlcnkoKGl0ZW0pID0+IHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiBpdGVtICE9PSBudWxsICYmICdpZCcgaW4gaXRlbSkpIHtcbiAgICAgICAgLy8gQXJyYXkgb2Ygb2JqZWN0cyB3aXRoIElEc1xuICAgICAgICByZXN1bHRbb3JpZ2luYWxLZXldID0gdmFsdWUubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbS5pZCkpXG4gICAgICAgIHJlc3VsdFtmaWVsZE5hbWVdID0gdmFsdWUubWFwKChpdGVtKSA9PiBpdGVtLmlkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgcHJpbWl0aXZlIElEc1xuICAgICAgICByZXN1bHRbb3JpZ2luYWxLZXldID0gdmFsdWUubWFwKChpdGVtKSA9PiBTdHJpbmcoaXRlbSkpXG4gICAgICAgIHJlc3VsdFtmaWVsZE5hbWVdID0gdmFsdWUubWFwKChpdGVtKSA9PiBpdGVtKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gTm90ZTogSWYgdmFsdWUgZG9lc24ndCBtYXRjaCBhbnkgZXhwZWN0ZWQgZm9ybWF0LCBubyBjaGFuZ2VzIGFyZSBtYWRlXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBCZXR0ZXJBdXRoIG9wZXJhdG9yIHRvIHRoZSBlcXVpdmFsZW50IFBheWxvYWQgQ01TIHF1ZXJ5IG9wZXJhdG9yXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gbWFwcyBzdGFuZGFyZCBxdWVyeSBvcGVyYXRvcnMgZnJvbSBCZXR0ZXJBdXRoJ3MgZm9ybWF0IHRvXG4gICAqIHRoZSBzcGVjaWZpYyBmb3JtYXQgZXhwZWN0ZWQgYnkgUGF5bG9hZCBDTVMncyBxdWVyeSBlbmdpbmUuXG4gICAqXG4gICAqIEBwYXJhbSBvcGVyYXRvciAtIFRoZSBCZXR0ZXJBdXRoIG9wZXJhdG9yIHN0cmluZyAoZS5nLiwgJ2VxJywgJ2d0JywgJ2NvbnRhaW5zJylcbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGJlIHVzZWQgd2l0aCB0aGUgb3BlcmF0b3JcbiAgICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggdGhlIFBheWxvYWQtY29tcGF0aWJsZSBvcGVyYXRvciBhbmQgdmFsdWVcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogLy8gUmV0dXJucyB7IGVxdWFsczogJ3Rlc3RAZXhhbXBsZS5jb20nIH1cbiAgICogb3BlcmF0b3JUb1BheWxvYWQoJ2VxJywgJ3Rlc3RAZXhhbXBsZS5jb20nKVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyBSZXR1cm5zIHsgZ3JlYXRlcl90aGFuOiAxMDAgfVxuICAgKiBvcGVyYXRvclRvUGF5bG9hZCgnZ3QnLCAxMDApXG4gICAqL1xuICBmdW5jdGlvbiBvcGVyYXRvclRvUGF5bG9hZChvcGVyYXRvcjogc3RyaW5nLCB2YWx1ZTogYW55KTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgY2FzZSAnZXEnOlxuICAgICAgICByZXR1cm4geyBlcXVhbHM6IHZhbHVlIH1cbiAgICAgIGNhc2UgJ25lJzpcbiAgICAgICAgcmV0dXJuIHsgbm90X2VxdWFsczogdmFsdWUgfVxuICAgICAgY2FzZSAnZ3QnOlxuICAgICAgICByZXR1cm4geyBncmVhdGVyX3RoYW46IHZhbHVlIH1cbiAgICAgIGNhc2UgJ2d0ZSc6XG4gICAgICAgIHJldHVybiB7IGdyZWF0ZXJfdGhhbl9lcXVhbDogdmFsdWUgfVxuICAgICAgY2FzZSAnbHQnOlxuICAgICAgICByZXR1cm4geyBsZXNzX3RoYW46IHZhbHVlIH1cbiAgICAgIGNhc2UgJ2x0ZSc6XG4gICAgICAgIHJldHVybiB7IGxlc3NfdGhhbl9lcXVhbDogdmFsdWUgfVxuICAgICAgY2FzZSAnY29udGFpbnMnOlxuICAgICAgICByZXR1cm4geyBjb250YWluczogdmFsdWUgfVxuICAgICAgY2FzZSAnaW4nOlxuICAgICAgICByZXR1cm4geyBpbjogdmFsdWUgfVxuICAgICAgY2FzZSAnc3RhcnRzX3dpdGgnOlxuICAgICAgICByZXR1cm4geyBsaWtlOiBgJHt2YWx1ZX0lYCB9XG4gICAgICBjYXNlICdlbmRzX3dpdGgnOlxuICAgICAgICByZXR1cm4geyBsaWtlOiBgJSR7dmFsdWV9YCB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBGYWxsIGJhY2sgdG8gZXF1YWxzIGZvciB1bnJlY29nbml6ZWQgb3BlcmF0b3JzXG4gICAgICAgIHJldHVybiB7IGVxdWFsczogdmFsdWUgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHdoZXJlIGNsYXVzZSB2YWx1ZSB0byB0aGUgYXBwcm9wcmlhdGUgdHlwZSBiYXNlZCBvbiBmaWVsZCBuYW1lIGFuZCBJRCB0eXBlIGNvbmZpZ3VyYXRpb25cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBoYW5kbGVzIHR3byBtYWluIHNjZW5hcmlvczpcbiAgICogMS4gSUQgZmllbGQgY29udmVyc2lvbiAtIGVuc3VyZXMgSURzIG1hdGNoIHRoZSBkYXRhYmFzZSdzIGV4cGVjdGVkIHR5cGUgKG51bWJlciBvciBzdHJpbmcpXG4gICAqIDIuIE9iamVjdCB3aXRoIGVtYmVkZGVkIElEIC0gZXh0cmFjdHMgYW5kIGNvbnZlcnRzIHRoZSBJRCBwcm9wZXJ0eSBmcm9tIG9iamVjdHNcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgKGNhbiBiZSBwcmltaXRpdmUsIG9iamVjdCB3aXRoIElELCBvciBhcnJheSlcbiAgICogQHBhcmFtIGZpZWxkTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBmaWVsZCBiZWluZyBxdWVyaWVkXG4gICAqIEBwYXJhbSBpZFR5cGUgLSBUaGUgZXhwZWN0ZWQgSUQgdHlwZSBpbiB0aGUgZGF0YWJhc2VcbiAgICogQHJldHVybnMgVGhlIGNvbnZlcnRlZCB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgdGhlIGRhdGFiYXNlIHF1ZXJ5XG4gICAqL1xuICBmdW5jdGlvbiBjb252ZXJ0V2hlcmVWYWx1ZSh7IHZhbHVlLCBmaWVsZE5hbWUsIGlkVHlwZSB9OiB7IHZhbHVlOiBhbnk7IGZpZWxkTmFtZTogc3RyaW5nOyBpZFR5cGU6ICdudW1iZXInIHwgJ3RleHQnIH0pIHtcbiAgICAvLyBDaGVjayBpZiBmaWVsZCBpcyBhbiBJRCBmaWVsZCAoc3VwcG9ydGluZyBib3RoIE1vbmdvREItc3R5bGUgX2lkIGFuZCBzdGFuZGFyZCBpZClcbiAgICBpZiAoWydpZCcsICdfaWQnXS5pbmNsdWRlcyhmaWVsZE5hbWUpKSB7XG4gICAgICAvLyBDYXNlIDE6IFZhbHVlIGlzIGFuIG9iamVjdCBjb250YWluaW5nIGFuIElEIHByb3BlcnR5XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAnaWQnIGluIHZhbHVlKSB7XG4gICAgICAgIC8vIEV4dHJhY3QgSUQgZnJvbSBvYmplY3RcbiAgICAgICAgY29uc3QgaWQgPSB2YWx1ZS5pZFxuXG4gICAgICAgIC8vIFVzZSB0eXBlIGNvbnZlcnNpb24gYmFzZWQgb24gZGF0YWJhc2UgY29uZmlndXJhdGlvblxuICAgICAgICBpZiAoaWRUeXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgbnVtSWQgPSBOdW1iZXIoaWQpXG4gICAgICAgICAgcmV0dXJuICFpc05hTihudW1JZCkgPyBudW1JZCA6IGlkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaWRUeXBlID09PSAndGV4dCcgJiYgdHlwZW9mIGlkID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHJldHVybiBTdHJpbmcoaWQpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaWRcbiAgICAgIH1cbiAgICAgIC8vIENhc2UgMjogVmFsdWUgaXMgYSBzdGFuZGFsb25lIElEIHRoYXQgbmVlZHMgdHlwZSBjb252ZXJzaW9uXG4gICAgICAvLyBDb252ZXJ0IHN0cmluZyBJRCB0byBudW1iZXIgaWYgZGF0YWJhc2UgZXhwZWN0cyBudW1lcmljIElEc1xuICAgICAgaWYgKGlkVHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhaXNOYU4oTnVtYmVyKHZhbHVlKSkpIHtcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSlcbiAgICAgIH1cbiAgICAgIC8vIENvbnZlcnQgbnVtZXJpYyBJRCB0byBzdHJpbmcgaWYgZGF0YWJhc2UgZXhwZWN0cyB0ZXh0IElEc1xuICAgICAgZWxzZSBpZiAoaWRUeXBlID09PSAndGV4dCcgJiYgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuXG4gICAgLy8gRm9yIG5vbi1JRCBmaWVsZHMsIHJldHVybiB0aGUgdmFsdWUgdW5jaGFuZ2VkXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgQmV0dGVyIEF1dGggd2hlcmUgY2xhdXNlcyB0byBQYXlsb2FkIENNUyBjb21wYXRpYmxlIHdoZXJlIGNvbmRpdGlvbnNcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB0cmFuc2Zvcm1zIHRoZSBCZXR0ZXIgQXV0aCBxdWVyeSBmb3JtYXQgaW50byBQYXlsb2FkJ3MgcXVlcnkgZm9ybWF0LFxuICAgKiBoYW5kbGluZyBmaWVsZCBuYW1lIG1hcHBpbmcsIHZhbHVlIHR5cGUgY29udmVyc2lvbiwgYW5kIGxvZ2ljYWwgb3BlcmF0b3JzIChBTkQvT1IpLlxuICAgKlxuICAgKiBUaGUgZnVuY3Rpb24gaGFuZGxlcyB0aHJlZSBtYWluIGNhc2VzOlxuICAgKiAxLiBFbXB0eSBvciB1bmRlZmluZWQgd2hlcmUgY2xhdXNlIC0gcmV0dXJucyBlbXB0eSBvYmplY3RcbiAgICogMi4gU2luZ2xlIGNvbmRpdGlvbiAtIGNvbnZlcnRzIHRvIGEgc2ltcGxlIGZpZWxkLXZhbHVlIHBhaXJcbiAgICogMy4gTXVsdGlwbGUgY29uZGl0aW9ucyAtIGdyb3VwcyBieSBBTkQvT1IgY29ubmVjdG9ycyBhbmQgYnVpbGRzIGEgY29tcGxleCBxdWVyeVxuICAgKlxuICAgKiBAcGFyYW0gaWRUeXBlIC0gVGhlIGRhdGFiYXNlIElEIHR5cGUgKCdudW1iZXInIG9yICd0ZXh0JylcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIG1vZGVsL2NvbGxlY3Rpb24gbmFtZSB0byBxdWVyeVxuICAgKiBAcGFyYW0gd2hlcmUgLSBBcnJheSBvZiBCZXR0ZXIgQXV0aCB3aGVyZSBjb25kaXRpb25zXG4gICAqIEByZXR1cm5zIEEgUGF5bG9hZC1jb21wYXRpYmxlIHdoZXJlIGNsYXVzZSBvYmplY3RcbiAgICovXG4gIGZ1bmN0aW9uIGNvbnZlcnRXaGVyZUNsYXVzZSh7IGlkVHlwZSwgbW9kZWwsIHdoZXJlIH06IHsgaWRUeXBlOiAnbnVtYmVyJyB8ICd0ZXh0JzsgbW9kZWw6IE1vZGVsS2V5OyB3aGVyZT86IFdoZXJlW10gfSk6IFBheWxvYWRXaGVyZSB7XG4gICAgLy8gSGFuZGxlIGVtcHR5IHdoZXJlIGNsYXVzZVxuICAgIGlmICghd2hlcmUpIHJldHVybiB7fVxuXG4gICAgLy8gSGFuZGxlIHNpbmdsZSBjb25kaXRpb24gY2FzZSBmb3Igb3B0aW1pemF0aW9uXG4gICAgaWYgKHdoZXJlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgdyA9IHdoZXJlWzBdXG4gICAgICBpZiAoIXcpIHtcbiAgICAgICAgcmV0dXJuIHt9XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcCBmaWVsZCBuYW1lIGFjY29yZGluZyB0byBzY2hlbWEgYW5kIGNvbnZlcnQgdmFsdWUgdG8gYXBwcm9wcmlhdGUgdHlwZVxuICAgICAgY29uc3QgZmllbGROYW1lID0gZ2V0RmllbGROYW1lKG1vZGVsLCB3LmZpZWxkKVxuICAgICAgY29uc3QgdmFsdWUgPSBjb252ZXJ0V2hlcmVWYWx1ZSh7XG4gICAgICAgIHZhbHVlOiB3LnZhbHVlLFxuICAgICAgICBmaWVsZE5hbWUsXG4gICAgICAgIGlkVHlwZVxuICAgICAgfSlcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBQYXlsb2FkIHdoZXJlIGNvbmRpdGlvbiB3aXRoIHByb3BlciBvcGVyYXRvclxuICAgICAgY29uc3QgcmVzID0ge1xuICAgICAgICBbZmllbGROYW1lXTogb3BlcmF0b3JUb1BheWxvYWQody5vcGVyYXRvciA/PyAnJywgdmFsdWUpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgbXVsdGlwbGUgY29uZGl0aW9ucyBieSBzZXBhcmF0aW5nIEFORC9PUiBjbGF1c2VzXG4gICAgLy8gRGVmYXVsdCB0byBBTkQgaWYgbm8gY29ubmVjdG9yIGlzIHNwZWNpZmllZFxuICAgIGNvbnN0IGFuZCA9IHdoZXJlLmZpbHRlcigodykgPT4gdy5jb25uZWN0b3IgPT09ICdBTkQnIHx8ICF3LmNvbm5lY3RvcilcbiAgICBjb25zdCBvciA9IHdoZXJlLmZpbHRlcigodykgPT4gdy5jb25uZWN0b3IgPT09ICdPUicpXG5cbiAgICAvLyBQcm9jZXNzIEFORCBjb25kaXRpb25zXG4gICAgY29uc3QgYW5kQ2xhdXNlID0gYW5kLm1hcCgodykgPT4ge1xuICAgICAgY29uc3QgZmllbGROYW1lID0gZ2V0RmllbGROYW1lKG1vZGVsLCB3LmZpZWxkKVxuICAgICAgY29uc3QgdmFsdWUgPSBjb252ZXJ0V2hlcmVWYWx1ZSh7XG4gICAgICAgIHZhbHVlOiB3LnZhbHVlLFxuICAgICAgICBmaWVsZE5hbWUsXG4gICAgICAgIGlkVHlwZVxuICAgICAgfSlcbiAgICAgIHJldHVybiB7XG4gICAgICAgIFtmaWVsZE5hbWVdOiBvcGVyYXRvclRvUGF5bG9hZCh3Lm9wZXJhdG9yID8/ICcnLCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gUHJvY2VzcyBPUiBjb25kaXRpb25zXG4gICAgY29uc3Qgb3JDbGF1c2UgPSBvci5tYXAoKHcpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGdldEZpZWxkTmFtZShtb2RlbCwgdy5maWVsZClcbiAgICAgIGNvbnN0IHZhbHVlID0gY29udmVydFdoZXJlVmFsdWUoe1xuICAgICAgICB2YWx1ZTogdy52YWx1ZSxcbiAgICAgICAgZmllbGROYW1lLFxuICAgICAgICBpZFR5cGVcbiAgICAgIH0pXG4gICAgICByZXR1cm4ge1xuICAgICAgICBbZmllbGROYW1lXTogb3BlcmF0b3JUb1BheWxvYWQody5vcGVyYXRvciA/PyAnJywgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENvbWJpbmUgQU5EIGFuZCBPUiBjbGF1c2VzIGludG8gZmluYWwgUGF5bG9hZCB3aGVyZSBvYmplY3RcbiAgICAvLyBPbmx5IGluY2x1ZGUgbm9uLWVtcHR5IGNsYXVzZSBhcnJheXNcbiAgICByZXR1cm4ge1xuICAgICAgLi4uKGFuZENsYXVzZS5sZW5ndGggPyB7IEFORDogYW5kQ2xhdXNlIH0gOiB7fSksXG4gICAgICAuLi4ob3JDbGF1c2UubGVuZ3RoID8geyBPUjogb3JDbGF1c2UgfSA6IHt9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGJldHRlci1hdXRoIHNlbGVjdCBhcnJheSB0byBhIFBheWxvYWQgc2VsZWN0IG9iamVjdFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHRyYW5zZm9ybXMgdGhlIGJldHRlci1hdXRoIHNlbGVjdCBhcnJheSAod2hpY2ggY29udGFpbnMgZmllbGQgbmFtZXMpXG4gICAqIGludG8gdGhlIGZvcm1hdCBleHBlY3RlZCBieSBQYXlsb2FkIENNUydzIHF1ZXJ5IEFQSSAoYW4gb2JqZWN0IHdpdGggZmllbGQgbmFtZXMgYXMga2V5c1xuICAgKiBhbmQgYm9vbGVhbiB0cnVlIGFzIHZhbHVlcykuXG4gICAqXG4gICAqIEl0IGFsc28gaGFuZGxlcyBmaWVsZCBuYW1lIG1hcHBpbmcgYmV0d2VlbiBiZXR0ZXItYXV0aCBzY2hlbWEgYW5kIFBheWxvYWQgY29sbGVjdGlvbnNcbiAgICogYnkgdXNpbmcgdGhlIGdldEZpZWxkTmFtZSBoZWxwZXIgdG8gcmVzb2x2ZSB0aGUgY29ycmVjdCBmaWVsZCBuYW1lcy5cbiAgICpcbiAgICogQHBhcmFtIG1vZGVsIC0gVGhlIG1vZGVsL2NvbGxlY3Rpb24gbmFtZSB0byBnZXQgZmllbGQgbWFwcGluZ3MgZnJvbVxuICAgKiBAcGFyYW0gc2VsZWN0IC0gT3B0aW9uYWwgYXJyYXkgb2YgZmllbGQgbmFtZXMgdG8gc2VsZWN0XG4gICAqIEByZXR1cm5zIEEgUGF5bG9hZC1jb21wYXRpYmxlIHNlbGVjdCBvYmplY3Qgb3IgdW5kZWZpbmVkIGlmIG5vIGZpZWxkcyB0byBzZWxlY3RcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSW5wdXQ6IFsnZW1haWwnLCAnbmFtZSddXG4gICAqIC8vIE91dHB1dDogeyBlbWFpbDogdHJ1ZSwgbmFtZTogdHJ1ZSB9XG4gICAqL1xuICBmdW5jdGlvbiBjb252ZXJ0U2VsZWN0KG1vZGVsOiBNb2RlbEtleSwgc2VsZWN0Pzogc3RyaW5nW10pIHtcbiAgICAvLyBSZXR1cm4gdW5kZWZpbmVkIGlmIHNlbGVjdCBpcyBlbXB0eSBvciBub3QgcHJvdmlkZWRcbiAgICBpZiAoIXNlbGVjdCB8fCBzZWxlY3QubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGFycmF5IG9mIGZpZWxkIG5hbWVzIGludG8gYSBQYXlsb2FkIHNlbGVjdCBvYmplY3RcbiAgICAvLyB3aGlsZSBhbHNvIG1hcHBpbmcgYW55IGZpZWxkIG5hbWVzIHRoYXQgbWlnaHQgYmUgZGlmZmVyZW50IGluIFBheWxvYWRcbiAgICByZXR1cm4gc2VsZWN0LnJlZHVjZSgoYWNjLCBmaWVsZCkgPT4gKHsgLi4uYWNjLCBbZ2V0RmllbGROYW1lKG1vZGVsLCBmaWVsZCldOiB0cnVlIH0pLCB7fSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGJldHRlci1hdXRoIHNvcnQgb2JqZWN0IHRvIGEgUGF5bG9hZCBzb3J0IHN0cmluZ1xuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHRyYW5zZm9ybXMgdGhlIGJldHRlci1hdXRoIHNvcnQgb2JqZWN0ICh3aGljaCBjb250YWlucyBmaWVsZCBuYW1lIGFuZCBkaXJlY3Rpb24pXG4gICAqIGludG8gdGhlIGZvcm1hdCBleHBlY3RlZCBieSBQYXlsb2FkIENNUydzIHF1ZXJ5IEFQSSAoYSBzdHJpbmcgd2l0aCBvcHRpb25hbCAnLScgcHJlZml4IGZvciBkZXNjZW5kaW5nIG9yZGVyKS5cbiAgICpcbiAgICogSXQgYWxzbyBoYW5kbGVzIGZpZWxkIG5hbWUgbWFwcGluZyBiZXR3ZWVuIGJldHRlci1hdXRoIHNjaGVtYSBhbmQgUGF5bG9hZCBjb2xsZWN0aW9uc1xuICAgKiBieSB1c2luZyB0aGUgZ2V0RmllbGROYW1lIGhlbHBlciB0byByZXNvbHZlIHRoZSBjb3JyZWN0IGZpZWxkIG5hbWVzLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwvY29sbGVjdGlvbiBuYW1lIHRvIGdldCBmaWVsZCBtYXBwaW5ncyBmcm9tXG4gICAqIEBwYXJhbSBzb3J0QnkgLSBPcHRpb25hbCBvYmplY3QgY29udGFpbmluZyBmaWVsZCBuYW1lIGFuZCBzb3J0IGRpcmVjdGlvblxuICAgKiBAcmV0dXJucyBBIFBheWxvYWQtY29tcGF0aWJsZSBzb3J0IHN0cmluZyBvciB1bmRlZmluZWQgaWYgbm8gc29ydCBzcGVjaWZpZWRcbiAgICogQGV4YW1wbGVcbiAgICogLy8gSW5wdXQ6IHsgZmllbGQ6ICdlbWFpbCcsIGRpcmVjdGlvbjogJ2Rlc2MnIH1cbiAgICogLy8gT3V0cHV0OiAnLWVtYWlsJ1xuICAgKiAvLyBJbnB1dDogeyBmaWVsZDogJ2NyZWF0ZWRBdCcsIGRpcmVjdGlvbjogJ2FzYycgfVxuICAgKiAvLyBPdXRwdXQ6ICdjcmVhdGVkQXQnXG4gICAqL1xuICBmdW5jdGlvbiBjb252ZXJ0U29ydChtb2RlbDogTW9kZWxLZXksIHNvcnRCeT86IHsgZmllbGQ6IHN0cmluZzsgZGlyZWN0aW9uOiAnYXNjJyB8ICdkZXNjJyB9KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIXNvcnRCeSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZpZWxkTmFtZSA9IGdldEZpZWxkTmFtZShtb2RlbCwgc29ydEJ5LmZpZWxkKVxuICAgIGNvbnN0IHByZWZpeCA9IHNvcnRCeS5kaXJlY3Rpb24gPT09ICdkZXNjJyA/ICctJyA6ICcnXG4gICAgcmV0dXJuIGAke3ByZWZpeH0ke2ZpZWxkTmFtZX1gXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldEZpZWxkTmFtZSxcbiAgICBnZXRDb2xsZWN0aW9uU2x1ZyxcbiAgICBzaW5nbGVJZFF1ZXJ5LFxuICAgIHRyYW5zZm9ybUlucHV0LFxuICAgIHRyYW5zZm9ybU91dHB1dCxcbiAgICBjb252ZXJ0V2hlcmVDbGF1c2UsXG4gICAgY29udmVydFNlbGVjdCxcbiAgICBjb252ZXJ0U29ydFxuICB9XG59XG4iXSwibmFtZXMiOlsiZ2V0QXV0aFRhYmxlcyIsImNyZWF0ZVRyYW5zZm9ybSIsIm9wdGlvbnMiLCJlbmFibGVEZWJ1Z0xvZ3MiLCJzY2hlbWEiLCJkZWJ1Z0xvZyIsIm1lc3NhZ2UiLCJjb25zb2xlIiwibG9nIiwiZ2V0Q29sbGVjdGlvblNsdWciLCJtb2RlbCIsImNvbGxlY3Rpb24iLCJtb2RlbE5hbWUiLCJyZXNvbHZlZFNsdWciLCJnZXRGaWVsZE5hbWUiLCJmaWVsZCIsImluY2x1ZGVzIiwiZmllbGREZWZpbml0aW9uIiwiZmllbGRzIiwiZmllbGROYW1lIiwib3JpZ2luYWxGaWVsZCIsImlzUmVsYXRpb25zaGlwRmllbGQiLCJmaWVsZEtleSIsInNjaGVtYUZpZWxkcyIsInJlZmVyZW5jZXMiLCJ1bmRlZmluZWQiLCJzaW5nbGVJZFF1ZXJ5Iiwid2hlcmUiLCJzb21lIiwiaWRGaWVsZCIsImNvbmRpdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsInZhbHVlIiwiZXF1YWxzIiwiY29udGFpbnMiLCJsZW5ndGgiLCJub3JtYWxpemVEYXRhIiwia2V5IiwiaXNSZWxhdGVkRmllbGQiLCJpZFR5cGUiLCJwYXJzZWQiLCJwYXJzZUludCIsImlzTmFOIiwib3JpZ2luYWwiLCJjb252ZXJ0ZWQiLCJzdHJpbmdJZCIsIlN0cmluZyIsIm1hcCIsImlkIiwidHJhbnNmb3JtSW5wdXQiLCJkYXRhIiwidHJhbnNmb3JtZWREYXRhIiwiT2JqZWN0IiwiZW50cmllcyIsImZvckVhY2giLCJzY2hlbWFGaWVsZE5hbWUiLCJub3JtYWxpemVkRGF0YSIsInRhcmdldEZpZWxkTmFtZSIsInRyYW5zZm9ybU91dHB1dCIsImRvYyIsInJlc3VsdCIsInJlbGF0aW9uc2hpcEZpZWxkcyIsImZyb21FbnRyaWVzIiwiZmlsdGVyIiwiZGF0ZUZpZWxkcyIsIl8iLCJ0eXBlIiwib3JpZ2luYWxSZWxhdGVkRmllbGRLZXkiLCJrZXlzIiwiZmluZCIsImsiLCJub3JtYWxpemVEb2N1bWVudElkcyIsIm9yaWdpbmFsRGF0ZUZpZWxkS2V5IiwiRGF0ZSIsIm9yaWdpbmFsS2V5IiwiZXZlcnkiLCJpdGVtIiwib3BlcmF0b3JUb1BheWxvYWQiLCJvcGVyYXRvciIsIm5vdF9lcXVhbHMiLCJncmVhdGVyX3RoYW4iLCJncmVhdGVyX3RoYW5fZXF1YWwiLCJsZXNzX3RoYW4iLCJsZXNzX3RoYW5fZXF1YWwiLCJpbiIsImxpa2UiLCJjb252ZXJ0V2hlcmVWYWx1ZSIsIm51bUlkIiwiTnVtYmVyIiwiY29udmVydFdoZXJlQ2xhdXNlIiwidyIsInJlcyIsImFuZCIsImNvbm5lY3RvciIsIm9yIiwiYW5kQ2xhdXNlIiwib3JDbGF1c2UiLCJBTkQiLCJPUiIsImNvbnZlcnRTZWxlY3QiLCJzZWxlY3QiLCJyZWR1Y2UiLCJhY2MiLCJjb252ZXJ0U29ydCIsInNvcnRCeSIsInByZWZpeCIsImRpcmVjdGlvbiJdLCJtYXBwaW5ncyI6IkFBR0EsU0FBeUJBLGFBQWEsUUFBUSxpQkFBZ0I7QUFHOUQsT0FBTyxNQUFNQyxrQkFBa0IsQ0FBQ0MsU0FBNEJDO0lBQzFELE1BQU1DLFNBQVNKLGNBQWNFO0lBRTdCLFNBQVNHLFNBQVNDLE9BQWM7UUFDOUIsSUFBSUgsaUJBQWlCO1lBQ25CSSxRQUFRQyxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLRjtRQUN6QztJQUNGO0lBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5QkMsR0FDRCxTQUFTRyxrQkFBa0JDLEtBQWU7UUFDeEMsNkZBQTZGO1FBQzdGLE1BQU1DLGFBQWFQLFFBQVEsQ0FBQ00sTUFBTSxFQUFFRSxhQUFhRjtRQUNqREwsU0FBUztZQUFDO1lBQXNCO2dCQUFFSztnQkFBT0csY0FBY0Y7WUFBVztTQUFFO1FBQ3BFLE9BQU9BO0lBQ1Q7SUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkMsR0FDRCxTQUFTRyxhQUFhSixLQUFlLEVBQUVLLEtBQWE7UUFDbEQsd0RBQXdEO1FBQ3hELElBQUk7WUFBQztZQUFNO1NBQU0sQ0FBQ0MsUUFBUSxDQUFDRCxRQUFRO1lBQ2pDLE9BQU9BO1FBQ1Q7UUFFQSxrQ0FBa0M7UUFDbEMsTUFBTUUsa0JBQWtCYixNQUFNLENBQUNNLE1BQU0sRUFBRVEsTUFBTSxDQUFDSCxNQUFNO1FBRXBELDZFQUE2RTtRQUM3RSxNQUFNSSxZQUFZRixpQkFBaUJFLGFBQWFKO1FBRWhELHlDQUF5QztRQUN6Q1YsU0FBUztZQUFDO1lBQWM7Z0JBQUVLO2dCQUFPVSxlQUFlTDtnQkFBT0k7WUFBVTtTQUFFO1FBRW5FLE9B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