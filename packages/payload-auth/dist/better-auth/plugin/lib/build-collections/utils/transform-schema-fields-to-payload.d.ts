import type { BuiltBetterAuthSchema, FieldRule } from '@/better-auth/plugin/types';
import type { DBFieldAttribute } from 'better-auth/db';
import type { Field } from 'payload';
export declare function getCollectionFields({ schema, fieldRules, additionalProperties }: {
    schema: BuiltBetterAuthSchema;
    fieldRules?: FieldRule[];
    additionalProperties?: Record<string, (field: DBFieldAttribute) => Partial<Field>>;
}): Field[] | null;
export declare function convertSchemaFieldToPayload({ field, fieldKey, fieldRules, additionalProperties }: {
    field: DBFieldAttribute;
    fieldKey: string;
    fieldRules?: FieldRule[];
    additionalProperties?: Record<string, (field: DBFieldAttribute) => Partial<Field>>;
}): Field;
export declare function getPayloadFieldProperties({ field }: {
    field: DBFieldAttribute;
}): {
    type: Field['type'];
    hasMany?: boolean;
};
//# sourceMappingURL=transform-schema-fields-to-payload.d.ts.map