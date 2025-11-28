/**
 * This module generates PayloadCMS collection configurations based on the Better Auth schema.
 *
 * The generated collection configs include:
 * - Users: For user management with proper auth configuration
 * - Sessions: For maintaining user sessions
 * - Accounts: For OAuth provider accounts
 * - VerificationTokens: For email verification or social sign in
 *
 * Each collection is properly formatted with:
 * - Appropriate field types (text, relationship, checkbox, etc.)
 * - Admin configuration for better UI experience
 * - Auth configuration for the Users collection
 * - Proper field relationships between collections
 *
 * Users can copy these generated collection configs to their PayloadCMS project
 * and add authentication strategies as needed.
 */ import { getAuthTables } from "better-auth/db";
import { format } from "prettier";
export const generateSchemaBuilderStage = async ({ BAOptions, code })=>{
    const formattedCode = await format(code, {
        filepath: 'schema.ts'
    });
    const { post, collections } = parseExistingSchema(formattedCode);
    const payloadSchemaStr = generatePayloadCollectionConfigs({
        options: BAOptions,
        collections,
        exports: post
    });
    return await format(`${payloadSchemaStr}`, {
        filepath: 'schema.ts'
    });
};
function parseExistingSchema(code) {
    const collections = [];
    let post = '';
    // Extract collection definitions
    const collectionRegex = /const\s+([A-Z][a-zA-Z0-9]*)\s*:\s*CollectionConfig\s*=\s*{[\s\S]*?}\s*as\s*const;/g;
    let match;
    while((match = collectionRegex.exec(code)) !== null){
        const collectionName = match[1];
        const collectionDef = match[0];
        // Extract slug
        const slugMatch = collectionDef.match(/slug:\s*"([^"]+)"/);
        const slug = slugMatch ? slugMatch[1] : collectionName.toLowerCase();
        // Extract useAsTitle
        const titleMatch = collectionDef.match(/useAsTitle:\s*"([^"]+)"/);
        const useAsTitle = titleMatch ? titleMatch[1] : 'id';
        // Extract fields
        const fieldsRegex = /fields:\s*\[([\s\S]*?)\],/;
        const fieldsMatch = collectionDef.match(fieldsRegex);
        const fields = [];
        if (fieldsMatch) {
            const fieldBlockRegex = /{[\s\S]*?},/g;
            const fieldBlocks = fieldsMatch[1].match(fieldBlockRegex) || [];
            for (const fieldBlock of fieldBlocks){
                const nameMatch = fieldBlock.match(/name:\s*"([^"]+)"/);
                const typeMatch = fieldBlock.match(/type:\s*"([^"]+)"/);
                const requiredMatch = fieldBlock.match(/required:\s*(true|false)/);
                const uniqueMatch = fieldBlock.match(/unique:\s*(true|false)/);
                const relationToMatch = fieldBlock.match(/relationTo:\s*"([^"]+)"/);
                if (nameMatch && typeMatch) {
                    const field = {
                        name: nameMatch[1],
                        type: typeMatch[1]
                    };
                    if (requiredMatch) {
                        ;
                        field.required = requiredMatch[1] === 'true';
                    }
                    if (uniqueMatch) {
                        ;
                        field.unique = uniqueMatch[1] === 'true';
                    }
                    if (relationToMatch) {
                        ;
                        field.relationTo = relationToMatch[1];
                    }
                    fields.push(field);
                }
            }
        }
        // Check for timestamps
        const timestampsMatch = collectionDef.match(/timestamps:\s*(true|false)/);
        const hasTimestamps = timestampsMatch ? timestampsMatch[1] === 'true' : false;
        collections.push({
            slug,
            admin: {
                useAsTitle
            },
            fields,
            ...hasTimestamps && {
                timestamps: true
            }
        });
    }
    // Extract export statement
    const exportRegex = /export\s*{[\s\S]*?};/;
    const exportMatch = code.match(exportRegex);
    if (exportMatch) {
        post = exportMatch[0];
    }
    return {
        collections,
        post
    };
}
function generatePayloadCollectionConfigs({ options, collections, exports }) {
    let result = '';
    // add pre message and import statements
    result += `/**
 * EXAMPLE COLLECTIONS FOR BETTER AUTH
 * 
 * Below is what your Payload collections should look like.
 * Please copy these to your actual collection configs.
 * Make sure to add an authStrategy for the users collection if there is one.
 * 
 * Example auth strategy:
 * auth: {
 *   disableLocalStrategy: true,
 *   strategies: [
 *     betterAuthStrategy(),
 *     // Add other strategies as needed
 *   ],
 * },
 */
import type { CollectionConfig } from 'payload';

`;
    // add the collections
    let collectionsStr = '';
    const tables = getAuthTables(options);
    // Process existing collections first
    const existingCollectionsBySlug = collections.reduce((acc, collection)=>{
        if (collection.slug) {
            acc[collection.slug] = collection;
        }
        return acc;
    }, {});
    for (const [tableKey, table] of Object.entries(tables)){
        const modelName = table.modelName;
        const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);
        // Check if this collection already exists in the provided collections
        const existingCollection = existingCollectionsBySlug[modelName];
        if (existingCollection) {
            // Convert existing collection to string representation
            collectionsStr += `const ${capitalized}: CollectionConfig = ${JSON.stringify(existingCollection, null, 2).replace(/"([^"]+)":/g, '$1:')} as const;\n\n`;
            continue;
        }
        // Create new collection if it doesn't exist
        collectionsStr += `const ${capitalized}: CollectionConfig = {
  slug: "${modelName}",
`;
        // Add admin section for better UX
        collectionsStr += `  admin: {
    useAsTitle: "${getNameField(table.fields)}",
  },
`;
        // Add auth section ONLY for users collection
        if (modelName === 'users') {
            collectionsStr += `  auth: {
    disableLocalStrategy: true,
    strategies: [],
    // Add your auth strategies here if needed
  },
`;
        }
        // Add fields
        collectionsStr += `  fields: [
`;
        for (const [fieldKey, field] of Object.entries(table.fields)){
            const fieldName = field.fieldName || fieldKey;
            // Skip id field as Payload handles it automatically
            if (fieldName === 'id') continue;
            if (fieldName === 'createdAt' || fieldName === 'updatedAt') continue;
            // Handle field type mapping with safer type approach
            let fieldType = mapFieldType(field.type, fieldName);
            const isRelationship = fieldName.endsWith('_id') || !!field.references?.model;
            collectionsStr += `    {
      name: "${isRelationship ? fieldName.replace('_id', '') : fieldName}",
`;
            if (isRelationship) {
                collectionsStr += `      type: "relationship",
      relationTo: "${field.references?.model || fieldName.replace('_id', '')}",
`;
            } else if (fieldType === 'upload') {
                collectionsStr += `      type: "upload",
      relationTo: "media",
`;
            } else {
                collectionsStr += `      type: "${fieldType}",
`;
            }
            if (field.required) {
                collectionsStr += `      required: true,
`;
            }
            if (field.unique) {
                collectionsStr += `      unique: true,
`;
            }
            // Check if field has options and fieldType is select
            if (fieldType === 'select' && 'options' in field && Array.isArray(field.options)) {
                collectionsStr += `      options: ${JSON.stringify(field.options)},
`;
            }
            if (field.defaultValue !== undefined) {
                if (typeof field.defaultValue === 'string') {
                    collectionsStr += `      defaultValue: "${field.defaultValue}",
`;
                } else if (typeof field.defaultValue === 'boolean') {
                    collectionsStr += `      defaultValue: ${field.defaultValue ? 'true' : 'false'},
`;
                } else if (field.defaultValue && typeof field.defaultValue === 'function' && field.defaultValue.toString().includes('() => !1')) {
                    // Handle function-like default values with are false
                    collectionsStr += `      defaultValue: false,
`;
                } else if (field.defaultValue && typeof field.defaultValue === 'function' && field.defaultValue.toString().includes('() => !0')) {
                    // Handle function-like default values with are true
                    collectionsStr += `      defaultValue: true,
`;
                } else {
                    collectionsStr += `      defaultValue: ${field.defaultValue},
`;
                }
            }
            // Add admin section for fields if needed - safely check for admin property
            if ('admin' in field && field.admin && typeof field.admin === 'object' && 'readOnly' in field.admin && field.admin.readOnly) {
                collectionsStr += `      admin: {
        readOnly: true,
      },
`;
            }
            collectionsStr += `    },
`;
        }
        collectionsStr += `  ],
  timestamps: true,
} as const;

`;
    }
    // Add any collections from the input that aren't in the tables
    for (const collection of collections){
        if (!collection.slug || tables[collection.slug]) {
            continue; // Skip if no slug or already processed
        }
        const capitalized = collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1);
        collectionsStr += `const ${capitalized}: CollectionConfig = ${JSON.stringify(collection, null, 2).replace(/"([^"]+)":/g, '$1:')} as const;\n\n`;
    }
    result += collectionsStr;
    // Add export statements for all collections
    // Check if we have an existing export statement to adapt
    if (exports && exports.trim()) {
        // Parse the existing exports to get collection names
        const existingExportMatch = exports.match(/export\s*{\s*(.*?)\s*}/);
        const existingCollections = existingExportMatch ? existingExportMatch[1].split(',').map((name)=>name.trim()) : [];
        // Get the collection names from our tables
        const tableCollections = Object.keys(tables).map((model)=>{
            return model.charAt(0).toUpperCase() + model.slice(1);
        });
        // Combine existing and new collections, removing duplicates
        const allCollections = [
            ...new Set([
                ...existingCollections,
                ...tableCollections
            ])
        ];
        // Create the new export statement
        result += `export { ${allCollections.join(', ')} };
`;
    } else if (Object.keys(tables).length > 0) {
        const collectionNames = Object.keys(tables).map((model)=>{
            // Convert model name to PascalCase for export
            const pascalCase = model.charAt(0).toUpperCase() + model.slice(1);
            return pascalCase;
        });
        result += `export { ${collectionNames.join(', ')} };
`;
    } else {
        result += `export {};
`;
    }
    return result;
}
// Helper functions
function mapFieldType(type, fieldName) {
    if (fieldName.endsWith('_id')) return 'relationship';
    switch(type){
        case 'boolean':
            return 'checkbox';
        case 'number':
            return 'number';
        case 'string':
            if (fieldName === 'email') return 'email';
            if (fieldName.includes('password')) return 'text';
            if (fieldName.includes('image') || fieldName.includes('avatar')) return 'upload';
            return 'text';
        case 'date':
            return 'date';
        case 'array':
            return 'array';
        default:
            return 'text';
    }
}
function getNameField(fields) {
    // Try to find an appropriate field to use as title
    const nameOptions = [
        'name',
        'title',
        'label',
        'email',
        'username'
    ];
    for (const option of nameOptions){
        if (Object.keys(fields).includes(option)) {
            return option;
        }
    }
    // Default to first field that's not id
    const firstNonIdField = Object.keys(fields).find((k)=>k !== 'id');
    return firstNonIdField || 'id';
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9hZGFwdGVyL2dlbmVyYXRlLXNjaGVtYS9nZW5lcmF0ZS1zY2hlbWEtYnVpbGRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgbW9kdWxlIGdlbmVyYXRlcyBQYXlsb2FkQ01TIGNvbGxlY3Rpb24gY29uZmlndXJhdGlvbnMgYmFzZWQgb24gdGhlIEJldHRlciBBdXRoIHNjaGVtYS5cbiAqXG4gKiBUaGUgZ2VuZXJhdGVkIGNvbGxlY3Rpb24gY29uZmlncyBpbmNsdWRlOlxuICogLSBVc2VyczogRm9yIHVzZXIgbWFuYWdlbWVudCB3aXRoIHByb3BlciBhdXRoIGNvbmZpZ3VyYXRpb25cbiAqIC0gU2Vzc2lvbnM6IEZvciBtYWludGFpbmluZyB1c2VyIHNlc3Npb25zXG4gKiAtIEFjY291bnRzOiBGb3IgT0F1dGggcHJvdmlkZXIgYWNjb3VudHNcbiAqIC0gVmVyaWZpY2F0aW9uVG9rZW5zOiBGb3IgZW1haWwgdmVyaWZpY2F0aW9uIG9yIHNvY2lhbCBzaWduIGluXG4gKlxuICogRWFjaCBjb2xsZWN0aW9uIGlzIHByb3Blcmx5IGZvcm1hdHRlZCB3aXRoOlxuICogLSBBcHByb3ByaWF0ZSBmaWVsZCB0eXBlcyAodGV4dCwgcmVsYXRpb25zaGlwLCBjaGVja2JveCwgZXRjLilcbiAqIC0gQWRtaW4gY29uZmlndXJhdGlvbiBmb3IgYmV0dGVyIFVJIGV4cGVyaWVuY2VcbiAqIC0gQXV0aCBjb25maWd1cmF0aW9uIGZvciB0aGUgVXNlcnMgY29sbGVjdGlvblxuICogLSBQcm9wZXIgZmllbGQgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIGNvbGxlY3Rpb25zXG4gKlxuICogVXNlcnMgY2FuIGNvcHkgdGhlc2UgZ2VuZXJhdGVkIGNvbGxlY3Rpb24gY29uZmlncyB0byB0aGVpciBQYXlsb2FkQ01TIHByb2plY3RcbiAqIGFuZCBhZGQgYXV0aGVudGljYXRpb24gc3RyYXRlZ2llcyBhcyBuZWVkZWQuXG4gKi9cbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aE9wdGlvbnMgfSBmcm9tICdiZXR0ZXItYXV0aCdcbmltcG9ydCB7IGdldEF1dGhUYWJsZXMgfSBmcm9tICdiZXR0ZXItYXV0aC9kYidcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZywgRmllbGQgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAncHJldHRpZXInXG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVNjaGVtYUJ1aWxkZXJTdGFnZSA9IGFzeW5jICh7IEJBT3B0aW9ucywgY29kZSB9OiB7IGNvZGU6IHN0cmluZzsgQkFPcHRpb25zOiBCZXR0ZXJBdXRoT3B0aW9ucyB9KSA9PiB7XG4gIGNvbnN0IGZvcm1hdHRlZENvZGUgPSBhd2FpdCBmb3JtYXQoY29kZSwgeyBmaWxlcGF0aDogJ3NjaGVtYS50cycgfSlcblxuICBjb25zdCB7IHBvc3QsIGNvbGxlY3Rpb25zIH0gPSBwYXJzZUV4aXN0aW5nU2NoZW1hKGZvcm1hdHRlZENvZGUpXG5cbiAgY29uc3QgcGF5bG9hZFNjaGVtYVN0ciA9IGdlbmVyYXRlUGF5bG9hZENvbGxlY3Rpb25Db25maWdzKHtcbiAgICBvcHRpb25zOiBCQU9wdGlvbnMsXG4gICAgY29sbGVjdGlvbnMsXG4gICAgZXhwb3J0czogcG9zdFxuICB9KVxuXG4gIHJldHVybiBhd2FpdCBmb3JtYXQoYCR7cGF5bG9hZFNjaGVtYVN0cn1gLCB7XG4gICAgZmlsZXBhdGg6ICdzY2hlbWEudHMnXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHBhcnNlRXhpc3RpbmdTY2hlbWEoY29kZTogc3RyaW5nKToge1xuICBjb2xsZWN0aW9uczogQ29sbGVjdGlvbkNvbmZpZ1tdXG4gIHBvc3Q6IHN0cmluZ1xufSB7XG4gIGNvbnN0IGNvbGxlY3Rpb25zOiBDb2xsZWN0aW9uQ29uZmlnW10gPSBbXVxuICBsZXQgcG9zdCA9ICcnXG5cbiAgLy8gRXh0cmFjdCBjb2xsZWN0aW9uIGRlZmluaXRpb25zXG4gIGNvbnN0IGNvbGxlY3Rpb25SZWdleCA9IC9jb25zdFxccysoW0EtWl1bYS16QS1aMC05XSopXFxzKjpcXHMqQ29sbGVjdGlvbkNvbmZpZ1xccyo9XFxzKntbXFxzXFxTXSo/fVxccyphc1xccypjb25zdDsvZ1xuICBsZXQgbWF0Y2hcbiAgd2hpbGUgKChtYXRjaCA9IGNvbGxlY3Rpb25SZWdleC5leGVjKGNvZGUpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lID0gbWF0Y2hbMV1cbiAgICBjb25zdCBjb2xsZWN0aW9uRGVmID0gbWF0Y2hbMF1cblxuICAgIC8vIEV4dHJhY3Qgc2x1Z1xuICAgIGNvbnN0IHNsdWdNYXRjaCA9IGNvbGxlY3Rpb25EZWYubWF0Y2goL3NsdWc6XFxzKlwiKFteXCJdKylcIi8pXG4gICAgY29uc3Qgc2x1ZyA9IHNsdWdNYXRjaCA/IHNsdWdNYXRjaFsxXSA6IGNvbGxlY3Rpb25OYW1lLnRvTG93ZXJDYXNlKClcblxuICAgIC8vIEV4dHJhY3QgdXNlQXNUaXRsZVxuICAgIGNvbnN0IHRpdGxlTWF0Y2ggPSBjb2xsZWN0aW9uRGVmLm1hdGNoKC91c2VBc1RpdGxlOlxccypcIihbXlwiXSspXCIvKVxuICAgIGNvbnN0IHVzZUFzVGl0bGUgPSB0aXRsZU1hdGNoID8gdGl0bGVNYXRjaFsxXSA6ICdpZCdcblxuICAgIC8vIEV4dHJhY3QgZmllbGRzXG4gICAgY29uc3QgZmllbGRzUmVnZXggPSAvZmllbGRzOlxccypcXFsoW1xcc1xcU10qPylcXF0sL1xuICAgIGNvbnN0IGZpZWxkc01hdGNoID0gY29sbGVjdGlvbkRlZi5tYXRjaChmaWVsZHNSZWdleClcbiAgICBjb25zdCBmaWVsZHM6IEZpZWxkW10gPSBbXVxuXG4gICAgaWYgKGZpZWxkc01hdGNoKSB7XG4gICAgICBjb25zdCBmaWVsZEJsb2NrUmVnZXggPSAve1tcXHNcXFNdKj99LC9nXG4gICAgICBjb25zdCBmaWVsZEJsb2NrcyA9IGZpZWxkc01hdGNoWzFdLm1hdGNoKGZpZWxkQmxvY2tSZWdleCkgfHwgW11cblxuICAgICAgZm9yIChjb25zdCBmaWVsZEJsb2NrIG9mIGZpZWxkQmxvY2tzKSB7XG4gICAgICAgIGNvbnN0IG5hbWVNYXRjaCA9IGZpZWxkQmxvY2subWF0Y2goL25hbWU6XFxzKlwiKFteXCJdKylcIi8pXG4gICAgICAgIGNvbnN0IHR5cGVNYXRjaCA9IGZpZWxkQmxvY2subWF0Y2goL3R5cGU6XFxzKlwiKFteXCJdKylcIi8pXG4gICAgICAgIGNvbnN0IHJlcXVpcmVkTWF0Y2ggPSBmaWVsZEJsb2NrLm1hdGNoKC9yZXF1aXJlZDpcXHMqKHRydWV8ZmFsc2UpLylcbiAgICAgICAgY29uc3QgdW5pcXVlTWF0Y2ggPSBmaWVsZEJsb2NrLm1hdGNoKC91bmlxdWU6XFxzKih0cnVlfGZhbHNlKS8pXG4gICAgICAgIGNvbnN0IHJlbGF0aW9uVG9NYXRjaCA9IGZpZWxkQmxvY2subWF0Y2goL3JlbGF0aW9uVG86XFxzKlwiKFteXCJdKylcIi8pXG5cbiAgICAgICAgaWYgKG5hbWVNYXRjaCAmJiB0eXBlTWF0Y2gpIHtcbiAgICAgICAgICBjb25zdCBmaWVsZCA9IHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWVNYXRjaFsxXSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGVNYXRjaFsxXSBhcyBGaWVsZFsndHlwZSddXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlcXVpcmVkTWF0Y2gpIHtcbiAgICAgICAgICAgIDsoZmllbGQgYXMgYW55KS5yZXF1aXJlZCA9IHJlcXVpcmVkTWF0Y2hbMV0gPT09ICd0cnVlJ1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1bmlxdWVNYXRjaCkge1xuICAgICAgICAgICAgOyhmaWVsZCBhcyBhbnkpLnVuaXF1ZSA9IHVuaXF1ZU1hdGNoWzFdID09PSAndHJ1ZSdcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVsYXRpb25Ub01hdGNoKSB7XG4gICAgICAgICAgICA7KGZpZWxkIGFzIGFueSkucmVsYXRpb25UbyA9IHJlbGF0aW9uVG9NYXRjaFsxXVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGZpZWxkcy5wdXNoKGZpZWxkIGFzIEZpZWxkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHRpbWVzdGFtcHNcbiAgICBjb25zdCB0aW1lc3RhbXBzTWF0Y2ggPSBjb2xsZWN0aW9uRGVmLm1hdGNoKC90aW1lc3RhbXBzOlxccyoodHJ1ZXxmYWxzZSkvKVxuICAgIGNvbnN0IGhhc1RpbWVzdGFtcHMgPSB0aW1lc3RhbXBzTWF0Y2ggPyB0aW1lc3RhbXBzTWF0Y2hbMV0gPT09ICd0cnVlJyA6IGZhbHNlXG5cbiAgICBjb2xsZWN0aW9ucy5wdXNoKHtcbiAgICAgIHNsdWcsXG4gICAgICBhZG1pbjoge1xuICAgICAgICB1c2VBc1RpdGxlXG4gICAgICB9LFxuICAgICAgZmllbGRzLFxuICAgICAgLi4uKGhhc1RpbWVzdGFtcHMgJiYgeyB0aW1lc3RhbXBzOiB0cnVlIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8vIEV4dHJhY3QgZXhwb3J0IHN0YXRlbWVudFxuICBjb25zdCBleHBvcnRSZWdleCA9IC9leHBvcnRcXHMqe1tcXHNcXFNdKj99Oy9cbiAgY29uc3QgZXhwb3J0TWF0Y2ggPSBjb2RlLm1hdGNoKGV4cG9ydFJlZ2V4KVxuICBpZiAoZXhwb3J0TWF0Y2gpIHtcbiAgICBwb3N0ID0gZXhwb3J0TWF0Y2hbMF1cbiAgfVxuXG4gIHJldHVybiB7IGNvbGxlY3Rpb25zLCBwb3N0IH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVQYXlsb2FkQ29sbGVjdGlvbkNvbmZpZ3Moe1xuICBvcHRpb25zLFxuICBjb2xsZWN0aW9ucyxcbiAgZXhwb3J0c1xufToge1xuICBvcHRpb25zOiBCZXR0ZXJBdXRoT3B0aW9uc1xuICBjb2xsZWN0aW9uczogQ29sbGVjdGlvbkNvbmZpZ1tdXG4gIGV4cG9ydHM6IHN0cmluZ1xufSk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSAnJ1xuXG4gIC8vIGFkZCBwcmUgbWVzc2FnZSBhbmQgaW1wb3J0IHN0YXRlbWVudHNcbiAgcmVzdWx0ICs9IGAvKipcbiAqIEVYQU1QTEUgQ09MTEVDVElPTlMgRk9SIEJFVFRFUiBBVVRIXG4gKiBcbiAqIEJlbG93IGlzIHdoYXQgeW91ciBQYXlsb2FkIGNvbGxlY3Rpb25zIHNob3VsZCBsb29rIGxpa2UuXG4gKiBQbGVhc2UgY29weSB0aGVzZSB0byB5b3VyIGFjdHVhbCBjb2xsZWN0aW9uIGNvbmZpZ3MuXG4gKiBNYWtlIHN1cmUgdG8gYWRkIGFuIGF1dGhTdHJhdGVneSBmb3IgdGhlIHVzZXJzIGNvbGxlY3Rpb24gaWYgdGhlcmUgaXMgb25lLlxuICogXG4gKiBFeGFtcGxlIGF1dGggc3RyYXRlZ3k6XG4gKiBhdXRoOiB7XG4gKiAgIGRpc2FibGVMb2NhbFN0cmF0ZWd5OiB0cnVlLFxuICogICBzdHJhdGVnaWVzOiBbXG4gKiAgICAgYmV0dGVyQXV0aFN0cmF0ZWd5KCksXG4gKiAgICAgLy8gQWRkIG90aGVyIHN0cmF0ZWdpZXMgYXMgbmVlZGVkXG4gKiAgIF0sXG4gKiB9LFxuICovXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJztcblxuYFxuXG4gIC8vIGFkZCB0aGUgY29sbGVjdGlvbnNcbiAgbGV0IGNvbGxlY3Rpb25zU3RyID0gJydcbiAgY29uc3QgdGFibGVzID0gZ2V0QXV0aFRhYmxlcyhvcHRpb25zKVxuXG4gIC8vIFByb2Nlc3MgZXhpc3RpbmcgY29sbGVjdGlvbnMgZmlyc3RcbiAgY29uc3QgZXhpc3RpbmdDb2xsZWN0aW9uc0J5U2x1ZyA9IGNvbGxlY3Rpb25zLnJlZHVjZShcbiAgICAoYWNjLCBjb2xsZWN0aW9uKSA9PiB7XG4gICAgICBpZiAoY29sbGVjdGlvbi5zbHVnKSB7XG4gICAgICAgIGFjY1tjb2xsZWN0aW9uLnNsdWddID0gY29sbGVjdGlvblxuICAgICAgfVxuICAgICAgcmV0dXJuIGFjY1xuICAgIH0sXG4gICAge30gYXMgUmVjb3JkPHN0cmluZywgQ29sbGVjdGlvbkNvbmZpZz5cbiAgKVxuXG4gIGZvciAoY29uc3QgW3RhYmxlS2V5LCB0YWJsZV0gb2YgT2JqZWN0LmVudHJpZXModGFibGVzKSkge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHRhYmxlLm1vZGVsTmFtZVxuICAgIGNvbnN0IGNhcGl0YWxpemVkID0gbW9kZWxOYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbW9kZWxOYW1lLnNsaWNlKDEpXG5cbiAgICAvLyBDaGVjayBpZiB0aGlzIGNvbGxlY3Rpb24gYWxyZWFkeSBleGlzdHMgaW4gdGhlIHByb3ZpZGVkIGNvbGxlY3Rpb25zXG4gICAgY29uc3QgZXhpc3RpbmdDb2xsZWN0aW9uID0gZXhpc3RpbmdDb2xsZWN0aW9uc0J5U2x1Z1ttb2RlbE5hbWVdXG5cbiAgICBpZiAoZXhpc3RpbmdDb2xsZWN0aW9uKSB7XG4gICAgICAvLyBDb252ZXJ0IGV4aXN0aW5nIGNvbGxlY3Rpb24gdG8gc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICBjb2xsZWN0aW9uc1N0ciArPSBgY29uc3QgJHtjYXBpdGFsaXplZH06IENvbGxlY3Rpb25Db25maWcgPSAke0pTT04uc3RyaW5naWZ5KGV4aXN0aW5nQ29sbGVjdGlvbiwgbnVsbCwgMikucmVwbGFjZSgvXCIoW15cIl0rKVwiOi9nLCAnJDE6Jyl9IGFzIGNvbnN0O1xcblxcbmBcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIG5ldyBjb2xsZWN0aW9uIGlmIGl0IGRvZXNuJ3QgZXhpc3RcbiAgICBjb2xsZWN0aW9uc1N0ciArPSBgY29uc3QgJHtjYXBpdGFsaXplZH06IENvbGxlY3Rpb25Db25maWcgPSB7XG4gIHNsdWc6IFwiJHttb2RlbE5hbWV9XCIsXG5gXG5cbiAgICAvLyBBZGQgYWRtaW4gc2VjdGlvbiBmb3IgYmV0dGVyIFVYXG4gICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgYWRtaW46IHtcbiAgICB1c2VBc1RpdGxlOiBcIiR7Z2V0TmFtZUZpZWxkKHRhYmxlLmZpZWxkcyl9XCIsXG4gIH0sXG5gXG5cbiAgICAvLyBBZGQgYXV0aCBzZWN0aW9uIE9OTFkgZm9yIHVzZXJzIGNvbGxlY3Rpb25cbiAgICBpZiAobW9kZWxOYW1lID09PSAndXNlcnMnKSB7XG4gICAgICBjb2xsZWN0aW9uc1N0ciArPSBgICBhdXRoOiB7XG4gICAgZGlzYWJsZUxvY2FsU3RyYXRlZ3k6IHRydWUsXG4gICAgc3RyYXRlZ2llczogW10sXG4gICAgLy8gQWRkIHlvdXIgYXV0aCBzdHJhdGVnaWVzIGhlcmUgaWYgbmVlZGVkXG4gIH0sXG5gXG4gICAgfVxuXG4gICAgLy8gQWRkIGZpZWxkc1xuICAgIGNvbGxlY3Rpb25zU3RyICs9IGAgIGZpZWxkczogW1xuYFxuXG4gICAgZm9yIChjb25zdCBbZmllbGRLZXksIGZpZWxkXSBvZiBPYmplY3QuZW50cmllcyh0YWJsZS5maWVsZHMpKSB7XG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZC5maWVsZE5hbWUgfHwgZmllbGRLZXlcbiAgICAgIC8vIFNraXAgaWQgZmllbGQgYXMgUGF5bG9hZCBoYW5kbGVzIGl0IGF1dG9tYXRpY2FsbHlcbiAgICAgIGlmIChmaWVsZE5hbWUgPT09ICdpZCcpIGNvbnRpbnVlXG5cbiAgICAgIGlmIChmaWVsZE5hbWUgPT09ICdjcmVhdGVkQXQnIHx8IGZpZWxkTmFtZSA9PT0gJ3VwZGF0ZWRBdCcpIGNvbnRpbnVlXG5cbiAgICAgIC8vIEhhbmRsZSBmaWVsZCB0eXBlIG1hcHBpbmcgd2l0aCBzYWZlciB0eXBlIGFwcHJvYWNoXG4gICAgICBsZXQgZmllbGRUeXBlID0gbWFwRmllbGRUeXBlKGZpZWxkLnR5cGUgYXMgc3RyaW5nLCBmaWVsZE5hbWUpXG4gICAgICBjb25zdCBpc1JlbGF0aW9uc2hpcCA9IGZpZWxkTmFtZS5lbmRzV2l0aCgnX2lkJykgfHwgISFmaWVsZC5yZWZlcmVuY2VzPy5tb2RlbFxuXG4gICAgICBjb2xsZWN0aW9uc1N0ciArPSBgICAgIHtcbiAgICAgIG5hbWU6IFwiJHtpc1JlbGF0aW9uc2hpcCA/IGZpZWxkTmFtZS5yZXBsYWNlKCdfaWQnLCAnJykgOiBmaWVsZE5hbWV9XCIsXG5gXG5cbiAgICAgIGlmIChpc1JlbGF0aW9uc2hpcCkge1xuICAgICAgICBjb2xsZWN0aW9uc1N0ciArPSBgICAgICAgdHlwZTogXCJyZWxhdGlvbnNoaXBcIixcbiAgICAgIHJlbGF0aW9uVG86IFwiJHtmaWVsZC5yZWZlcmVuY2VzPy5tb2RlbCB8fCBmaWVsZE5hbWUucmVwbGFjZSgnX2lkJywgJycpfVwiLFxuYFxuICAgICAgfSBlbHNlIGlmIChmaWVsZFR5cGUgPT09ICd1cGxvYWQnKSB7XG4gICAgICAgIGNvbGxlY3Rpb25zU3RyICs9IGAgICAgICB0eXBlOiBcInVwbG9hZFwiLFxuICAgICAgcmVsYXRpb25UbzogXCJtZWRpYVwiLFxuYFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICAgIHR5cGU6IFwiJHtmaWVsZFR5cGV9XCIsXG5gXG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZC5yZXF1aXJlZCkge1xuICAgICAgICBjb2xsZWN0aW9uc1N0ciArPSBgICAgICAgcmVxdWlyZWQ6IHRydWUsXG5gXG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZC51bmlxdWUpIHtcbiAgICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICAgIHVuaXF1ZTogdHJ1ZSxcbmBcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgaWYgZmllbGQgaGFzIG9wdGlvbnMgYW5kIGZpZWxkVHlwZSBpcyBzZWxlY3RcbiAgICAgIGlmIChmaWVsZFR5cGUgPT09ICdzZWxlY3QnICYmICdvcHRpb25zJyBpbiBmaWVsZCAmJiBBcnJheS5pc0FycmF5KGZpZWxkLm9wdGlvbnMpKSB7XG4gICAgICAgIGNvbGxlY3Rpb25zU3RyICs9IGAgICAgICBvcHRpb25zOiAke0pTT04uc3RyaW5naWZ5KGZpZWxkLm9wdGlvbnMpfSxcbmBcbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLmRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZmllbGQuZGVmYXVsdFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbGxlY3Rpb25zU3RyICs9IGAgICAgICBkZWZhdWx0VmFsdWU6IFwiJHtmaWVsZC5kZWZhdWx0VmFsdWV9XCIsXG5gXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpZWxkLmRlZmF1bHRWYWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICAgIGRlZmF1bHRWYWx1ZTogJHtmaWVsZC5kZWZhdWx0VmFsdWUgPyAndHJ1ZScgOiAnZmFsc2UnfSxcbmBcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZC5kZWZhdWx0VmFsdWUgJiYgdHlwZW9mIGZpZWxkLmRlZmF1bHRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBmaWVsZC5kZWZhdWx0VmFsdWUudG9TdHJpbmcoKS5pbmNsdWRlcygnKCkgPT4gITEnKSkge1xuICAgICAgICAgIC8vIEhhbmRsZSBmdW5jdGlvbi1saWtlIGRlZmF1bHQgdmFsdWVzIHdpdGggYXJlIGZhbHNlXG4gICAgICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG5gXG4gICAgICAgIH0gZWxzZSBpZiAoZmllbGQuZGVmYXVsdFZhbHVlICYmIHR5cGVvZiBmaWVsZC5kZWZhdWx0VmFsdWUgPT09ICdmdW5jdGlvbicgJiYgZmllbGQuZGVmYXVsdFZhbHVlLnRvU3RyaW5nKCkuaW5jbHVkZXMoJygpID0+ICEwJykpIHtcbiAgICAgICAgICAvLyBIYW5kbGUgZnVuY3Rpb24tbGlrZSBkZWZhdWx0IHZhbHVlcyB3aXRoIGFyZSB0cnVlXG4gICAgICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbmBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb2xsZWN0aW9uc1N0ciArPSBgICAgICAgZGVmYXVsdFZhbHVlOiAke2ZpZWxkLmRlZmF1bHRWYWx1ZX0sXG5gXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFkbWluIHNlY3Rpb24gZm9yIGZpZWxkcyBpZiBuZWVkZWQgLSBzYWZlbHkgY2hlY2sgZm9yIGFkbWluIHByb3BlcnR5XG4gICAgICBpZiAoJ2FkbWluJyBpbiBmaWVsZCAmJiBmaWVsZC5hZG1pbiAmJiB0eXBlb2YgZmllbGQuYWRtaW4gPT09ICdvYmplY3QnICYmICdyZWFkT25seScgaW4gZmllbGQuYWRtaW4gJiYgZmllbGQuYWRtaW4ucmVhZE9ubHkpIHtcbiAgICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgfSxcbmBcbiAgICAgIH1cblxuICAgICAgY29sbGVjdGlvbnNTdHIgKz0gYCAgICB9LFxuYFxuICAgIH1cblxuICAgIGNvbGxlY3Rpb25zU3RyICs9IGAgIF0sXG4gIHRpbWVzdGFtcHM6IHRydWUsXG59IGFzIGNvbnN0O1xuXG5gXG4gIH1cblxuICAvLyBBZGQgYW55IGNvbGxlY3Rpb25zIGZyb20gdGhlIGlucHV0IHRoYXQgYXJlbid0IGluIHRoZSB0YWJsZXNcbiAgZm9yIChjb25zdCBjb2xsZWN0aW9uIG9mIGNvbGxlY3Rpb25zKSB7XG4gICAgaWYgKCFjb2xsZWN0aW9uLnNsdWcgfHwgdGFibGVzW2NvbGxlY3Rpb24uc2x1Z10pIHtcbiAgICAgIGNvbnRpbnVlIC8vIFNraXAgaWYgbm8gc2x1ZyBvciBhbHJlYWR5IHByb2Nlc3NlZFxuICAgIH1cblxuICAgIGNvbnN0IGNhcGl0YWxpemVkID0gY29sbGVjdGlvbi5zbHVnLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgY29sbGVjdGlvbi5zbHVnLnNsaWNlKDEpXG4gICAgY29sbGVjdGlvbnNTdHIgKz0gYGNvbnN0ICR7Y2FwaXRhbGl6ZWR9OiBDb2xsZWN0aW9uQ29uZmlnID0gJHtKU09OLnN0cmluZ2lmeShjb2xsZWN0aW9uLCBudWxsLCAyKS5yZXBsYWNlKC9cIihbXlwiXSspXCI6L2csICckMTonKX0gYXMgY29uc3Q7XFxuXFxuYFxuICB9XG5cbiAgcmVzdWx0ICs9IGNvbGxlY3Rpb25zU3RyXG5cbiAgLy8gQWRkIGV4cG9ydCBzdGF0ZW1lbnRzIGZvciBhbGwgY29sbGVjdGlvbnNcbiAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhbiBleGlzdGluZyBleHBvcnQgc3RhdGVtZW50IHRvIGFkYXB0XG4gIGlmIChleHBvcnRzICYmIGV4cG9ydHMudHJpbSgpKSB7XG4gICAgLy8gUGFyc2UgdGhlIGV4aXN0aW5nIGV4cG9ydHMgdG8gZ2V0IGNvbGxlY3Rpb24gbmFtZXNcbiAgICBjb25zdCBleGlzdGluZ0V4cG9ydE1hdGNoID0gZXhwb3J0cy5tYXRjaCgvZXhwb3J0XFxzKntcXHMqKC4qPylcXHMqfS8pXG4gICAgY29uc3QgZXhpc3RpbmdDb2xsZWN0aW9ucyA9IGV4aXN0aW5nRXhwb3J0TWF0Y2ggPyBleGlzdGluZ0V4cG9ydE1hdGNoWzFdLnNwbGl0KCcsJykubWFwKChuYW1lKSA9PiBuYW1lLnRyaW0oKSkgOiBbXVxuXG4gICAgLy8gR2V0IHRoZSBjb2xsZWN0aW9uIG5hbWVzIGZyb20gb3VyIHRhYmxlc1xuICAgIGNvbnN0IHRhYmxlQ29sbGVjdGlvbnMgPSBPYmplY3Qua2V5cyh0YWJsZXMpLm1hcCgobW9kZWwpID0+IHtcbiAgICAgIHJldHVybiBtb2RlbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1vZGVsLnNsaWNlKDEpXG4gICAgfSlcblxuICAgIC8vIENvbWJpbmUgZXhpc3RpbmcgYW5kIG5ldyBjb2xsZWN0aW9ucywgcmVtb3ZpbmcgZHVwbGljYXRlc1xuICAgIGNvbnN0IGFsbENvbGxlY3Rpb25zID0gWy4uLm5ldyBTZXQoWy4uLmV4aXN0aW5nQ29sbGVjdGlvbnMsIC4uLnRhYmxlQ29sbGVjdGlvbnNdKV1cblxuICAgIC8vIENyZWF0ZSB0aGUgbmV3IGV4cG9ydCBzdGF0ZW1lbnRcbiAgICByZXN1bHQgKz0gYGV4cG9ydCB7ICR7YWxsQ29sbGVjdGlvbnMuam9pbignLCAnKX0gfTtcbmBcbiAgfSBlbHNlIGlmIChPYmplY3Qua2V5cyh0YWJsZXMpLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBjb2xsZWN0aW9uTmFtZXMgPSBPYmplY3Qua2V5cyh0YWJsZXMpLm1hcCgobW9kZWwpID0+IHtcbiAgICAgIC8vIENvbnZlcnQgbW9kZWwgbmFtZSB0byBQYXNjYWxDYXNlIGZvciBleHBvcnRcbiAgICAgIGNvbnN0IHBhc2NhbENhc2UgPSBtb2RlbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1vZGVsLnNsaWNlKDEpXG4gICAgICByZXR1cm4gcGFzY2FsQ2FzZVxuICAgIH0pXG5cbiAgICByZXN1bHQgKz0gYGV4cG9ydCB7ICR7Y29sbGVjdGlvbk5hbWVzLmpvaW4oJywgJyl9IH07XG5gXG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ICs9IGBleHBvcnQge307XG5gXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbnNcbmZ1bmN0aW9uIG1hcEZpZWxkVHlwZSh0eXBlOiBzdHJpbmcsIGZpZWxkTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKGZpZWxkTmFtZS5lbmRzV2l0aCgnX2lkJykpIHJldHVybiAncmVsYXRpb25zaGlwJ1xuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuICdjaGVja2JveCdcbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuICdudW1iZXInXG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGlmIChmaWVsZE5hbWUgPT09ICdlbWFpbCcpIHJldHVybiAnZW1haWwnXG4gICAgICBpZiAoZmllbGROYW1lLmluY2x1ZGVzKCdwYXNzd29yZCcpKSByZXR1cm4gJ3RleHQnXG4gICAgICBpZiAoZmllbGROYW1lLmluY2x1ZGVzKCdpbWFnZScpIHx8IGZpZWxkTmFtZS5pbmNsdWRlcygnYXZhdGFyJykpIHJldHVybiAndXBsb2FkJ1xuICAgICAgcmV0dXJuICd0ZXh0J1xuICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgcmV0dXJuICdkYXRlJ1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiAnYXJyYXknXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAndGV4dCdcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXROYW1lRmllbGQoZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcbiAgLy8gVHJ5IHRvIGZpbmQgYW4gYXBwcm9wcmlhdGUgZmllbGQgdG8gdXNlIGFzIHRpdGxlXG4gIGNvbnN0IG5hbWVPcHRpb25zID0gWyduYW1lJywgJ3RpdGxlJywgJ2xhYmVsJywgJ2VtYWlsJywgJ3VzZXJuYW1lJ11cblxuICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBuYW1lT3B0aW9ucykge1xuICAgIGlmIChPYmplY3Qua2V5cyhmaWVsZHMpLmluY2x1ZGVzKG9wdGlvbikpIHtcbiAgICAgIHJldHVybiBvcHRpb25cbiAgICB9XG4gIH1cblxuICAvLyBEZWZhdWx0IHRvIGZpcnN0IGZpZWxkIHRoYXQncyBub3QgaWRcbiAgY29uc3QgZmlyc3ROb25JZEZpZWxkID0gT2JqZWN0LmtleXMoZmllbGRzKS5maW5kKChrKSA9PiBrICE9PSAnaWQnKVxuICByZXR1cm4gZmlyc3ROb25JZEZpZWxkIHx8ICdpZCdcbn1cbiJdLCJuYW1lcyI6WyJnZXRBdXRoVGFibGVzIiwiZm9ybWF0IiwiZ2VuZXJhdGVTY2hlbWFCdWlsZGVyU3RhZ2UiLCJCQU9wdGlvbnMiLCJjb2RlIiwiZm9ybWF0dGVkQ29kZSIsImZpbGVwYXRoIiwicG9zdCIsImNvbGxlY3Rpb25zIiwicGFyc2VFeGlzdGluZ1NjaGVtYSIsInBheWxvYWRTY2hlbWFTdHIiLCJnZW5lcmF0ZVBheWxvYWRDb2xsZWN0aW9uQ29uZmlncyIsIm9wdGlvbnMiLCJleHBvcnRzIiwiY29sbGVjdGlvblJlZ2V4IiwibWF0Y2giLCJleGVjIiwiY29sbGVjdGlvbk5hbWUiLCJjb2xsZWN0aW9uRGVmIiwic2x1Z01hdGNoIiwic2x1ZyIsInRvTG93ZXJDYXNlIiwidGl0bGVNYXRjaCIsInVzZUFzVGl0bGUiLCJmaWVsZHNSZWdleCIsImZpZWxkc01hdGNoIiwiZmllbGRzIiwiZmllbGRCbG9ja1JlZ2V4IiwiZmllbGRCbG9ja3MiLCJmaWVsZEJsb2NrIiwibmFtZU1hdGNoIiwidHlwZU1hdGNoIiwicmVxdWlyZWRNYXRjaCIsInVuaXF1ZU1hdGNoIiwicmVsYXRpb25Ub01hdGNoIiwiZmllbGQiLCJuYW1lIiwidHlwZSIsInJlcXVpcmVkIiwidW5pcXVlIiwicmVsYXRpb25UbyIsInB1c2giLCJ0aW1lc3RhbXBzTWF0Y2giLCJoYXNUaW1lc3RhbXBzIiwiYWRtaW4iLCJ0aW1lc3RhbXBzIiwiZXhwb3J0UmVnZXgiLCJleHBvcnRNYXRjaCIsInJlc3VsdCIsImNvbGxlY3Rpb25zU3RyIiwidGFibGVzIiwiZXhpc3RpbmdDb2xsZWN0aW9uc0J5U2x1ZyIsInJlZHVjZSIsImFjYyIsImNvbGxlY3Rpb24iLCJ0YWJsZUtleSIsInRhYmxlIiwiT2JqZWN0IiwiZW50cmllcyIsIm1vZGVsTmFtZSIsImNhcGl0YWxpemVkIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzbGljZSIsImV4aXN0aW5nQ29sbGVjdGlvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXBsYWNlIiwiZ2V0TmFtZUZpZWxkIiwiZmllbGRLZXkiLCJmaWVsZE5hbWUiLCJmaWVsZFR5cGUiLCJtYXBGaWVsZFR5cGUiLCJpc1JlbGF0aW9uc2hpcCIsImVuZHNXaXRoIiwicmVmZXJlbmNlcyIsIm1vZGVsIiwiQXJyYXkiLCJpc0FycmF5IiwiZGVmYXVsdFZhbHVlIiwidW5kZWZpbmVkIiwidG9TdHJpbmciLCJpbmNsdWRlcyIsInJlYWRPbmx5IiwidHJpbSIsImV4aXN0aW5nRXhwb3J0TWF0Y2giLCJleGlzdGluZ0NvbGxlY3Rpb25zIiwic3BsaXQiLCJtYXAiLCJ0YWJsZUNvbGxlY3Rpb25zIiwia2V5cyIsImFsbENvbGxlY3Rpb25zIiwiU2V0Iiwiam9pbiIsImxlbmd0aCIsImNvbGxlY3Rpb25OYW1lcyIsInBhc2NhbENhc2UiLCJuYW1lT3B0aW9ucyIsIm9wdGlvbiIsImZpcnN0Tm9uSWRGaWVsZCIsImZpbmQiLCJrIl0sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQkMsR0FFRCxTQUFTQSxhQUFhLFFBQVEsaUJBQWdCO0FBRTlDLFNBQVNDLE1BQU0sUUFBUSxXQUFVO0FBRWpDLE9BQU8sTUFBTUMsNkJBQTZCLE9BQU8sRUFBRUMsU0FBUyxFQUFFQyxJQUFJLEVBQWtEO0lBQ2xILE1BQU1DLGdCQUFnQixNQUFNSixPQUFPRyxNQUFNO1FBQUVFLFVBQVU7SUFBWTtJQUVqRSxNQUFNLEVBQUVDLElBQUksRUFBRUMsV0FBVyxFQUFFLEdBQUdDLG9CQUFvQko7SUFFbEQsTUFBTUssbUJBQW1CQyxpQ0FBaUM7UUFDeERDLFNBQVNUO1FBQ1RLO1FBQ0FLLFNBQVNOO0lBQ1g7SUFFQSxPQUFPLE1BQU1OLE9BQU8sR0FBR1Msa0JBQWtCLEVBQUU7UUFDekNKLFVBQVU7SUFDWjtBQUNGLEVBQUM7QUFFRCxTQUFTRyxvQkFBb0JMLElBQVk7SUFJdkMsTUFBTUksY0FBa0MsRUFBRTtJQUMxQyxJQUFJRCxPQUFPO0lBRVgsaUNBQWlDO0lBQ2pDLE1BQU1PLGtCQUFrQjtJQUN4QixJQUFJQztJQUNKLE1BQU8sQUFBQ0EsQ0FBQUEsUUFBUUQsZ0JBQWdCRSxJQUFJLENBQUNaLEtBQUksTUFBTyxLQUFNO1FBQ3BELE1BQU1hLGlCQUFpQkYsS0FBSyxDQUFDLEVBQUU7UUFDL0IsTUFBTUcsZ0JBQWdCSCxLQUFLLENBQUMsRUFBRTtRQUU5QixlQUFlO1FBQ2YsTUFBTUksWUFBWUQsY0FBY0gsS0FBSyxDQUFDO1FBQ3RDLE1BQU1LLE9BQU9ELFlBQVlBLFNBQVMsQ0FBQyxFQUFFLEdBQUdGLGVBQWVJLFdBQVc7UUFFbEUscUJBQXFCO1FBQ3JCLE1BQU1DLGFBQWFKLGNBQWNILEtBQUssQ0FBQztRQUN2QyxNQUFNUSxhQUFh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