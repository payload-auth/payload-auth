import { DBAdapter } from "@better-auth/core/db/adapter";
import type { BetterAuthOptions, Where } from "better-auth";
import { BetterAuthError } from "better-auth";
import {
  type BasePayload,
  type CollectionSlug,
  flattenAllFields
} from "payload";
import { ModelKey } from "../generated-types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import type { PayloadAdapter } from "./types";

export const BETTER_AUTH_CONTEXT_KEY = "payload-db-adapter";
const PAYLOAD_QUERY_DEPTH = 0;
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
    console.error("[payload-db-adapter]", ...message);
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
  let cachedPayload: BasePayload | null = null;

  async function resolvePayloadClient() {
    if (cachedPayload) return cachedPayload;

    const payload =
      typeof payloadClient === "function"
        ? await payloadClient()
        : await payloadClient;
    if (!payload.config?.custom?.hasBetterAuthPlugin) {
      throw new BetterAuthError(
        "Payload is not configured with the better-auth plugin. Please add the plugin to your payload config."
      );
    }
    cachedPayload = payload;
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
      getForwardRelationFieldNames,
      singleIdQuery
    } = createTransform(options, adapterConfig.enableDebugLogs ?? false);

    /**
     * Returns all join fields from a collection's flattenedFields.
     * Each entry maps the join field's name to the collection it targets.
     */
    function getJoinFields(
      payload: any,
      collectionSlug: string
    ): { name: string; collection: string }[] {
      const collection = payload.collections?.[collectionSlug]?.config;
      if (!collection?.flattenedFields) return [];
      return collection.flattenedFields
        .filter((f: any) => f.type === "join")
        .map((f: any) => ({ name: f.name as string, collection: f.collection as string }));
    }

    /**
     * Resolves a Better Auth model key to the corresponding Payload join field
     * name on the given collection. Matches by the join field's target
     * `collection` property rather than by name, avoiding singular/plural
     * naming mismatches (e.g. model key "account" → join field "account"
     * targeting collection "accounts").
     *
     * Returns the join field name if found, or null if there is no reverse
     * join field for this model on the collection (indicating a forward join).
     */
    function resolveJoinFieldName(
      payload: any,
      collectionSlug: string,
      modelKey: string
    ): string | null {
      const targetCollectionSlug = getCollectionSlug(modelKey as ModelKey);
      const joinFields = getJoinFields(payload, collectionSlug);
      const match = joinFields.find((f) => f.collection === targetCollectionSlug);
      return match?.name ?? null;
    }

    function buildPayloadJoins(
      join: JoinOption | undefined,
      payload: any,
      collectionSlug: string
    ) {
      if (!join) return undefined;
      const joins: Record<string, any> = {};

      Object.entries(join).forEach(([modelKey, config]) => {
        if (config === false) return;

        // Look up the join field by its target collection, not by name.
        // This correctly handles the singular/plural mismatch where the
        // model key is "account" but the collection slug is "accounts".
        const joinFieldName = resolveJoinFieldName(
          payload,
          collectionSlug,
          modelKey
        );

        if (!joinFieldName) {
          // This is only debug-level here because a forward join is still
          // possible — populateForwardJoins re-checks this model and, if it
          // *also* can't resolve a forward relationship field, promotes
          // this same "no join field found" condition to errorLog since at
          // that point the explicitly requested join has genuinely failed.
          debugLog([
            `join skipped (reverse): no join field targeting '${getCollectionSlug(modelKey as ModelKey)}' on ${collectionSlug} — will attempt forward join`
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

    /**
     * Populates forward (many-to-one) relationship joins that Payload's native
     * join fields can't handle. Payload join fields only support reverse
     * (one-to-many) relationships. When Better Auth requests a forward join
     * (e.g. `join: { user: true }` on an account query), we need to make a
     * separate query to populate the related document.
     */
    async function populateForwardJoins(
      doc: Record<string, any>,
      model: string,
      join: JoinOption,
      payload: BasePayload,
      collectionSlug: string
    ) {
      const collection = payload.collections[collectionSlug];
      if (!collection) return;

      const allFields = flattenAllFields({ fields: collection.config.fields });

      for (const [joinModelKey, joinConfig] of Object.entries(join)) {
        if (joinConfig === false) continue;

        // Skip if already handled by a Payload join field (reverse relationship).
        // Use resolveJoinFieldName which matches by target collection, not name.
        if (resolveJoinFieldName(payload, collectionSlug, joinModelKey)) continue;

        const joinSlug = getCollectionSlug(joinModelKey as ModelKey);

        // Prefer schema-derived field selection: the BA schema's
        // `references.model` tells us exactly which field BetterAuth
        // intends for this forward join, disambiguating cases where a
        // collection has multiple relationship fields targeting the same
        // collection (e.g. session.user and session.impersonatedBy both
        // target "users" — picking the first Payload relationTo match
        // would be luck of field order).
        const schemaFieldNames = getForwardRelationFieldNames(
          model as ModelKey,
          joinSlug,
          joinModelKey
        );
        let relField: (typeof allFields)[number] | undefined;

        if (schemaFieldNames.length > 0) {
          if (schemaFieldNames.length > 1) {
            errorLog([
              `forward join field selection ambiguous for '${joinModelKey}' on ${collectionSlug}: schema has multiple candidate fields [${schemaFieldNames.join(", ")}] targeting '${joinSlug}' — using '${schemaFieldNames[0]}'`
            ]);
          }
          relField = allFields.find((f) => f.name === schemaFieldNames[0]);
        }

        // Fallback: first Payload relationship/upload field whose
        // relationTo matches the joined collection. Used when the BA
        // schema has no references.model match (e.g. custom fields not
        // declared in the schema).
        if (!relField) {
          relField = allFields.find((f) => {
            if (f.type !== "relationship" && f.type !== "upload") return false;
            if (!("relationTo" in f)) return false;
            if (Array.isArray(f.relationTo))
              return f.relationTo.includes(joinSlug);
            return f.relationTo === joinSlug;
          });
        }
        if (!relField) {
          // Neither a reverse join field (checked above via
          // resolveJoinFieldName) nor a forward relationship field (schema
          // or Payload relationTo fallback) could be found for this model,
          // even though it was explicitly requested in the join option.
          // This is a real misconfiguration/mismatch worth surfacing —
          // promote from the buildPayloadJoins debugLog ("will attempt
          // forward join") to an errorLog now that we know the forward
          // attempt has nothing to work with either.
          errorLog([
            `join requested for '${joinModelKey}' on ${collectionSlug} but no reverse join field or forward relationship field could be resolved`
          ]);
          continue;
        }

        const relId = doc[relField.name];
        if (!relId) continue;
        // Already populated
        if (typeof relId === "object" && relId !== null && "id" in relId)
          continue;
        // Only populate primitive IDs
        if (typeof relId !== "string" && typeof relId !== "number") continue;

        try {
          const relDoc = await payload.findByID({
            collection: joinSlug as CollectionSlug,
            id: relId,
            depth: 0,
            context: createAdapterContext({
              model: joinModelKey,
              operation: "forwardJoin"
            })
          });
          if (relDoc) {
            // Transform the joined doc the same way the parent doc will be
            // transformed (dates → Date objects, nested IDs → strings,
            // renames applied) so forward-joined docs match the shape of
            // reverse-joined docs instead of leaking raw Payload output.
            doc[relField.name] = transformOutput({
              doc: relDoc,
              model: joinModelKey as ModelKey,
              payload
            });
          }
        } catch (error) {
          errorLog([
            `forward join lookup failed for '${joinModelKey}' on ${collectionSlug} (relation id: ${relId}):`,
            error
          ]);
        }
      }
    }

    return {
      id: "payload-adapter",
      async transaction<R>(
        callback: (tx: Omit<DBAdapter, "transaction">) => Promise<R>
      ): Promise<R> {
        // Payload CMS manages transactions at the request level via
        // initTransaction/commitTransaction/killTransaction on the req object.
        // The adapter doesn't have access to a req object here, so we delegate
        // to Payload's per-operation transaction handling and ensure errors
        // propagate correctly so Better Auth can handle rollback semantics.
        try {
          return await callback(this);
        } catch (error) {
          errorLog(["Transaction callback failed:", error]);
          throw error;
        }
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
            select: convertSelect(model as ModelKey, select, payload),
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
          throw error;
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
          const hasReverseJoins = payloadJoins && Object.keys(payloadJoins).length > 0;

          if (singleId) {
            debugLog(["findOneByID", { collectionSlug, id: singleId }]);
            result = await payload.findByID({
              collection: collectionSlug,
              id: singleId,
              select: convertSelect(model as ModelKey, select, payload),
              ...(hasReverseJoins && { joins: payloadJoins }),
              context: createAdapterContext({
                model,
                operation: "findOneByID"
              }),
              // Reverse joins require depth >= 1 so Payload resolves them
              depth: hasReverseJoins ? 1 : PAYLOAD_QUERY_DEPTH
            });
          } else {
            debugLog(["findOneByWhere", { collectionSlug, payloadWhere }]);
            const docs = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              select: convertSelect(model as ModelKey, select, payload),
              ...(hasReverseJoins && { joins: payloadJoins }),
              context: createAdapterContext({
                model,
                operation: "findOneByWhere"
              }),
              depth: hasReverseJoins ? 1 : PAYLOAD_QUERY_DEPTH,
              limit: 1
            });
            result = docs.docs[0];
          }

          // Populate forward (many-to-one) relationship joins that Payload's
          // native join fields can't handle (e.g. account → user).
          if (result && join) {
            await populateForwardJoins(
              result,
              model,
              join,
              payload,
              collectionSlug
            );
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
          throw error;
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
          const hasReverseJoins = payloadJoins && Object.keys(payloadJoins).length > 0;
          if (singleId) {
            debugLog(["findManyBySingleID", { collectionSlug, id: singleId }]);
            const doc = await payload.findByID({
              collection: collectionSlug,
              id: singleId,
              ...(hasReverseJoins && { joins: payloadJoins }),
              depth: hasReverseJoins ? 1 : PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "findManyBySingleID"
              })
            });
            result = { docs: doc ? [doc] : [], totalDocs: doc ? 1 : 0 };
          } else {
            debugLog(["findManyByWhere", { collectionSlug, payloadWhere }]);
            // Fetch from page 1 with enough items to cover offset + limit,
            // then slice the exact window. This avoids the misaligned
            // page/limit math that broke when offset % limit != 0 (P1-3).
            const fetchLimit = offset + limit;

            const res = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              limit: fetchLimit,
              page: 1,
              sort: convertSort(model as ModelKey, sortBy, payload),
              ...(hasReverseJoins && { joins: payloadJoins }),
              depth: hasReverseJoins ? 1 : PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "findManyByWhere"
              })
            });
            result = {
              docs: res.docs.slice(offset, offset + limit),
              totalDocs: res.totalDocs
            };
          }

          // Populate forward (many-to-one) relationship joins that Payload's
          // native join fields can't handle (e.g. session → user).
          if (join && result?.docs) {
            for (const doc of result.docs) {
              await populateForwardJoins(
                doc,
                model,
                join,
                payload,
                collectionSlug
              );
            }
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
          throw error;
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
          throw error;
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
          throw error;
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
          throw error;
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
          throw error;
        }
      },
      async consumeOne<R>({
        model,
        where
      }: {
        model: string;
        where: Where[];
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

        debugLog(["consumeOne", { collectionSlug, payloadWhere }]);

        try {
          const singleId = singleIdQuery(payloadWhere);
          let found: Record<string, any> | null = null;

          if (singleId) {
            found = await payload
              .findByID({
                collection: collectionSlug,
                id: singleId,
                depth: PAYLOAD_QUERY_DEPTH,
                context: createAdapterContext({
                  model,
                  operation: "consumeOneRead"
                })
              })
              .catch((error) => {
                if (
                  error instanceof Error &&
                  "status" in error &&
                  error.status === 404
                ) {
                  return null;
                }
                throw error;
              });
          } else {
            const docs = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              depth: PAYLOAD_QUERY_DEPTH,
              limit: 1,
              context: createAdapterContext({
                model,
                operation: "consumeOneRead"
              })
            });
            found = docs.docs[0] ?? null;
          }

          if (!found) return null;

          // Delete by the found row's id (not the original where clause) so we
          // never delete additional rows that also match a non-unique
          // predicate. This also closes the double-consume window: a second
          // concurrent caller that read this same row before it was deleted
          // will get a 404 on delete-by-id and fall through to `null` below,
          // instead of deleting a *different* row that also matched `where`.
          try {
            await payload.delete({
              collection: collectionSlug,
              id: found.id,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({
                model,
                operation: "consumeOneDelete"
              })
            });
          } catch (error) {
            if (
              error instanceof Error &&
              "status" in error &&
              error.status === 404
            ) {
              return null;
            }
            throw error;
          }

          const transformedResult = transformOutput<typeof found | null>({
            doc: found,
            model: model as ModelKey,
            payload
          });

          debugLog([
            "consumeOne result",
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
          errorLog(["Error in consumeOne: ", error]);
          throw error;
        }
      },
      async incrementOne<R>({
        model,
        where,
        increment,
        set
      }: {
        model: string;
        where: Where[];
        increment: Record<string, number>;
        set?: Record<string, unknown>;
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

        debugLog(["incrementOne", { collectionSlug, payloadWhere, increment, set }]);

        try {
          const singleId = singleIdQuery(payloadWhere);
          let current: Record<string, any> | null = null;

          if (singleId) {
            current = await payload
              .findByID({
                collection: collectionSlug,
                id: singleId,
                depth: PAYLOAD_QUERY_DEPTH,
                context: createAdapterContext({
                  model,
                  operation: "incrementOneRead"
                })
              })
              .catch((error) => {
                if (
                  error instanceof Error &&
                  "status" in error &&
                  error.status === 404
                ) {
                  return null;
                }
                throw error;
              });
          } else {
            const docs = await payload.find({
              collection: collectionSlug,
              where: payloadWhere,
              depth: PAYLOAD_QUERY_DEPTH,
              limit: 1,
              context: createAdapterContext({
                model,
                operation: "incrementOneRead"
              })
            });
            current = docs.docs[0] ?? null;
          }

          // The where clause is both selector and guard (e.g. a `remaining gt
          // 0` comparison) — if nothing matches at read time, the guard has
          // already failed.
          if (!current) return null;

          const data: Record<string, unknown> = { ...(set ?? {}) };
          for (const [field, delta] of Object.entries(increment)) {
            const currentValue =
              typeof current[field] === "number"
                ? current[field]
                : Number(current[field] ?? 0);
            data[field] = currentValue + delta;
          }

          const transformedInput = transformInput({
            data,
            model: model as ModelKey,
            idType: adapterConfig.idType,
            payload
          });

          // Re-apply the original where clause as a compare-and-swap guard on
          // the update: the update only affects the row if it still matches
          // `where` (e.g. the counter is still above the guard threshold),
          // narrowing — though not fully eliminating — the race window
          // between the read above and this write.
          const doc = await payload.update({
            collection: collectionSlug,
            where: payloadWhere,
            data: transformedInput,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: "incrementOne" })
          });

          const updated = doc.docs[0] ?? null;
          if (!updated) return null;

          const transformedResult = transformOutput<typeof updated | null>({
            doc: updated,
            model: model as ModelKey,
            payload
          });

          debugLog([
            "incrementOne result",
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
          errorLog(["Error in incrementOne: ", error]);
          throw error;
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
          throw error;
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
