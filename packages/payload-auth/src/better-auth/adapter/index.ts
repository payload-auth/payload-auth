import { DBAdapter } from "@better-auth/core/db/adapter";
import type { BetterAuthOptions, Where } from "better-auth";
import { BetterAuthError } from "better-auth";
import { ModelKey } from "../generated-types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import type { PayloadAdapter } from "./types";

export const BETTER_AUTH_CONTEXT_KEY = "payload-db-adapter";
const PAYLOAD_QUERY_DEPTH = 1;
const CREATE_QUERY_DEPTH = 0;

/** Better Auth join option type (not exported from better-auth yet) */
type JoinOption = {
  [modelKey: string]:
    | boolean
    | {
        limit?: number;
      };
};

/**
 * Payload adapter for Better Auth.
 *
 * This adapter connects Better Auth to Payload CMS, allowing authentication
 * operations to be performed against Payload collections.
 *
 * @param payloadClient - The Payload CMS client instance or a function that returns it
 * @param config - Configuration options for the adapter
 * @returns A function that creates a Better Auth adapter
 */
const payloadAdapter: PayloadAdapter = ({ payloadClient, adapterConfig }) => {
  /**
   * Logs debug messages if debug logging is enabled
   * @param message - The message to log
   */
  function debugLog(message: any[]) {
    if (adapterConfig.enableDebugLogs) {
      console.log("[payload-db-adapter]", ...message);
    }
  }

  /**
   * Logs error messages
   * @param message - The error message to log
   */
  function errorLog(message: any[]) {
    console.error(`[payload-db-adapter]`, ...message);
  }

  /**
   * Throws an error when a collection slug doesn't exist
   * @param model - The model name that couldn't be found
   * @throws {BetterAuthError} When the collection doesn't exist
   * @returns Never - Function always throws
   */
  function collectionSlugError(model: string): never {
    throw new BetterAuthError(
      `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`
    );
  }

  /**
   * Validates that a collection exists in Payload
   * @param payload - The Payload client instance
   * @param collectionSlug - The collection slug to validate
   * @param model - The model name for error messages
   * @throws {BetterAuthError} When the collection doesn't exist
   */
  async function validateCollection(
    payload: any,
    collectionSlug: string,
    model: string
  ): Promise<void> {
    if (!collectionSlug || !(collectionSlug in payload.collections)) {
      collectionSlugError(model);
    }
  }

  /**
   * Creates a context object for Payload operations
   * @param data - Data to include in the context
   * @returns The context object with Better Auth metadata
   */
  const createAdapterContext = (data: Record<string, any>) => ({
    [BETTER_AUTH_CONTEXT_KEY]: { ...data }
  });

  /**
   * Resolves the Payload client, handling both function and direct references
   * @returns The resolved Payload client
   * @throws {BetterAuthError} When Better Auth plugin is not configured
   */
  async function resolvePayloadClient() {
    const payload =
      typeof payloadClient === "function"
        ? await payloadClient()
        : await payloadClient;
    if (!payload.config?.custom?.hasBetterAuthPlugin) {
      throw new BetterAuthError(
        `Payload is not configured with the better-auth plugin. Please add the plugin to your payload config.`
      );
    }
    return payload;
  }

  /**
   * Creates and returns a Better Auth adapter for Payload
   * @param options - Better Auth options
   * @returns A Better Auth adapter implementation
   */
  return (options: BetterAuthOptions): DBAdapter => {
    const {
      transformInput,
      transformOutput,
      convertWhereClause,
      convertSelect,
      convertSort,
      getCollectionSlug,
      singleIdQuery
    } = createTransform(options, adapterConfig.enableDebugLogs ?? false);

    function getJoinFieldNames(payload: any, collectionSlug: string) {
      const collection = payload.collections?.[collectionSlug]?.config;
      if (!collection?.flattenedFields) return new Set<string>();
      return new Set(
        collection.flattenedFields
          .filter((f: any) => f.type === "join")
          .map((f: any) => f.name)
      );
    }

    function buildPayloadJoins(
      join: JoinOption | undefined,
      payload: any,
      collectionSlug: string
    ) {
      if (!join) return undefined;
      const allowedJoinFields = getJoinFieldNames(payload, collectionSlug);
      const joins: Record<string, any> = {};

      Object.entries(join).forEach(([modelKey, config]) => {
        if (config === false) return;

        // Translate Better Auth model key (e.g. 'account') to Payload join field name (e.g. 'accounts')
        const joinFieldName = getCollectionSlug(modelKey as ModelKey);

        if (!allowedJoinFields.has(joinFieldName)) {
          debugLog([
            `join skipped: no join field '${joinFieldName}' (from model '${modelKey}') on ${collectionSlug}`
          ]);
          return;
        }

        if (config === true) {
          joins[joinFieldName] = {};
          return;
        }
        if (config && typeof config === "object") {
          joins[joinFieldName] = { ...config };
        }
      });

      return Object.keys(joins).length ? joins : undefined;
    }

    return {
      id: "payload-adapter",
      async transaction<R>(
        callback: (tx: Omit<DBAdapter, "transaction">) => Promise<R>
      ): Promise<R> {
        return await callback(this);
      },
      async create<T extends Record<string, any>, R = T>({
        model,
        data: values,
        select
      }: {
        model: string;
        data: T;
        select?: string[];
      }): Promise<R> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const transformedInput = transformInput({
          data: values,
          model: model as ModelKey,
          idType: adapterConfig.idType,
          payload
        });

        debugLog(["create", { collectionSlug, transformedInput, select }]);

        try {
          // Use depth: 0 for create to avoid populating relationship fields.
          // Populated relationships would bloat the session data stored in cookie cache.
          // This needs more testing and validation.
          const result = await payload.create({
            collection: collectionSlug,
            data: transformedInput,
            select: convertSelect(model as ModelKey, select),
            context: createAdapterContext({ model, operation: "create" }),
            depth: CREATE_QUERY_DEPTH
          });

          const transformedResult = transformOutput({
            doc: result,
            model: model as ModelKey,
            payload
          });

          debugLog([
            "create result",
            {
              collectionSlug,
              transformedResult,
              duration: `${Date.now() - start}ms`
            }
          ]);

          return transformedResult as R;
        } catch (error) {
          errorLog(["Error in creating:", model, error]);
          return null as R;
        }
      },
      async findOne<R>({
        model,
        where,
        select,
        join
      }: {
        model: string;
        where: Where[];
        select?: string[];
        join?: JoinOption;
      }): Promise<R | null> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        debugLog(["findOne", { collectionSlug, join }]);

        try {
          const singleId = singleIdQuery(payloadWhere);
          let result: Record<string, any> | null = null;
          const payloadJoins = buildPayloadJoins(join, payload, collectionSlug);

          if (singleId) {
            debugLog(["findOneByID", { collectionSlug, id: singleId }]);
            result = await payload.findByID({
              collection: collectionSlug,
              id: singleId,
              select: convertSelect(model as ModelKey, select),
              ...(payloadJoins &&
                Object.keys(payloadJoins).length > 0 && {
                  joins: payloadJoins
                }),
              context: createAdapterContext({
                model,
                operation: "findOneByID"
              }),
              depth: PAYLOAD_QUERY_DEPTH
            });
          } else {
            debugLog(["findOneByWhere", { collectionSlug, payloadWhere }]);
            const docs = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              select: convertSelect(model as ModelKey, select),
              ...(payloadJoins &&
                Object.keys(payloadJoins).length > 0 && {
                  joins: payloadJoins
                }),
              context: createAdapterContext({
                model,
                operation: "findOneByWhere"
              }),
              depth: PAYLOAD_QUERY_DEPTH,
              limit: 1
            });
            result = docs.docs[0];
          }

          const transformedResult = transformOutput<typeof result | null>({
            doc: result,
            model: model as ModelKey,
            payload
          });

          debugLog([
            "findOne result",
            {
              collectionSlug,
              transformedResult,
              duration: `${Date.now() - start}ms`
            }
          ]);

          return transformedResult as R;
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return null;
          }
          errorLog(["Error in findOne: ", error]);
          return null;
        }
      },
      async findMany<R>({
        model,
        where,
        limit = 10,
        sortBy,
        offset = 0,
        join
      }: {
        model: string;
        where?: Where[];
        limit?: number;
        sortBy?: {
          field: string;
          direction: "asc" | "desc";
        };
        offset?: number;
        join?: JoinOption;
      }): Promise<R[]> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        debugLog(["findMany", { collectionSlug, sortBy, limit, offset }]);

        try {
          let result: {
            docs: Record<string, any>[];
            totalDocs: number;
          } | null = null;

          const singleId = singleIdQuery(payloadWhere);
          const payloadJoins = buildPayloadJoins(join, payload, collectionSlug);
          if (singleId) {
            debugLog(["findManyBySingleID", { collectionSlug, id: singleId }]);
            const doc = await payload.findByID({
              collection: collectionSlug,
              id: singleId,
              ...(payloadJoins &&
                Object.keys(payloadJoins).length > 0 && {
                  joins: payloadJoins
                }),
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "findManyBySingleID"
              })
            });
            result = { docs: doc ? [doc] : [], totalDocs: doc ? 1 : 0 };
          } else {
            debugLog(["findManyByWhere", { collectionSlug, payloadWhere }]);
            const spill = offset % limit;
            const page = Math.floor(offset / limit) + 1;
            const fetchLimit = spill ? limit + spill : limit;

            const res = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              limit: fetchLimit,
              page: page,
              sort: convertSort(model as ModelKey, sortBy),
              ...(payloadJoins &&
                Object.keys(payloadJoins).length > 0 && {
                  joins: payloadJoins
                }),
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "findManyByWhere"
              })
            });
            result = {
              docs: res.docs.slice(spill, spill + limit),
              totalDocs: res.totalDocs
            };
          }

          const transformedResult =
            result?.docs.map((doc) =>
              transformOutput({
                doc,
                model: model as ModelKey,
                payload
              })
            ) ?? [];

          debugLog([
            "findMany result",
            {
              collectionSlug,
              transformedResult,
              duration: `${Date.now() - start}ms`
            }
          ]);

          return transformedResult as R[];
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return [] as R[];
          }
          errorLog(["Error in findMany: ", error]);
          return [] as R[];
        }
      },
      async update<R>({
        model,
        where,
        update
      }: {
        model: string;
        where: Where[];
        update: Record<string, unknown>;
      }): Promise<R | null> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        const transformedInput = transformInput({
          data: update,
          model: model as ModelKey,
          idType: adapterConfig.idType,
          payload
        });

        debugLog(["update", { collectionSlug, update }]);

        try {
          let result: Record<string, any> | null = null;
          const id = singleIdQuery(payloadWhere);

          if (id) {
            debugLog(["updateByID", { collectionSlug, id }]);
            result = await payload.update({
              collection: collectionSlug,
              id,
              data: transformedInput,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: "updateByID" })
            });
          } else {
            debugLog(["updateByWhere", { collectionSlug, payloadWhere }]);
            const doc = await payload.update({
              collection: collectionSlug,
              where: payloadWhere,
              data: transformedInput,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "updateByWhere"
              })
            });
            result = doc.docs[0];
          }

          const transformedResult = transformOutput<typeof result | null>({
            doc: result,
            model: model as ModelKey,
            payload
          });

          debugLog([
            "update-result",
            {
              collectionSlug,
              transformedResult,
              duration: `${Date.now() - start}ms`
            }
          ]);

          return transformedResult as R;
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return null;
          }
          errorLog(["Error in update: ", error]);
          return null;
        }
      },
      async updateMany({
        model,
        where,
        update
      }: {
        model: string;
        where: Where[];
        update: Record<string, unknown>;
      }): Promise<number> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        const transformedInput = transformInput({
          data: update,
          model: model as ModelKey,
          idType: adapterConfig.idType,
          payload
        });

        debugLog(["updateMany", { collectionSlug, payloadWhere, update }]);

        try {
          const { docs: updateResult } = await payload.update({
            collection: collectionSlug,
            where: payloadWhere,
            data: transformedInput,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: "updateMany" })
          });

          debugLog([
            "updateMany result",
            {
              collectionSlug,
              result: updateResult,
              duration: `${Date.now() - start}ms`
            }
          ]);

          return updateResult?.length || 0;
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return 0;
          }
          errorLog(["Error in updateMany: ", error]);
          return 0;
        }
      },
      async delete({
        model,
        where
      }: {
        model: string;
        where: Where[];
      }): Promise<void> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        debugLog(["delete", { collectionSlug }]);

        try {
          let deleteResult: {
            doc: Record<string, any> | null;
            errors: any[];
          } | null = null;

          const singleId = singleIdQuery(payloadWhere);
          if (singleId) {
            debugLog(["deleteByID", { collectionSlug, id: singleId }]);
            const doc = await payload.delete({
              collection: collectionSlug,
              id: singleId,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: "deleteByID" })
            });
            deleteResult = { doc, errors: [] };
          } else {
            debugLog(["deleteByWhere", { collectionSlug, payloadWhere }]);
            const doc = await payload.delete({
              collection: collectionSlug,
              where: payloadWhere,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "deleteByWhere"
              })
            });
            deleteResult = { doc: doc.docs[0], errors: [] };
          }

          debugLog([
            "delete result",
            {
              collectionSlug,
              result: deleteResult,
              duration: `${Date.now() - start}ms`
            }
          ]);
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return;
          }
          errorLog(["Error in delete: ", error]);
        }
      },
      async deleteMany({
        model,
        where
      }: {
        model: string;
        where: Where[];
      }): Promise<number> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        debugLog(["deleteMany", { collectionSlug, payloadWhere }]);

        try {
          const deleteResult = await payload.delete({
            collection: collectionSlug,
            where: payloadWhere,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: "deleteMany" })
          });

          debugLog([
            "deleteMany result",
            {
              collectionSlug,
              result: deleteResult,
              duration: `${Date.now() - start}ms`
            }
          ]);

          return deleteResult.docs.length;
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return 0;
          }
          errorLog(["Error in deleteMany: ", error]);
          return 0;
        }
      },
      async count({
        model,
        where
      }: {
        model: string;
        where?: Where[];
      }): Promise<number> {
        const start = Date.now();
        const payload = await resolvePayloadClient();
        const collectionSlug = getCollectionSlug(model as ModelKey);

        // Validate collection exists before proceeding
        await validateCollection(payload, collectionSlug, model);

        const payloadWhere = convertWhereClause({
          idType: adapterConfig.idType,
          model: model as ModelKey,
          where,
          payload
        });

        debugLog(["count", { collectionSlug, payloadWhere }]);

        try {
          const result = await payload.count({
            collection: collectionSlug,
            where: payloadWhere,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: "count" })
          });

          debugLog([
            "count result",
            {
              collectionSlug,
              result: { totalDocs: result.totalDocs },
              duration: `${Date.now() - start}ms`
            }
          ]);

          return result.totalDocs;
        } catch (error) {
          if (
            error instanceof Error &&
            "status" in error &&
            error.status === 404
          ) {
            return 0;
          }
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
          overwrite: true
        };
      },
      options: {
        adapterConfig: {} as any,
        ...adapterConfig
      }
    };
  };
};

export { generateSchema, payloadAdapter };
