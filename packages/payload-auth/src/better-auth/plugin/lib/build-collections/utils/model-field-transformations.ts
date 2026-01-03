import type { DBFieldAttribute } from "better-auth/db";
import type { Field } from "payload";
import { FieldRule } from "@/better-auth/plugin/types";
import {
  filterProps,
  getValidFieldPropertyKeysForType
} from "./filter-properties";

function getRuleBasedFieldProperties(
  { field }: { field: DBFieldAttribute },
  fieldRules: FieldRule[] = []
): Record<string, unknown> {
  return fieldRules.reduce<Record<string, unknown>>((acc, rule) => {
    const conditionMatch = !rule.condition || rule.condition(field);

    if (conditionMatch) {
      Object.assign(acc, rule.transform(field));
    }

    return acc;
  }, {});
}

export const getAdditionalFieldProperties = ({
  field,
  fieldKey,
  fieldRules = [],
  additionalProperties = {}
}: {
  field: DBFieldAttribute;
  fieldKey: string;
  fieldRules?: FieldRule[];
  additionalProperties?: {
    [key: string]: (field: DBFieldAttribute) => Partial<Field>;
  };
}): Partial<Field> => {
  const ruleProps = getRuleBasedFieldProperties({ field }, fieldRules);
  const specificProps = additionalProperties[fieldKey]?.(field) ?? {};
  const mergedProps = { ...ruleProps, ...specificProps };
  const type = mergedProps.type as Field["type"];
  // get valid field property keys for the type of the field after merging the rules and the additional properties
  const validFieldPropertyKeysForType = getValidFieldPropertyKeysForType(type);
  return filterProps(mergedProps as any, validFieldPropertyKeysForType as any);
};
