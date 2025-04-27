import type { FieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'

export type FieldRule = {
  condition?: (field: FieldAttribute) => boolean
  transform: (field: FieldAttribute) => Record<string, unknown>
}

type AdditionalFieldProperties = {
  [key: string]: (field: FieldAttribute) => Partial<Field>
}

function getRuleBasedFieldProperties({ field }: { field: FieldAttribute }, fieldRules: FieldRule[] = []): Record<string, unknown> {
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
  additionalProperties = {}
}: {
  field: FieldAttribute
  fieldKey: string
  fieldRules?: FieldRule[]
  additionalProperties?: AdditionalFieldProperties
}): Partial<Field> => {
  const ruleProps = getRuleBasedFieldProperties({ field }, fieldRules)
  const specificProps = additionalProperties[fieldKey]?.(field) ?? {}

  return { ...ruleProps, ...specificProps } as Partial<Field>
}
