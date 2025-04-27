import { getAuthTables, getSchema, type FieldAttribute } from 'better-auth/db'
import type { BetterAuthOptions, Models } from 'better-auth'
import type { Field, RelationshipField, TextField, CheckboxField, NumberField, DateField } from 'payload'
import { getAdditionalFieldProperties } from './model-field-transformations'
import type { baModelKey } from '../../../constants'
import type { FieldRule } from './model-field-transformations'
import { BuildSchema } from '@/better-auth/plugin/types'

export function getPayloadFieldsFromBetterAuthSchema({
  schema,
  fieldRules = [],
  additionalProperties = {}
}: {
  schema: BuildSchema
  fieldRules?: FieldRule[]
  additionalProperties?: Record<string, (field: FieldAttribute) => Partial<Field>>
}): Field[] | null {
  const payloadFields = Object.entries(schema.fields).map(([fieldKey, field]) => {
    return convertBetterAuthFieldToPayloadField({ field, fieldKey, fieldRules, additionalProperties })
  })

  return payloadFields
}

export function convertBetterAuthFieldToPayloadField({
  field,
  fieldKey,
  fieldRules = [],
  additionalProperties = {}
}: {
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
    ...getAdditionalFieldProperties({ field, fieldKey, fieldRules, additionalProperties }),
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
