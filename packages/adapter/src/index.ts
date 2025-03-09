import type {
  Adapter,
  AdapterInstance,
  BetterAuthOptions,
  Where,
} from "better-auth";
import { BetterAuthError } from "better-auth";
import type { BasePayload } from "payload";
import { createTransform } from "./transform";
import type { PayloadAdapterOptions } from "./types";
import { generateSchema } from "./generate-schema";

export type PayloadAdapter = (
  payloadClient: BasePayload,
  config?: PayloadAdapterOptions
) => AdapterInstance;

export const payloadAdapter: PayloadAdapter = (payload, config = {}) => {
  function debugLog(message: any[]) {
    if (config.enable_debug_logs) {
      console.log(`[payload-db-adapter]`, ...message);
    }
  }

  function errorLog(message: any[]) {
    console.error(`[payload-db-adapter]`, ...message);
  }

  function collectionSlugError(model: string) {
    throw new BetterAuthError(
      `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`
    );
  }

  return (options: BetterAuthOptions): Adapter => {
    const {
      transformInput,
      transformOutput,
      convertWhereClause,
      convertSelect,
      convertSort,
      getModelName,
      singleIdQuery,
      multipleIdsQuery,
    } = createTransform(options);

    return {
      id: "payload",
      async create<T extends Record<string, any>, R = T>(data: {
        model: string;
        data: T;
        select?: string[];
      }): Promise<R> {
        const start = Date.now();
        const { model, data: values, select } = data;
        debugLog(["create", { model, values, select }]);
        const collectionSlug = getModelName(model);
        const transformed = transformInput(values, model, "create");
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          const result = await payload.create({
            collection: collectionSlug,
            data: transformed,
            select: convertSelect(model, select),
          });
          const transformedResult = transformOutput(result);
          debugLog([
            "create result",
            { result, duration: `${Date.now() - start}ms` },
          ]);
          return transformedResult as R;
        } catch (error) {
          errorLog(["Error in create: ", error]);
          return null as R;
        }
      },
      async findOne<T>(data: {
        model: string;
        where: Where[];
        select?: string[];
      }): Promise<T | null> {
        const start = Date.now();
        const { model, where, select } = data;
        debugLog(["findOne", { model, where, select }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          const id = singleIdQuery(where);
          let result: Record<string, any> | null = null;
          if (id) {
            const doc = await payload.findByID({
              collection: collectionSlug,
              id,
              select: convertSelect(model, select),
            });
            result = doc;
          } else {
            const docs = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              select: convertSelect(model, select),
              limit: 1,
            });
            result = docs.docs[0];
          }
          const transformedResult = transformOutput(result) ?? null;
          debugLog([
            "findOne result",
            { result, duration: `${Date.now() - start}ms` },
          ]);
          return transformedResult as T;
        } catch (error) {
          errorLog(["Error in findOne: ", error]);
          return null;
        }
      },
      async findMany<T>(data: {
        model: string;
        where?: Where[];
        limit?: number;
        sortBy?: {
          field: string;
          direction: "asc" | "desc";
        };
        offset?: number;
      }): Promise<T[]> {
        const start = Date.now();
        const { model, where, sortBy, limit, offset } = data;
        debugLog(["findMany", { model, where, sortBy, limit, offset }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          let result: {
            docs: Record<string, any>[];
            totalDocs: number;
          } | null = null;
          const multipleIds = where && multipleIdsQuery(where);
          const singleId = where && singleIdQuery(where);
          if (multipleIds && multipleIds.length > 0) {
            const res = {
              docs: [] as Record<string, any>[],
              totalDocs: 0,
            };
            for (const id of multipleIds) {
              const doc = await payload.findByID({
                collection: collectionSlug,
                id,
              });
              res.docs.push(doc);
              res.totalDocs++;
            }
            result = { docs: res.docs, totalDocs: res.totalDocs };
          } else if (singleId) {
            const doc = await payload.findByID({
              collection: collectionSlug,
              id: singleId,
            });
            result = { docs: doc ? [doc] : [], totalDocs: doc ? 1 : 0 };
          } else {
            const res = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              limit: limit,
              page: offset ? Math.floor(offset / (limit || 10)) + 1 : 1,
              sort: convertSort(model, sortBy),
            });
            result = { docs: res.docs, totalDocs: res.totalDocs };
          }
          const transformedResult =
            result?.docs.map((doc) => transformOutput(doc)) ?? null;
          debugLog([
            "findMany result",
            { transformedResult, duration: `${Date.now() - start}ms` },
          ]);
          return transformedResult as T[];
        } catch (error) {
          errorLog(["Error in findMany: ", error]);
          return [] as T[];
        }
      },
      async update<T>(data: {
        model: string;
        where: Where[];
        update: Record<string, unknown>;
      }): Promise<T | null> {
        const start = Date.now();
        const { model, where, update } = data;
        debugLog(["update", { model, where, update }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          let result: Record<string, any> | null = null;
          const id = singleIdQuery(where);
          if (id) {
            const doc = await payload.update({
              collection: collectionSlug,
              id,
              data: update,
            });
            result = doc;
          } else {
            const doc = await payload.update({
              collection: collectionSlug,
              where: payloadWhere,
              data: update,
            });
            result = doc.docs[0];
          }
          const transformedResult = transformOutput(result) ?? null;
          debugLog([
            "update result",
            { result, duration: `${Date.now() - start}ms` },
          ]);
          return transformedResult as T;
        } catch (error) {
          errorLog(["Error in update: ", error]);
          return null;
        }
      },
      async updateMany(data: {
        model: string;
        where: Where[];
        update: Record<string, unknown>;
      }): Promise<number> {
        const start = Date.now();
        const { model, where, update } = data;
        debugLog(["updateMany", { model, where, update }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          const updateResult = await payload.db.updateMany({
            collection: collectionSlug,
            where: payloadWhere,
            data: update,
          });
          debugLog([
            "updateMany result",
            { result: updateResult, duration: `${Date.now() - start}ms` },
          ]);
          return updateResult?.length || 0;
        } catch (error) {
          errorLog(["Error in updateMany: ", error]);
          return 0;
        }
      },
      async delete(data: { model: string; where: Where[] }): Promise<void> {
        const start = Date.now();
        const { model, where } = data;
        debugLog(["delete", { model, where }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          let deleteResult: {
            doc: Record<string, any> | null;
            errors: any[];
          } | null = null;
          const id = singleIdQuery(where);
          if (id) {
            const doc = await payload.delete({
              collection: collectionSlug,
              id,
            });
            deleteResult = { doc, errors: [] };
          } else {
            const doc = await payload.delete({
              collection: collectionSlug,
              where: payloadWhere,
            });
            deleteResult = { doc: doc.docs[0], errors: [] };
          }
          debugLog([
            "delete result",
            { result: deleteResult, duration: `${Date.now() - start}ms` },
          ]);
          return;
        } catch (error) {
          errorLog(["Error in delete: ", error]);
          return;
        }
      },
      async deleteMany(data: {
        model: string;
        where: Where[];
      }): Promise<number> {
        const start = Date.now();
        const { model, where } = data;
        debugLog(["deleteMany", { model, where }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          const deleteResult = await payload.delete({
            collection: collectionSlug,
            where: payloadWhere,
          });
          debugLog([
            "deleteMany result",
            { result: deleteResult, duration: `${Date.now() - start}ms` },
          ]);

          return deleteResult.docs.length;
        } catch (error) {
          errorLog(["Error in deleteMany: ", error]);
          return 0;
        }
      },
      async count(data: { model: string; where?: Where[] }): Promise<number> {
        const start = Date.now();
        const { model, where } = data;
        debugLog(["count", { model, where }]);
        const collectionSlug = getModelName(model);
        const payloadWhere = convertWhereClause(model, where);
        try {
          if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
          }
          const result = await payload.count({
            collection: collectionSlug,
            where: payloadWhere,
          });
          debugLog([
            "count result",
            {
              result: { totalDocs: result.totalDocs },
              duration: `${Date.now() - start}ms`,
            },
          ]);
          return result.totalDocs;
        } catch (error) {
          errorLog(["Error in count: ", error]);
          return 0;
        }
      },
      createSchema: async (options, file) => {
        const schemaCode = await generateSchema(options);

        return {
          code: schemaCode,
          path: file || "schema.ts",
          append: false,
          overwrite: true,
        };
      },
      options: {
        enable_debug_logs: config.enable_debug_logs,
      },
    };
  };
};
