import { BuiltBetterAuthSchema } from '@/better-auth/plugin/types';
import { type FieldAttribute } from 'better-auth/db';
import type { Field } from 'payload';
import type { FieldRule } from './model-field-transformations';
export declare function getCollectionFields({ schema, fieldRules, additionalProperties }: {
    schema: BuiltBetterAuthSchema;
    fieldRules?: FieldRule[];
    additionalProperties?: Record<string, (field: FieldAttribute) => Partial<Field>>;
}): Field[] | null;
export declare function convertSchemaFieldToPayload({ field, fieldKey, fieldRules, additionalProperties }: {
    field: FieldAttribute;
    fieldKey: string;
    fieldRules?: FieldRule[];
    additionalProperties?: Record<string, (field: FieldAttribute) => Partial<Field>>;
}): Field;
export declare function getPayloadFieldProperties({ field }: {
    field: FieldAttribute;
}): {
    type: Field['type'];
    hasMany?: boolean;
};
//# sourceMappingURL=transform-schema-fields-to-payload.d.ts.map