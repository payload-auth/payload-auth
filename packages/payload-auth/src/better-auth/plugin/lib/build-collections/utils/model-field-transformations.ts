import type { FieldAttribute } from 'better-auth/db'
import type { Field } from 'payload'

// See getAdditionalFieldProperties for context
const SANITIZED_FIELD_PROPERTIES = ['onUpdate']

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
  const mergedProps = { ...ruleProps, ...specificProps } as Partial<Field>

  // Payload generates a sanitized version of its config for passing to the client.
  // This includes checking field properties against a list of known server-only
  // property names (see ServerOnlyFieldProperties in link below). Better Auth models
  // include function properties that cannot be serialised but whose names do not appear
  // in Payload's list, meaning they will slip through to the frontend and generate a
  // serialization error. We therefore need to strip them out here.
  // We could strip out all function properties to make this fully future proof, but there
  // are some like defaultValue that Payload already handles that we don't want to lose,
  // so a more surgical, targeted approach seems more appropriate.
  // https://github.com/payloadcms/payload/blob/main/packages/payload/src/fields/config/client.ts
  ;(SANITIZED_FIELD_PROPERTIES || []).forEach((name) => {
    delete mergedProps[name as keyof Field]
  })

  return mergedProps
}
