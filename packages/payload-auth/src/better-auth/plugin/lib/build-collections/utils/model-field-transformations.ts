import type { FieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'
import type { baModelKey } from '../../../constants'

export type FieldRule = {
  model?: string | string[]
  condition?: (field: FieldAttribute) => boolean
  transform: (field: FieldAttribute) => Record<string, unknown>
}

type AdditionalFieldProperties = {
  [key: string]: (field: FieldAttribute) => Partial<Field>
}

function getRuleBasedFieldProperties({ field, model }: { field: FieldAttribute; model: string }, fieldRules: FieldRule[] = []): Record<string, unknown> {
  return fieldRules.reduce<Record<string, unknown>>((acc, rule) => {
    const modelMatch = !rule.model || (Array.isArray(rule.model) ? rule.model.includes(model) : rule.model === model)
    const conditionMatch = !rule.condition || rule.condition(field)

    if (modelMatch && conditionMatch) {
      Object.assign(acc, rule.transform(field))
    }

    return acc
  }, {})
}

export const getAdditionalFieldProperties = ({
  field,
  model,
  fieldKey,
  fieldRules = [],
  additionalProperties = {}
}: {
  field: FieldAttribute
  model: keyof typeof baModelKey
  fieldKey: string
  fieldRules?: FieldRule[]
  additionalProperties?: AdditionalFieldProperties
}): Partial<Field> => {
  const ruleProps = getRuleBasedFieldProperties({ field, model }, fieldRules)
  const specificProps = additionalProperties[fieldKey]?.(field) ?? {}

  return { ...ruleProps, ...specificProps } as Partial<Field>
}
