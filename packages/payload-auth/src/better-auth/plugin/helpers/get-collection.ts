import { CollectionConfig, Field } from 'payload'

/**
 * Retrieves a collection from the collection map based on its Better Auth model key
 *
 * This function searches through the provided collection map to find a collection
 * that has been marked with a specific Better Auth model key in its custom properties.
 * It's used to map between Better Auth's internal model keys and Payload CMS collections.
 *
 * @param collectionMap - Map of all available collections
 * @param betterAuthModelKey - The Better Auth model key to search for
 * @returns The matched collection configuration
 * @throws {Error} If no collection with the specified Better Auth model key is found
 */
export function getMappedCollection({
  collectionMap,
  betterAuthModelKey
}: {
  collectionMap: Record<string, CollectionConfig>
  betterAuthModelKey: string
}): CollectionConfig {
  // Find the collection that has the matching betterAuthModelKey in its custom properties
  const collection = Object.values(collectionMap).find((c) => c.custom?.betterAuthModelKey === betterAuthModelKey)

  // Throw an error if no matching collection is found
  if (!collection) {
    throw new Error(`Collection with key ${betterAuthModelKey} not found`)
  }

  return collection
}

interface MappedField extends Omit<Field, 'type'> {
  name: string
  type: Exclude<Field['type'], 'tabs' | 'row' | 'collapsible'>
}

/**
 * Retrieves a field from a collection based on its Better Auth field key
 *
 * This function searches through the fields of a provided collection to find a field
 * that has been marked with a specific Better Auth field key in its custom properties.
 * It's used to map between Better Auth's internal field keys and Payload CMS field configurations.
 *
 * @param collection - The collection configuration to search within
 * @param betterAuthFieldKey - The Better Auth field key to search for
 * @returns The matched field configuration with a guaranteed name and non-UI type
 * @throws {Error} If no field with the specified Better Auth field key is found
 * @throws {Error} If the found field is a UI-only field type (tabs, row, collapsible)
 */
export function getMappedField({
  collection,
  betterAuthFieldKey
}: {
  collection: CollectionConfig
  betterAuthFieldKey: string
}): MappedField {
  // Find the field that has the matching betterAuthFieldKey in its custom properties
  const field = collection.fields.find((f) => f.custom?.betterAuthFieldKey === betterAuthFieldKey)

  // Throw an error if no matching field is found
  if (!field) {
    throw new Error(`Field with key ${betterAuthFieldKey} not found`)
  }

  // Filter out UI-based fields that don't have a name or aren't data fields
  // These field types are used for layout purposes only and cannot store data
  switch (field.type) {
    case 'tabs':
    case 'row':
    case 'collapsible':
      throw new Error(`Field with key ${betterAuthFieldKey} is a UI-only field and cannot be used for data`)
    default:
      return field as MappedField
  }
}
