import { getAuthTables, type FieldAttribute } from 'better-auth/db'
import type { BetterAuthOptions, Models } from 'better-auth'
import type { Field, RelationshipField, TextField, CheckboxField, NumberField, DateField } from 'payload'
import { getAdditionalFieldProperties } from './model-field-transformations'
import type { baModelKey } from '../../../constants'
import type { FieldRule } from './model-field-transformations'

export function getPayloadFieldsFromBetterAuthSchema({
  model,
  betterAuthOptions,
  fieldRules = [],
  additionalProperties = {}
}: {
  model: keyof typeof baModelKey
  betterAuthOptions: BetterAuthOptions
  fieldRules?: FieldRule[]
  additionalProperties?: Record<string, (field: FieldAttribute) => Partial<Field>>
}): Field[] | null {
  const schema = getAuthTables(betterAuthOptions)

  const collection = schema[model]

  if (!collection) {
    console.error(`Collection ${model} not found in BetterAuth schema`)
    return null
  }

  const payloadFields = Object.entries(collection.fields).map(([fieldKey, field]) => {
    return convertBetterAuthFieldToPayloadField({ model, field, fieldKey, fieldRules, additionalProperties })
  })

  return payloadFields
}

export function convertBetterAuthFieldToPayloadField({
  model,
  field,
  fieldKey,
  fieldRules = [],
  additionalProperties = {}
}: {
  model: keyof typeof baModelKey
  field: FieldAttribute
  fieldKey: string
  fieldRules?: FieldRule[]
  additionalProperties?: Record<string, (field: FieldAttribute) => Partial<Field>>
}): Field {
  const { type, hasMany } = getPayloadFieldPropertiesFromBetterAuthField({ field })
  const baseField = {
    name: field.fieldName ?? fieldKey,
    type,
    ...(hasMany && { hasMany }),
    ...(field.required && { required: true }),
    ...(field.unique && { unique: true }),
    ...getAdditionalFieldProperties({ field, model, fieldKey, fieldRules, additionalProperties }),
    custom: {
      betterAuthFieldKey: fieldKey
    }
  } as Field

  if (field.references) {
    return {
      ...baseField,
      relationTo: field.references.model
    } as RelationshipField
  }

  return baseField
}

export function getPayloadFieldPropertiesFromBetterAuthField({ field }: { field: FieldAttribute }): {
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
