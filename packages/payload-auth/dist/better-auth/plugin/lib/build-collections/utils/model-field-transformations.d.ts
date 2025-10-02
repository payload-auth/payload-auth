import type { FieldAttribute } from 'better-auth/db';
import type { Field } from 'payload';
export type FieldRule = {
    condition?: (field: FieldAttribute) => boolean;
    transform: (field: FieldAttribute) => Record<string, unknown>;
};
type AdditionalFieldProperties = {
    [key: string]: (field: FieldAttribute) => Partial<Field>;
};
export declare const getAdditionalFieldProperties: ({ field, fieldKey, fieldRules, additionalProperties }: {
    field: FieldAttribute;
    fieldKey: string;
    fieldRules?: FieldRule[];
    additionalProperties?: AdditionalFieldProperties;
}) => Partial<Field>;
export {};
//# sourceMappingURL=model-field-transformations.d.ts.map