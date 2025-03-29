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
import type { BetterAuthOptions } from 'better-auth'
import { getAuthTables } from 'better-auth/db'
import type { CollectionConfig, Field } from 'payload'
import { format } from 'prettier'

export const generateSchemaBuilderStage = async ({
  BAOptions,
  code,
}: {
  code: string
  BAOptions: BetterAuthOptions
}) => {
  const formattedCode = await format(code, { filepath: 'schema.ts' })

  const { post, collections } = parseExistingSchema(formattedCode)

  const payloadSchemaStr = generatePayloadCollectionConfigs({
    options: BAOptions,
    collections,
    exports: post,
  })

  return await format(`${payloadSchemaStr}`, {
    filepath: 'schema.ts',
  })
}

function parseExistingSchema(code: string): {
  collections: CollectionConfig[]
  post: string
} {
  const collections: CollectionConfig[] = []
  let post = ''

  // Extract collection definitions
  const collectionRegex =
    /const\s+([A-Z][a-zA-Z0-9]*)\s*:\s*CollectionConfig\s*=\s*{[\s\S]*?}\s*as\s*const;/g
  let match
  while ((match = collectionRegex.exec(code)) !== null) {
    const collectionName = match[1]
    const collectionDef = match[0]

    // Extract slug
    const slugMatch = collectionDef.match(/slug:\s*"([^"]+)"/)
    const slug = slugMatch ? slugMatch[1] : collectionName.toLowerCase()

    // Extract useAsTitle
    const titleMatch = collectionDef.match(/useAsTitle:\s*"([^"]+)"/)
    const useAsTitle = titleMatch ? titleMatch[1] : 'id'

    // Extract fields
    const fieldsRegex = /fields:\s*\[([\s\S]*?)\],/
    const fieldsMatch = collectionDef.match(fieldsRegex)
    const fields: Field[] = []

    if (fieldsMatch) {
      const fieldBlockRegex = /{[\s\S]*?},/g
      const fieldBlocks = fieldsMatch[1].match(fieldBlockRegex) || []

      for (const fieldBlock of fieldBlocks) {
        const nameMatch = fieldBlock.match(/name:\s*"([^"]+)"/)
        const typeMatch = fieldBlock.match(/type:\s*"([^"]+)"/)
        const requiredMatch = fieldBlock.match(/required:\s*(true|false)/)
        const uniqueMatch = fieldBlock.match(/unique:\s*(true|false)/)
        const relationToMatch = fieldBlock.match(/relationTo:\s*"([^"]+)"/)

        if (nameMatch && typeMatch) {
          const field = {
            name: nameMatch[1],
            type: typeMatch[1] as Field['type'],
          }

          if (requiredMatch) {
            ;(field as any).required = requiredMatch[1] === 'true'
          }

          if (uniqueMatch) {
            ;(field as any).unique = uniqueMatch[1] === 'true'
          }

          if (relationToMatch) {
            ;(field as any).relationTo = relationToMatch[1]
          }

          fields.push(field as Field)
        }
      }
    }

    // Check for timestamps
    const timestampsMatch = collectionDef.match(/timestamps:\s*(true|false)/)
    const hasTimestamps = timestampsMatch ? timestampsMatch[1] === 'true' : false

    collections.push({
      slug,
      admin: {
        useAsTitle,
      },
      fields,
      ...(hasTimestamps && { timestamps: true }),
    })
  }

  // Extract export statement
  const exportRegex = /export\s*{[\s\S]*?};/
  const exportMatch = code.match(exportRegex)
  if (exportMatch) {
    post = exportMatch[0]
  }

  return { collections, post }
}

function generatePayloadCollectionConfigs({
  options,
  collections,
  exports,
}: {
  options: BetterAuthOptions
  collections: CollectionConfig[]
  exports: string
}): string {
  let result = ''

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

`

  // add the collections
  let collectionsStr = ''
  const tables = getAuthTables(options)

  // Process existing collections first
  const existingCollectionsBySlug = collections.reduce(
    (acc, collection) => {
      if (collection.slug) {
        acc[collection.slug] = collection
      }
      return acc
    },
    {} as Record<string, CollectionConfig>,
  )

  for (const [tableKey, table] of Object.entries(tables)) {
    const modelName = table.modelName
    const capitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1)

    // Check if this collection already exists in the provided collections
    const existingCollection = existingCollectionsBySlug[modelName]

    if (existingCollection) {
      // Convert existing collection to string representation
      collectionsStr += `const ${capitalized}: CollectionConfig = ${JSON.stringify(existingCollection, null, 2).replace(/"([^"]+)":/g, '$1:')} as const;\n\n`
      continue
    }

    // Create new collection if it doesn't exist
    collectionsStr += `const ${capitalized}: CollectionConfig = {
  slug: "${modelName}",
`

    // Add admin section for better UX
    collectionsStr += `  admin: {
    useAsTitle: "${getNameField(table.fields)}",
  },
`

    // Add auth section ONLY for users collection
    if (modelName === 'users') {
      collectionsStr += `  auth: {
    disableLocalStrategy: true,
    strategies: [],
    // Add your auth strategies here if needed
  },
`
    }

    // Add fields
    collectionsStr += `  fields: [
`

    for (const [fieldKey, field] of Object.entries(table.fields)) {
      const fieldName = field.fieldName || fieldKey
      // Skip id field as Payload handles it automatically
      if (fieldName === 'id') continue

      if (fieldName === 'createdAt' || fieldName === 'updatedAt') continue

      // Handle field type mapping with safer type approach
      let fieldType = mapFieldType(field.type as string, fieldName)
      const isRelationship = fieldName.endsWith('_id') || !!field.references?.model

      collectionsStr += `    {
      name: "${isRelationship ? fieldName.replace('_id', '') : fieldName}",
`

      if (isRelationship) {
        collectionsStr += `      type: "relationship",
      relationTo: "${field.references?.model || fieldName.replace('_id', '')}",
`
      } else if (fieldType === 'upload') {
        collectionsStr += `      type: "upload",
      relationTo: "media",
`
      } else {
        collectionsStr += `      type: "${fieldType}",
`
      }

      if (field.required) {
        collectionsStr += `      required: true,
`
      }

      if (field.unique) {
        collectionsStr += `      unique: true,
`
      }

      // Check if field has options and fieldType is select
      if (fieldType === 'select' && 'options' in field && Array.isArray(field.options)) {
        collectionsStr += `      options: ${JSON.stringify(field.options)},
`
      }

      if (field.defaultValue !== undefined) {
        if (typeof field.defaultValue === 'string') {
          collectionsStr += `      defaultValue: "${field.defaultValue}",
`
        } else if (typeof field.defaultValue === 'boolean') {
          collectionsStr += `      defaultValue: ${field.defaultValue ? 'true' : 'false'},
`
        } else if (
          field.defaultValue &&
          typeof field.defaultValue === 'function' &&
          field.defaultValue.toString().includes('() => !1')
        ) {
          // Handle function-like default values with are false
          collectionsStr += `      defaultValue: false,
`
        } else if (
          field.defaultValue &&
          typeof field.defaultValue === 'function' &&
          field.defaultValue.toString().includes('() => !0')
        ) {
          // Handle function-like default values with are true
          collectionsStr += `      defaultValue: true,
`
        } else {
          collectionsStr += `      defaultValue: ${field.defaultValue},
`
        }
      }

      // Add admin section for fields if needed - safely check for admin property
      if (
        'admin' in field &&
        field.admin &&
        typeof field.admin === 'object' &&
        'readOnly' in field.admin &&
        field.admin.readOnly
      ) {
        collectionsStr += `      admin: {
        readOnly: true,
      },
`
      }

      collectionsStr += `    },
`
    }

    collectionsStr += `  ],
  timestamps: true,
} as const;

`
  }

  // Add any collections from the input that aren't in the tables
  for (const collection of collections) {
    if (!collection.slug || tables[collection.slug]) {
      continue // Skip if no slug or already processed
    }

    const capitalized = collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1)
    collectionsStr += `const ${capitalized}: CollectionConfig = ${JSON.stringify(collection, null, 2).replace(/"([^"]+)":/g, '$1:')} as const;\n\n`
  }

  result += collectionsStr

  // Add export statements for all collections
  // Check if we have an existing export statement to adapt
  if (exports && exports.trim()) {
    // Parse the existing exports to get collection names
    const existingExportMatch = exports.match(/export\s*{\s*(.*?)\s*}/)
    const existingCollections = existingExportMatch
      ? existingExportMatch[1].split(',').map((name) => name.trim())
      : []

    // Get the collection names from our tables
    const tableCollections = Object.keys(tables).map((model) => {
      return model.charAt(0).toUpperCase() + model.slice(1)
    })

    // Combine existing and new collections, removing duplicates
    const allCollections = [...new Set([...existingCollections, ...tableCollections])]

    // Create the new export statement
    result += `export { ${allCollections.join(', ')} };
`
  } else if (Object.keys(tables).length > 0) {
    const collectionNames = Object.keys(tables).map((model) => {
      // Convert model name to PascalCase for export
      const pascalCase = model.charAt(0).toUpperCase() + model.slice(1)
      return pascalCase
    })

    result += `export { ${collectionNames.join(', ')} };
`
  } else {
    result += `export {};
`
  }

  return result
}

// Helper functions
function mapFieldType(type: string, fieldName: string): string {
  if (fieldName.endsWith('_id')) return 'relationship'

  switch (type) {
    case 'boolean':
      return 'checkbox'
    case 'number':
      return 'number'
    case 'string':
      if (fieldName === 'email') return 'email'
      if (fieldName.includes('password')) return 'text'
      if (fieldName.includes('image') || fieldName.includes('avatar')) return 'upload'
      return 'text'
    case 'date':
      return 'date'
    case 'array':
      return 'array'
    default:
      return 'text'
  }
}

function getNameField(fields: Record<string, any>): string {
  // Try to find an appropriate field to use as title
  const nameOptions = ['name', 'title', 'label', 'email', 'username']

  for (const option of nameOptions) {
    if (Object.keys(fields).includes(option)) {
      return option
    }
  }

  // Default to first field that's not id
  const firstNonIdField = Object.keys(fields).find((k) => k !== 'id')
  return firstNonIdField || 'id'
}
