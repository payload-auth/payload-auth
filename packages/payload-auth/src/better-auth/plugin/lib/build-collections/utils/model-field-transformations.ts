import { FieldRule } from '@/better-auth/plugin/types'
import type { DBFieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'
import { filterProps } from './filter-properties'

function getRuleBasedFieldProperties({ field }: { field: DBFieldAttribute }, fieldRules: FieldRule[] = []): Record<string, unknown> {
  return fieldRules.reduce<Record<string, unknown>>((acc, rule) => {
    const conditionMatch = !rule.condition || rule.condition(field)

    if (conditionMatch) {
      Object.assign(acc, rule.transform(field))
    }

    return acc
  }, {})
}

export const getAdditionalFieldProperties = ({
  field,
  fieldKey,
  fieldRules = [],
  additionalProperties = {},
  validFieldPropertyKeys = []
}: {
  field: DBFieldAttribute
  fieldKey: string
  fieldRules?: FieldRule[]
  additionalProperties?: { [key: string]: (field: DBFieldAttribute) => Partial<Field> }
  validFieldPropertyKeys?: string[]
}): Partial<Field> => {
  const ruleProps = getRuleBasedFieldProperties({ field }, fieldRules)
  const specificProps = additionalProperties[fieldKey]?.(field) ?? {}

  const mergedProps = { ...ruleProps, ...specificProps }

  return filterProps(mergedProps as any, validFieldPropertyKeys as any)
}
