import type { BuiltBetterAuthSchema, FieldRule } from '@/better-auth/plugin/types'
import type { DBFieldAttribute } from 'better-auth/db'
import type { Field, RelationshipField } from 'payload'
import { getAdditionalFieldProperties } from './model-field-transformations'
import { getValidFieldPropertyKeysForType } from './filter-properties'

export function getCollectionFields({
  schema,
  fieldRules = [],
  additionalProperties = {}
}: {
  schema: BuiltBetterAuthSchema
  fieldRules?: FieldRule[]
  additionalProperties?: Record<string, (field: DBFieldAttribute) => Partial<Field>>
}): Field[] | null {
  const payloadFields = Object.entries(schema.fields).map(([fieldKey, field]) => {
    return convertSchemaFieldToPayload({ field, fieldKey, fieldRules, additionalProperties })
  })

  return payloadFields
}

export function convertSchemaFieldToPayload({
  field,
  fieldKey,
  fieldRules = [],
  additionalProperties = {}
}: {
  field: DBFieldAttribute
  fieldKey: string
  fieldRules?: FieldRule[]
  additionalProperties?: Record<string, (field: DBFieldAttribute) => Partial<Field>>
}): Field {
  const { type: baseType, hasMany } = getPayloadFieldProperties({ field })
  
  // First, get unfiltered additional properties to check for type overrides
  const unfilteredAdditionalProperties = getAdditionalFieldProperties({
    field,
    fieldKey,
    fieldRules,
    additionalProperties,
    validFieldPropertyKeys: [] // Empty array means no filtering
  })
  
  // Determine the effective type (override takes precedence over base type)
  const effectiveType = (unfilteredAdditionalProperties as any).type ?? baseType
  
  // Now filter properties based on the effective type
  const validFieldPropertyKeys = getValidFieldPropertyKeysForType(effectiveType)
  const filteredAdditionalProperties = getAdditionalFieldProperties({
    field,
    fieldKey,
    fieldRules,
    additionalProperties,
    validFieldPropertyKeys
  })
  
  const baseField = {
    name: field.fieldName ?? fieldKey,
    type: effectiveType,
    ...(hasMany && { hasMany }),
    ...(field.required && { required: true }),
    ...(field.unique && { unique: true }),
    ...filteredAdditionalProperties,
    custom: {
      betterAuthFieldKey: fieldKey
    }
  } as Field

  if (field.references) {
    return {
      ...baseField,
      ...('relationTo' in filteredAdditionalProperties
        ? { relationTo: filteredAdditionalProperties.relationTo }
        : { relationTo: field.references.model })
    } as RelationshipField
  }

  return baseField
}

export function getPayloadFieldProperties({ field }: { field: DBFieldAttribute }): {
  type: Field['type']
  hasMany?: boolean
} {
  const type = field.type

  if ('references' in field) {
    return { type: 'relationship' }
  }

  if (type === 'number[]') {
    return { type: 'number', hasMany: true }
  }

  if (type === 'string[]') {
    return { type: 'text', hasMany: true }
  }

  switch (type) {
    case 'boolean':
      return { type: 'checkbox' }
    case 'date':
      return { type: 'date' }
    case 'string':
      return { type: 'text' }
    case 'number':
      return { type: 'number' }
    default:
      return { type: 'text' }
  }
}
