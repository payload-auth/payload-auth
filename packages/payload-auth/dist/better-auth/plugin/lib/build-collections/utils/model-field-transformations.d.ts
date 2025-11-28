import { FieldRule } from '@/better-auth/plugin/types';
import type { DBFieldAttribute } from 'better-auth/db';
import type { Field } from 'payload';
export declare const getAdditionalFieldProperties: ({ field, fieldKey, fieldRules, additionalProperties }: {
    field: DBFieldAttribute;
    fieldKey: string;
    fieldRules?: FieldRule[];
    additionalProperties?: {
        [key: string]: (field: DBFieldAttribute) => Partial<Field>;
    };
}) => Partial<Field>;
//# sourceMappingURL=model-field-transformations.d.ts.map