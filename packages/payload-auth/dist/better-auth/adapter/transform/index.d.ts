import type { ModelKey } from '@/better-auth/generated-types';
import type { BetterAuthOptions, Where } from 'better-auth';
import type { BasePayload, CollectionSlug, Where as PayloadWhere } from 'payload';
export declare const createTransform: (options: BetterAuthOptions, enableDebugLogs: boolean) => {
    getFieldName: (model: ModelKey, field: string) => string;
    getCollectionSlug: (model: ModelKey) => CollectionSlug;
    singleIdQuery: (where: PayloadWhere) => string | number | null;
    transformInput: ({ data, model, idType, payload }: {
        data: Record<string, any>;
        model: ModelKey;
        idType: "number" | "text";
        payload: BasePayload;
    }) => Record<string, any>;
    transformOutput: <T extends Record<string, any> | null>({ doc, model, payload }: {
        doc: T;
        model: ModelKey;
        payload: BasePayload;
    }) => T;
    convertWhereClause: ({ idType, model, where, payload }: {
        idType: "number" | "text";
        model: ModelKey;
        where?: Where[];
        payload: BasePayload;
    }) => PayloadWhere;
    convertSelect: (model: ModelKey, select?: string[]) => {} | undefined;
    convertSort: (model: ModelKey, sortBy?: {
        field: string;
        direction: "asc" | "desc";
    }) => string | undefined;
};
//# sourceMappingURL=index.d.ts.map