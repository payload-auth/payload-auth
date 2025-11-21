import type { Field, TextField, NumberField, DateField, CheckboxField, RelationshipField, FieldBase, SelectField } from 'payload'

export const COMMON_FIELD_KEYS = [
  'access',
  'admin',
  'custom',
  'defaultValue',
  'hidden',
  'hooks',
  'index',
  'label',
  'localized',
  'name',
  'required',
  'saveToJWT',
  'typescriptSchema',
  'unique',
  'validate',
  'virtual',
  '_sanitized'
] as const satisfies readonly (keyof FieldBase)[]
export const TEXT_FIELD_KEYS = [
  ...COMMON_FIELD_KEYS,
  'type',
  'maxLength',
  'maxRows',
  'minLength',
  'minRows',
  'hasMany'
] as const satisfies readonly (keyof TextField)[]

export const NUMBER_FIELD_KEYS = [...COMMON_FIELD_KEYS, 'max', 'min', 'hasMany'] as const satisfies readonly (keyof NumberField)[]

export const DATE_FIELD_KEYS = [...COMMON_FIELD_KEYS, 'timezone'] as const satisfies readonly (keyof DateField)[]

export const CHECKBOX_FIELD_KEYS = [...COMMON_FIELD_KEYS] as const satisfies readonly (keyof CheckboxField)[]

export const RELATIONSHIP_FIELD_KEYS = [
  ...COMMON_FIELD_KEYS,
  'filterOptions',
  'graphQL',
  'hasMany',
  'max',
  'maxDepth',
  'maxRows',
  'min',
  'minRows',
  'relationTo',
  'type'
] as const satisfies readonly (keyof RelationshipField)[]

export const SELECT_FIELD_KEYS = [
  ...COMMON_FIELD_KEYS,
  'type',
  'options',
  'hasMany',
  'interfaceName',
  'enumName',
  'dbName',
  'validate',
  'defaultValue',
  'filterOptions',
] as const satisfies readonly (keyof SelectField)[]

export function getValidFieldPropertyKeysForType(type: Field['type']) {
  switch (type) {
    case 'relationship':
      return [...RELATIONSHIP_FIELD_KEYS]
    case 'text':
      return [...TEXT_FIELD_KEYS]
    case 'number':
      return [...NUMBER_FIELD_KEYS]
    case 'date':
      return [...DATE_FIELD_KEYS]
    case 'checkbox':
      return [...CHECKBOX_FIELD_KEYS]
    case 'select':
      return [...SELECT_FIELD_KEYS]
    default:
      return [...COMMON_FIELD_KEYS]
  }
}

export function filterProps<T extends object, K extends readonly (keyof T)[]>(
  obj: Partial<T>,
  allowed: K,
  extra: readonly string[] = []
): Partial<T> {
  const allow = new Set<string>([...allowed.map(String), ...extra])
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (!allow.has(k)) continue
    out[k] = v
  }
  return out as Partial<T>
}
