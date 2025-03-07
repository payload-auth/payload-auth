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
 */
import type { BetterAuthOptions } from "better-auth";
import { getAuthTables } from "better-auth/db";
import { format } from "prettier";

export const generateSchemaBuilderStage = async ({
  options,
}: {
  options: BetterAuthOptions;
}) => {
  const payload_schema_str = generate_payload_collection_configs(options);

  return await format(`${payload_schema_str}`, {
    filepath: "schema.ts",
  });
};

function generate_payload_collection_configs(
  options: BetterAuthOptions
): string {
  let result = "";

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
  let collectionsStr = "";
  const tables = getAuthTables(options);

  for (const [tableKey, table] of Object.entries(tables)) {
    const modelName = table.modelName;
    const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);

    collectionsStr += `const ${capitalized}: CollectionConfig = {
  slug: "${modelName}",
`;

    // Add admin section for better UX
    collectionsStr += `  admin: {
    useAsTitle: "${getNameField(table.fields)}",
  },
`;

    // Add auth section ONLY for users collection
    if (modelName === "users") {
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

    for (const [fieldKey, field] of Object.entries(table.fields)) {
      const fieldName = field.fieldName || fieldKey;
      // Skip id field as Payload handles it automatically
      if (fieldName === "id") continue;

      // Handle field type mapping with safer type approach
      let fieldType = mapFieldType(field.type as string, fieldName);
      const isRelationship =
        fieldName.endsWith("_id") || !!field.references?.model;

      collectionsStr += `    {
      name: "${isRelationship ? fieldName.replace("_id", "") : fieldName}",
`;

      if (isRelationship) {
        collectionsStr += `      type: "relationship",
      relationTo: "${field.references?.model || fieldName.replace("_id", "")}",
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
      if (
        fieldType === "select" &&
        "options" in field &&
        Array.isArray(field.options)
      ) {
        collectionsStr += `      options: ${JSON.stringify(field.options)},
`;
      }

      if (field.defaultValue !== undefined) {
        if (typeof field.defaultValue === "string") {
          collectionsStr += `      defaultValue: "${field.defaultValue}",
`;
        } else {
          collectionsStr += `      defaultValue: ${field.defaultValue},
`;
        }
      }

      // Add admin section for fields if needed - safely check for admin property
      if (
        "admin" in field &&
        field.admin &&
        typeof field.admin === "object" &&
        "readOnly" in field.admin &&
        field.admin.readOnly
      ) {
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

  result += collectionsStr;

  // add the post message export statements, depending on if there are collections or notq
  if (collectionsStr.length > 0) {
    result += `
    
    export { ${collectionsStr
      .split("\n")
      .map((line) => line.split(" ")[1])
      .join(", ")} };
`;
  } else {
    result += `
    
    export {};`;
  }

  return result;
}

// Helper functions
function mapFieldType(type: string, fieldName: string): string {
  if (fieldName.endsWith("_id")) return "relationship";

  switch (type) {
    case "boolean":
      return "checkbox";
    case "number":
      return "number";
    case "string":
      if (fieldName === "email") return "email";
      if (fieldName.includes("password")) return "text";
      if (fieldName.includes("image") || fieldName.includes("avatar"))
        return "upload";
      return "text";
    case "date":
      return "date";
    case "array":
      return "array";
    default:
      return "text";
  }
}

function getNameField(fields: Record<string, any>): string {
  // Try to find an appropriate field to use as title
  const nameOptions = ["name", "title", "label", "email", "username"];

  for (const option of nameOptions) {
    if (Object.keys(fields).includes(option)) {
      return option;
    }
  }

  // Default to first field that's not id
  const firstNonIdField = Object.keys(fields).find((k) => k !== "id");
  return firstNonIdField || "id";
}
