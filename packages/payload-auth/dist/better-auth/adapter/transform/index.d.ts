import type { ModelKey } from '@/better-auth/generated-types';
import type { BetterAuthOptions, Where } from 'better-auth';
import type { CollectionSlug, Where as PayloadWhere } from 'payload';
export declare const createTransform: (options: BetterAuthOptions, enableDebugLogs: boolean) => {
    getFieldName: (model: ModelKey, field: string) => string;
    getCollectionSlug: (model: ModelKey) => CollectionSlug;
    singleIdQuery: (where: PayloadWhere) => string | number | null;
    transformInput: ({ data, model, idType }: {
        data: Record<string, any>;
        model: ModelKey;
        idType: "number" | "text";
    }) => Record<string, any>;
    transformOutput: <T extends Record<string, any> | null>({ doc, model }: {
        doc: T;
        model: ModelKey;
    }) => T;
    convertWhereClause: ({ idType, model, where }: {
        idType: "number" | "text";
        model: ModelKey;
        where?: Where[];
    }) => PayloadWhere;
    convertSelect: (model: ModelKey, select?: string[]) => {} | undefined;
    convertSort: (model: ModelKey, sortBy?: {
        field: string;
        direction: "asc" | "desc";
    }) => string | undefined;
};
//# sourceMappingURL=index.d.ts.map