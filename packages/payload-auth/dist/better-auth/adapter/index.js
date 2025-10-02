import { BetterAuthError } from "better-auth";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
export const BETTER_AUTH_CONTEXT_KEY = 'payload-db-adapter';
const PAYLOAD_QUERY_DEPTH = 0;
/**
 * Payload adapter for Better Auth
 *
 * This adapter connects Better Auth to Payload CMS, allowing authentication
 * operations to be performed against Payload collections.
 *
 * @param payloadClient - The Payload CMS client instance or a function that returns it
 * @param config - Configuration options for the adapter
 * @returns A function that creates a Better Auth adapter
 */ const payloadAdapter = ({ payloadClient, enableDebugLogs = false, idType })=>{
    /**
   * Logs debug messages if debug logging is enabled
   * @param message - The message to log
   */ function debugLog(message) {
        if (enableDebugLogs) {
            console.log('[payload-db-adapter]', ...message);
        }
    }
    /**
   * Logs error messages
   * @param message - The error message to log
   */ function errorLog(message) {
        console.error(`[payload-db-adapter]`, ...message);
    }
    /**
   * Throws an error when a collection slug doesn't exist
   * @param model - The model name that couldn't be found
   * @throws {BetterAuthError} When the collection doesn't exist
   * @returns Never - Function always throws
   */ function collectionSlugError(model) {
        throw new BetterAuthError(`Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`);
    }
    /**
   * Validates that a collection exists in Payload
   * @param payload - The Payload client instance
   * @param collectionSlug - The collection slug to validate
   * @param model - The model name for error messages
   * @throws {BetterAuthError} When the collection doesn't exist
   */ async function validateCollection(payload, collectionSlug, model) {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
            collectionSlugError(model);
        }
    }
    /**
   * Creates a context object for Payload operations
   * @param data - Data to include in the context
   * @returns The context object with Better Auth metadata
   */ const createAdapterContext = (data)=>({
            [BETTER_AUTH_CONTEXT_KEY]: {
                ...data
            }
        });
    /**
   * Resolves the Payload client, handling both function and direct references
   * @returns The resolved Payload client
   * @throws {BetterAuthError} When Better Auth plugin is not configured
   */ async function resolvePayloadClient() {
        const payload = typeof payloadClient === 'function' ? await payloadClient() : await payloadClient;
        if (!payload.config?.custom?.hasBetterAuthPlugin) {
            throw new BetterAuthError(`Payload is not configured with the better-auth plugin. Please add the plugin to your payload config.`);
        }
        return payload;
    }
    /**
   * Creates and returns a Better Auth adapter for Payload
   * @param options - Better Auth options
   * @returns A Better Auth adapter implementation
   */ return (options)=>{
        const { transformInput, transformOutput, convertWhereClause, convertSelect, convertSort, getCollectionSlug, singleIdQuery } = createTransform(options, enableDebugLogs);
        return {
            id: 'payload-adapter',
            async create ({ model, data: values, select }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const transformedInput = transformInput({
                    data: values,
                    model: model,
                    idType: idType
                });
                debugLog([
                    'create',
                    {
                        collectionSlug,
                        transformedInput,
                        select
                    }
                ]);
                try {
                    const result = await payload.create({
                        collection: collectionSlug,
                        data: transformedInput,
                        select: convertSelect(model, select),
                        context: createAdapterContext({
                            model,
                            operation: 'create'
                        }),
                        depth: PAYLOAD_QUERY_DEPTH
                    });
                    const transformedResult = transformOutput({
                        doc: result,
                        model: model
                    });
                    debugLog([
                        'create result',
                        {
                            collectionSlug,
                            transformedResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return transformedResult;
                } catch (error) {
                    errorLog([
                        'Error in creating:',
                        model,
                        error
                    ]);
                    return null;
                }
            },
            async findOne ({ model, where, select }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                debugLog([
                    'findOne',
                    {
                        collectionSlug
                    }
                ]);
                try {
                    const singleId = singleIdQuery(payloadWhere);
                    let result = null;
                    if (singleId) {
                        debugLog([
                            'findOneByID',
                            {
                                collectionSlug,
                                id: singleId
                            }
                        ]);
                        result = await payload.findByID({
                            collection: collectionSlug,
                            id: singleId,
                            select: convertSelect(model, select),
                            context: createAdapterContext({
                                model,
                                operation: 'findOneByID'
                            }),
                            depth: PAYLOAD_QUERY_DEPTH
                        });
                    } else {
                        debugLog([
                            'findOneByWhere',
                            {
                                collectionSlug,
                                payloadWhere
                            }
                        ]);
                        const docs = await payload.find({
                            collection: collectionSlug,
                            where: payloadWhere,
                            select: convertSelect(model, select),
                            context: createAdapterContext({
                                model,
                                operation: 'findOneByWhere'
                            }),
                            depth: PAYLOAD_QUERY_DEPTH,
                            limit: 1
                        });
                        result = docs.docs[0];
                    }
                    const transformedResult = transformOutput({
                        doc: result,
                        model: model
                    });
                    debugLog([
                        'findOne result',
                        {
                            collectionSlug,
                            transformedResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return transformedResult;
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return null;
                    }
                    errorLog([
                        'Error in findOne: ',
                        error
                    ]);
                    return null;
                }
            },
            async findMany ({ model, where, limit = 10, sortBy, offset = 0 }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                debugLog([
                    'findMany',
                    {
                        collectionSlug,
                        sortBy,
                        limit,
                        offset
                    }
                ]);
                try {
                    let result = null;
                    const singleId = singleIdQuery(payloadWhere);
                    if (singleId) {
                        debugLog([
                            'findManyBySingleID',
                            {
                                collectionSlug,
                                id: singleId
                            }
                        ]);
                        const doc = await payload.findByID({
                            collection: collectionSlug,
                            id: singleId,
                            depth: PAYLOAD_QUERY_DEPTH,
                            context: createAdapterContext({
                                model,
                                operation: 'findManyBySingleID'
                            })
                        });
                        result = {
                            docs: doc ? [
                                doc
                            ] : [],
                            totalDocs: doc ? 1 : 0
                        };
                    } else {
                        debugLog([
                            'findManyByWhere',
                            {
                                collectionSlug,
                                payloadWhere
                            }
                        ]);
                        const spill = offset % limit;
                        const page = Math.floor(offset / limit) + 1;
                        const fetchLimit = spill ? limit + spill : limit;
                        const res = await payload.find({
                            collection: collectionSlug,
                            where: payloadWhere,
                            limit: fetchLimit,
                            page: page,
                            sort: convertSort(model, sortBy),
                            depth: PAYLOAD_QUERY_DEPTH,
                            context: createAdapterContext({
                                model,
                                operation: 'findManyByWhere'
                            })
                        });
                        result = {
                            docs: res.docs.slice(spill, spill + limit),
                            totalDocs: res.totalDocs
                        };
                    }
                    const transformedResult = result?.docs.map((doc)=>transformOutput({
                            doc,
                            model: model
                        })) ?? [];
                    debugLog([
                        'findMany result',
                        {
                            collectionSlug,
                            transformedResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return transformedResult;
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return [];
                    }
                    errorLog([
                        'Error in findMany: ',
                        error
                    ]);
                    return [];
                }
            },
            async update ({ model, where, update }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                const transformedInput = transformInput({
                    data: update,
                    model: model,
                    idType: idType
                });
                debugLog([
                    'update',
                    {
                        collectionSlug,
                        update
                    }
                ]);
                try {
                    let result = null;
                    const id = singleIdQuery(payloadWhere);
                    if (id) {
                        debugLog([
                            'updateByID',
                            {
                                collectionSlug,
                                id
                            }
                        ]);
                        result = await payload.update({
                            collection: collectionSlug,
                            id,
                            data: transformedInput,
                            depth: PAYLOAD_QUERY_DEPTH,
                            context: createAdapterContext({
                                model,
                                operation: 'updateByID'
                            })
                        });
                    } else {
                        debugLog([
                            'updateByWhere',
                            {
                                collectionSlug,
                                payloadWhere
                            }
                        ]);
                        const doc = await payload.update({
                            collection: collectionSlug,
                            where: payloadWhere,
                            data: transformedInput,
                            depth: PAYLOAD_QUERY_DEPTH,
                            context: createAdapterContext({
                                model,
                                operation: 'updateByWhere'
                            })
                        });
                        result = doc.docs[0];
                    }
                    const transformedResult = transformOutput({
                        doc: result,
                        model: model
                    });
                    debugLog([
                        'update-result',
                        {
                            collectionSlug,
                            transformedResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return transformedResult;
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return null;
                    }
                    errorLog([
                        'Error in update: ',
                        error
                    ]);
                    return null;
                }
            },
            async updateMany ({ model, where, update }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                const transformedInput = transformInput({
                    data: update,
                    model: model,
                    idType: idType
                });
                debugLog([
                    'updateMany',
                    {
                        collectionSlug,
                        payloadWhere,
                        update
                    }
                ]);
                try {
                    const { docs: updateResult } = await payload.update({
                        collection: collectionSlug,
                        where: payloadWhere,
                        data: transformedInput,
                        depth: PAYLOAD_QUERY_DEPTH,
                        context: createAdapterContext({
                            model,
                            operation: 'updateMany'
                        })
                    });
                    debugLog([
                        'updateMany result',
                        {
                            collectionSlug,
                            result: updateResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return updateResult?.length || 0;
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return 0;
                    }
                    errorLog([
                        'Error in updateMany: ',
                        error
                    ]);
                    return 0;
                }
            },
            async delete ({ model, where }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                debugLog([
                    'delete',
                    {
                        collectionSlug
                    }
                ]);
                try {
                    let deleteResult = null;
                    const singleId = singleIdQuery(payloadWhere);
                    if (singleId) {
                        debugLog([
                            'deleteByID',
                            {
                                collectionSlug,
                                id: singleId
                            }
                        ]);
                        const doc = await payload.delete({
                            collection: collectionSlug,
                            id: singleId,
                            depth: PAYLOAD_QUERY_DEPTH,
                            context: createAdapterContext({
                                model,
                                operation: 'deleteByID'
                            })
                        });
                        deleteResult = {
                            doc,
                            errors: []
                        };
                    } else {
                        debugLog([
                            'deleteByWhere',
                            {
                                collectionSlug,
                                payloadWhere
                            }
                        ]);
                        const doc = await payload.delete({
                            collection: collectionSlug,
                            where: payloadWhere,
                            depth: PAYLOAD_QUERY_DEPTH,
                            context: createAdapterContext({
                                model,
                                operation: 'deleteByWhere'
                            })
                        });
                        deleteResult = {
                            doc: doc.docs[0],
                            errors: []
                        };
                    }
                    debugLog([
                        'delete result',
                        {
                            collectionSlug,
                            result: deleteResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return;
                    }
                    errorLog([
                        'Error in delete: ',
                        error
                    ]);
                }
            },
            async deleteMany ({ model, where }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                debugLog([
                    'deleteMany',
                    {
                        collectionSlug,
                        payloadWhere
                    }
                ]);
                try {
                    const deleteResult = await payload.delete({
                        collection: collectionSlug,
                        where: payloadWhere,
                        depth: PAYLOAD_QUERY_DEPTH,
                        context: createAdapterContext({
                            model,
                            operation: 'deleteMany'
                        })
                    });
                    debugLog([
                        'deleteMany result',
                        {
                            collectionSlug,
                            result: deleteResult,
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return deleteResult.docs.length;
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return 0;
                    }
                    errorLog([
                        'Error in deleteMany: ',
                        error
                    ]);
                    return 0;
                }
            },
            async count ({ model, where }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const payloadWhere = convertWhereClause({
                    idType: idType,
                    model: model,
                    where
                });
                debugLog([
                    'count',
                    {
                        collectionSlug,
                        payloadWhere
                    }
                ]);
                try {
                    const result = await payload.count({
                        collection: collectionSlug,
                        where: payloadWhere,
                        depth: PAYLOAD_QUERY_DEPTH,
                        context: createAdapterContext({
                            model,
                            operation: 'count'
                        })
                    });
                    debugLog([
                        'count result',
                        {
                            collectionSlug,
                            result: {
                                totalDocs: result.totalDocs
                            },
                            duration: `${Date.now() - start}ms`
                        }
                    ]);
                    return result.totalDocs;
                } catch (error) {
                    if (error instanceof Error && 'status' in error && error.status === 404) {
                        return 0;
                    }
                    errorLog([
                        'Error in count: ',
                        error
                    ]);
                    return 0;
                }
            },
            createSchema: async (options, file)=>{
                const schemaCode = await generateSchema(options);
                return {
                    code: schemaCode,
                    path: file || 'schema.ts',
                    append: false,
                    overwrite: true
                };
            },
            transaction: async (fn)=>{
                // Payload doesn't support transactions in the same way as SQL databases
                // Execute the callback directly, passing a no-op transaction object
                return await fn({});
            },
            options: {
                adapterConfig: {}
            }
        };
    };
};
export { generateSchema, payloadAdapter };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9hZGFwdGVyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckF1dGhFcnJvciB9IGZyb20gJ2JldHRlci1hdXRoJ1xuaW1wb3J0IHR5cGUgeyBBZGFwdGVyLCBCZXR0ZXJBdXRoT3B0aW9ucywgV2hlcmUgfSBmcm9tICdiZXR0ZXItYXV0aCdcbmltcG9ydCB7IGdlbmVyYXRlU2NoZW1hIH0gZnJvbSAnLi9nZW5lcmF0ZS1zY2hlbWEnXG5pbXBvcnQgeyBjcmVhdGVUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSdcbmltcG9ydCB0eXBlIHsgUGF5bG9hZEFkYXB0ZXIgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgQmFzZVBheWxvYWQgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHsgQmV0dGVyQXV0aFNjaGVtYXMgfSBmcm9tICdAL2luZGV4J1xuaW1wb3J0IHsgTW9kZWxLZXkgfSBmcm9tICcuLi9nZW5lcmF0ZWQtdHlwZXMnXG5cbmV4cG9ydCBjb25zdCBCRVRURVJfQVVUSF9DT05URVhUX0tFWSA9ICdwYXlsb2FkLWRiLWFkYXB0ZXInXG5jb25zdCBQQVlMT0FEX1FVRVJZX0RFUFRIID0gMFxuXG4vKipcbiAqIFBheWxvYWQgYWRhcHRlciBmb3IgQmV0dGVyIEF1dGhcbiAqXG4gKiBUaGlzIGFkYXB0ZXIgY29ubmVjdHMgQmV0dGVyIEF1dGggdG8gUGF5bG9hZCBDTVMsIGFsbG93aW5nIGF1dGhlbnRpY2F0aW9uXG4gKiBvcGVyYXRpb25zIHRvIGJlIHBlcmZvcm1lZCBhZ2FpbnN0IFBheWxvYWQgY29sbGVjdGlvbnMuXG4gKlxuICogQHBhcmFtIHBheWxvYWRDbGllbnQgLSBUaGUgUGF5bG9hZCBDTVMgY2xpZW50IGluc3RhbmNlIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGl0XG4gKiBAcGFyYW0gY29uZmlnIC0gQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgYWRhcHRlclxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBCZXR0ZXIgQXV0aCBhZGFwdGVyXG4gKi9cbmNvbnN0IHBheWxvYWRBZGFwdGVyOiBQYXlsb2FkQWRhcHRlciA9ICh7IHBheWxvYWRDbGllbnQsIGVuYWJsZURlYnVnTG9ncyA9IGZhbHNlLCBpZFR5cGUgfSkgPT4ge1xuICAvKipcbiAgICogTG9ncyBkZWJ1ZyBtZXNzYWdlcyBpZiBkZWJ1ZyBsb2dnaW5nIGlzIGVuYWJsZWRcbiAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBsb2dcbiAgICovXG4gIGZ1bmN0aW9uIGRlYnVnTG9nKG1lc3NhZ2U6IGFueVtdKSB7XG4gICAgaWYgKGVuYWJsZURlYnVnTG9ncykge1xuICAgICAgY29uc29sZS5sb2coJ1twYXlsb2FkLWRiLWFkYXB0ZXJdJywgLi4ubWVzc2FnZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBlcnJvciBtZXNzYWdlc1xuICAgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIGxvZ1xuICAgKi9cbiAgZnVuY3Rpb24gZXJyb3JMb2cobWVzc2FnZTogYW55W10pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbcGF5bG9hZC1kYi1hZGFwdGVyXWAsIC4uLm1lc3NhZ2UpXG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIHdoZW4gYSBjb2xsZWN0aW9uIHNsdWcgZG9lc24ndCBleGlzdFxuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwgbmFtZSB0aGF0IGNvdWxkbid0IGJlIGZvdW5kXG4gICAqIEB0aHJvd3Mge0JldHRlckF1dGhFcnJvcn0gV2hlbiB0aGUgY29sbGVjdGlvbiBkb2Vzbid0IGV4aXN0XG4gICAqIEByZXR1cm5zIE5ldmVyIC0gRnVuY3Rpb24gYWx3YXlzIHRocm93c1xuICAgKi9cbiAgZnVuY3Rpb24gY29sbGVjdGlvblNsdWdFcnJvcihtb2RlbDogc3RyaW5nKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBCZXR0ZXJBdXRoRXJyb3IoYENvbGxlY3Rpb24gJHttb2RlbH0gZG9lcyBub3QgZXhpc3QuIFBsZWFzZSBjaGVjayB5b3VyIHBheWxvYWQgY29sbGVjdGlvbiBzbHVncyBtYXRjaCB0aGUgYmV0dGVyIGF1dGggc2NoZW1hYClcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgdGhhdCBhIGNvbGxlY3Rpb24gZXhpc3RzIGluIFBheWxvYWRcbiAgICogQHBhcmFtIHBheWxvYWQgLSBUaGUgUGF5bG9hZCBjbGllbnQgaW5zdGFuY2VcbiAgICogQHBhcmFtIGNvbGxlY3Rpb25TbHVnIC0gVGhlIGNvbGxlY3Rpb24gc2x1ZyB0byB2YWxpZGF0ZVxuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwgbmFtZSBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICogQHRocm93cyB7QmV0dGVyQXV0aEVycm9yfSBXaGVuIHRoZSBjb2xsZWN0aW9uIGRvZXNuJ3QgZXhpc3RcbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkOiBhbnksIGNvbGxlY3Rpb25TbHVnOiBzdHJpbmcsIG1vZGVsOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWNvbGxlY3Rpb25TbHVnIHx8ICEoY29sbGVjdGlvblNsdWcgaW4gcGF5bG9hZC5jb2xsZWN0aW9ucykpIHtcbiAgICAgIGNvbGxlY3Rpb25TbHVnRXJyb3IobW9kZWwpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb250ZXh0IG9iamVjdCBmb3IgUGF5bG9hZCBvcGVyYXRpb25zXG4gICAqIEBwYXJhbSBkYXRhIC0gRGF0YSB0byBpbmNsdWRlIGluIHRoZSBjb250ZXh0XG4gICAqIEByZXR1cm5zIFRoZSBjb250ZXh0IG9iamVjdCB3aXRoIEJldHRlciBBdXRoIG1ldGFkYXRhXG4gICAqL1xuICBjb25zdCBjcmVhdGVBZGFwdGVyQ29udGV4dCA9IChkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiAoe1xuICAgIFtCRVRURVJfQVVUSF9DT05URVhUX0tFWV06IHsgLi4uZGF0YSB9XG4gIH0pXG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSBQYXlsb2FkIGNsaWVudCwgaGFuZGxpbmcgYm90aCBmdW5jdGlvbiBhbmQgZGlyZWN0IHJlZmVyZW5jZXNcbiAgICogQHJldHVybnMgVGhlIHJlc29sdmVkIFBheWxvYWQgY2xpZW50XG4gICAqIEB0aHJvd3Mge0JldHRlckF1dGhFcnJvcn0gV2hlbiBCZXR0ZXIgQXV0aCBwbHVnaW4gaXMgbm90IGNvbmZpZ3VyZWRcbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVQYXlsb2FkQ2xpZW50KCkge1xuICAgIGNvbnN0IHBheWxvYWQgPSB0eXBlb2YgcGF5bG9hZENsaWVudCA9PT0gJ2Z1bmN0aW9uJyA/IGF3YWl0IHBheWxvYWRDbGllbnQoKSA6IGF3YWl0IHBheWxvYWRDbGllbnRcbiAgICBpZiAoIXBheWxvYWQuY29uZmlnPy5jdXN0b20/Lmhhc0JldHRlckF1dGhQbHVnaW4pIHtcbiAgICAgIHRocm93IG5ldyBCZXR0ZXJBdXRoRXJyb3IoYFBheWxvYWQgaXMgbm90IGNvbmZpZ3VyZWQgd2l0aCB0aGUgYmV0dGVyLWF1dGggcGx1Z2luLiBQbGVhc2UgYWRkIHRoZSBwbHVnaW4gdG8geW91ciBwYXlsb2FkIGNvbmZpZy5gKVxuICAgIH1cbiAgICByZXR1cm4gcGF5bG9hZFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBCZXR0ZXIgQXV0aCBhZGFwdGVyIGZvciBQYXlsb2FkXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQmV0dGVyIEF1dGggb3B0aW9uc1xuICAgKiBAcmV0dXJucyBBIEJldHRlciBBdXRoIGFkYXB0ZXIgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHJldHVybiAob3B0aW9uczogQmV0dGVyQXV0aE9wdGlvbnMpOiBBZGFwdGVyID0+IHtcbiAgICBjb25zdCB7IHRyYW5zZm9ybUlucHV0LCB0cmFuc2Zvcm1PdXRwdXQsIGNvbnZlcnRXaGVyZUNsYXVzZSwgY29udmVydFNlbGVjdCwgY29udmVydFNvcnQsIGdldENvbGxlY3Rpb25TbHVnLCBzaW5nbGVJZFF1ZXJ5IH0gPVxuICAgICAgY3JlYXRlVHJhbnNmb3JtKG9wdGlvbnMsIGVuYWJsZURlYnVnTG9ncylcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogJ3BheWxvYWQtYWRhcHRlcicsXG4gICAgICBhc3luYyBjcmVhdGU8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4sIFIgPSBUPih7XG4gICAgICAgIG1vZGVsLFxuICAgICAgICBkYXRhOiB2YWx1ZXMsXG4gICAgICAgIHNlbGVjdFxuICAgICAgfToge1xuICAgICAgICBtb2RlbDogc3RyaW5nXG4gICAgICAgIGRhdGE6IFRcbiAgICAgICAgc2VsZWN0Pzogc3RyaW5nW11cbiAgICAgIH0pOiBQcm9taXNlPFI+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNvbHZlUGF5bG9hZENsaWVudCgpXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25TbHVnID0gZ2V0Q29sbGVjdGlvblNsdWcobW9kZWwgYXMgTW9kZWxLZXkpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgY29sbGVjdGlvbiBleGlzdHMgYmVmb3JlIHByb2NlZWRpbmdcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVDb2xsZWN0aW9uKHBheWxvYWQsIGNvbGxlY3Rpb25TbHVnLCBtb2RlbClcblxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZElucHV0ID0gdHJhbnNmb3JtSW5wdXQoe1xuICAgICAgICAgIGRhdGE6IHZhbHVlcyxcbiAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXksXG4gICAgICAgICAgaWRUeXBlOiBpZFR5cGVcbiAgICAgICAgfSlcblxuICAgICAgICBkZWJ1Z0xvZyhbJ2NyZWF0ZScsIHsgY29sbGVjdGlvblNsdWcsIHRyYW5zZm9ybWVkSW5wdXQsIHNlbGVjdCB9XSlcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBheWxvYWQuY3JlYXRlKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgZGF0YTogdHJhbnNmb3JtZWRJbnB1dCxcbiAgICAgICAgICAgIHNlbGVjdDogY29udmVydFNlbGVjdChtb2RlbCBhcyBNb2RlbEtleSwgc2VsZWN0KSxcbiAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHsgbW9kZWwsIG9wZXJhdGlvbjogJ2NyZWF0ZScgfSksXG4gICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFJlc3VsdCA9IHRyYW5zZm9ybU91dHB1dCh7XG4gICAgICAgICAgICBkb2M6IHJlc3VsdCxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnY3JlYXRlIHJlc3VsdCcsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFJlc3VsdCxcbiAgICAgICAgICAgICAgZHVyYXRpb246IGAke0RhdGUubm93KCkgLSBzdGFydH1tc2BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKVxuXG4gICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkUmVzdWx0IGFzIFJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBlcnJvckxvZyhbJ0Vycm9yIGluIGNyZWF0aW5nOicsIG1vZGVsLCBlcnJvcl0pXG4gICAgICAgICAgcmV0dXJuIG51bGwgYXMgUlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXN5bmMgZmluZE9uZTxSPih7IG1vZGVsLCB3aGVyZSwgc2VsZWN0IH06IHsgbW9kZWw6IHN0cmluZzsgd2hlcmU6IFdoZXJlW107IHNlbGVjdD86IHN0cmluZ1tdIH0pOiBQcm9taXNlPFIgfCBudWxsPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzb2x2ZVBheWxvYWRDbGllbnQoKVxuICAgICAgICBjb25zdCBjb2xsZWN0aW9uU2x1ZyA9IGdldENvbGxlY3Rpb25TbHVnKG1vZGVsIGFzIE1vZGVsS2V5KVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGNvbGxlY3Rpb24gZXhpc3RzIGJlZm9yZSBwcm9jZWVkaW5nXG4gICAgICAgIGF3YWl0IHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkLCBjb2xsZWN0aW9uU2x1ZywgbW9kZWwpXG5cbiAgICAgICAgY29uc3QgcGF5bG9hZFdoZXJlID0gY29udmVydFdoZXJlQ2xhdXNlKHtcbiAgICAgICAgICBpZFR5cGU6IGlkVHlwZSxcbiAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXksXG4gICAgICAgICAgd2hlcmVcbiAgICAgICAgfSlcblxuICAgICAgICBkZWJ1Z0xvZyhbJ2ZpbmRPbmUnLCB7IGNvbGxlY3Rpb25TbHVnIH1dKVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgc2luZ2xlSWQgPSBzaW5nbGVJZFF1ZXJ5KHBheWxvYWRXaGVyZSlcbiAgICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCA9IG51bGxcblxuICAgICAgICAgIGlmIChzaW5nbGVJZCkge1xuICAgICAgICAgICAgZGVidWdMb2coWydmaW5kT25lQnlJRCcsIHsgY29sbGVjdGlvblNsdWcsIGlkOiBzaW5nbGVJZCB9XSlcbiAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHBheWxvYWQuZmluZEJ5SUQoe1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgaWQ6IHNpbmdsZUlkLFxuICAgICAgICAgICAgICBzZWxlY3Q6IGNvbnZlcnRTZWxlY3QobW9kZWwgYXMgTW9kZWxLZXksIHNlbGVjdCksXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBvcGVyYXRpb246ICdmaW5kT25lQnlJRCdcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRIXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ2ZpbmRPbmVCeVdoZXJlJywgeyBjb2xsZWN0aW9uU2x1ZywgcGF5bG9hZFdoZXJlIH1dKVxuICAgICAgICAgICAgY29uc3QgZG9jcyA9IGF3YWl0IHBheWxvYWQuZmluZCh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgICBzZWxlY3Q6IGNvbnZlcnRTZWxlY3QobW9kZWwgYXMgTW9kZWxLZXksIHNlbGVjdCksXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHtcbiAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICBvcGVyYXRpb246ICdmaW5kT25lQnlXaGVyZSdcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgICBsaW1pdDogMVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlc3VsdCA9IGRvY3MuZG9jc1swXVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUmVzdWx0ID0gdHJhbnNmb3JtT3V0cHV0PHR5cGVvZiByZXN1bHQgfCBudWxsPih7XG4gICAgICAgICAgICBkb2M6IHJlc3VsdCxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnZmluZE9uZSByZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSZXN1bHQsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFJlc3VsdCBhcyBSXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gZmluZE9uZTogJywgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3luYyBmaW5kTWFueTxSPih7XG4gICAgICAgIG1vZGVsLFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgbGltaXQgPSAxMCxcbiAgICAgICAgc29ydEJ5LFxuICAgICAgICBvZmZzZXQgPSAwXG4gICAgICB9OiB7XG4gICAgICAgIG1vZGVsOiBzdHJpbmdcbiAgICAgICAgd2hlcmU/OiBXaGVyZVtdXG4gICAgICAgIGxpbWl0PzogbnVtYmVyXG4gICAgICAgIHNvcnRCeT86IHtcbiAgICAgICAgICBmaWVsZDogc3RyaW5nXG4gICAgICAgICAgZGlyZWN0aW9uOiAnYXNjJyB8ICdkZXNjJ1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldD86IG51bWJlclxuICAgICAgfSk6IFByb21pc2U8UltdPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzb2x2ZVBheWxvYWRDbGllbnQoKVxuICAgICAgICBjb25zdCBjb2xsZWN0aW9uU2x1ZyA9IGdldENvbGxlY3Rpb25TbHVnKG1vZGVsIGFzIE1vZGVsS2V5KVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGNvbGxlY3Rpb24gZXhpc3RzIGJlZm9yZSBwcm9jZWVkaW5nXG4gICAgICAgIGF3YWl0IHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkLCBjb2xsZWN0aW9uU2x1ZywgbW9kZWwpXG5cbiAgICAgICAgY29uc3QgcGF5bG9hZFdoZXJlID0gY29udmVydFdoZXJlQ2xhdXNlKHtcbiAgICAgICAgICBpZFR5cGU6IGlkVHlwZSxcbiAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXksXG4gICAgICAgICAgd2hlcmVcbiAgICAgICAgfSlcblxuICAgICAgICBkZWJ1Z0xvZyhbJ2ZpbmRNYW55JywgeyBjb2xsZWN0aW9uU2x1Zywgc29ydEJ5LCBsaW1pdCwgb2Zmc2V0IH1dKVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHJlc3VsdDoge1xuICAgICAgICAgICAgZG9jczogUmVjb3JkPHN0cmluZywgYW55PltdXG4gICAgICAgICAgICB0b3RhbERvY3M6IG51bWJlclxuICAgICAgICAgIH0gfCBudWxsID0gbnVsbFxuXG4gICAgICAgICAgY29uc3Qgc2luZ2xlSWQgPSBzaW5nbGVJZFF1ZXJ5KHBheWxvYWRXaGVyZSlcbiAgICAgICAgICBpZiAoc2luZ2xlSWQpIHtcbiAgICAgICAgICAgIGRlYnVnTG9nKFsnZmluZE1hbnlCeVNpbmdsZUlEJywgeyBjb2xsZWN0aW9uU2x1ZywgaWQ6IHNpbmdsZUlkIH1dKVxuICAgICAgICAgICAgY29uc3QgZG9jID0gYXdhaXQgcGF5bG9hZC5maW5kQnlJRCh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICBpZDogc2luZ2xlSWQsXG4gICAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgICBjb250ZXh0OiBjcmVhdGVBZGFwdGVyQ29udGV4dCh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiAnZmluZE1hbnlCeVNpbmdsZUlEJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHsgZG9jczogZG9jID8gW2RvY10gOiBbXSwgdG90YWxEb2NzOiBkb2MgPyAxIDogMCB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnTG9nKFsnZmluZE1hbnlCeVdoZXJlJywgeyBjb2xsZWN0aW9uU2x1ZywgcGF5bG9hZFdoZXJlIH1dKVxuICAgICAgICAgICAgY29uc3Qgc3BpbGwgPSBvZmZzZXQgJSBsaW1pdFxuICAgICAgICAgICAgY29uc3QgcGFnZSA9IE1hdGguZmxvb3Iob2Zmc2V0IC8gbGltaXQpICsgMVxuICAgICAgICAgICAgY29uc3QgZmV0Y2hMaW1pdCA9IHNwaWxsID8gbGltaXQgKyBzcGlsbCA6IGxpbWl0XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHBheWxvYWQuZmluZCh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgICBsaW1pdDogZmV0Y2hMaW1pdCxcbiAgICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgICAgc29ydDogY29udmVydFNvcnQobW9kZWwgYXMgTW9kZWxLZXksIHNvcnRCeSksXG4gICAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgICBjb250ZXh0OiBjcmVhdGVBZGFwdGVyQ29udGV4dCh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiAnZmluZE1hbnlCeVdoZXJlJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHsgZG9jczogcmVzLmRvY3Muc2xpY2Uoc3BpbGwsIHNwaWxsICsgbGltaXQpLCB0b3RhbERvY3M6IHJlcy50b3RhbERvY3MgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUmVzdWx0ID1cbiAgICAgICAgICAgIHJlc3VsdD8uZG9jcy5tYXAoKGRvYykgPT5cbiAgICAgICAgICAgICAgdHJhbnNmb3JtT3V0cHV0KHtcbiAgICAgICAgICAgICAgICBkb2MsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApID8/IFtdXG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnZmluZE1hbnkgcmVzdWx0JyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIHRyYW5zZm9ybWVkUmVzdWx0LFxuICAgICAgICAgICAgICBkdXJhdGlvbjogYCR7RGF0ZS5ub3coKSAtIHN0YXJ0fW1zYFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRSZXN1bHQgYXMgUltdXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXSBhcyBSW11cbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyb3JMb2coWydFcnJvciBpbiBmaW5kTWFueTogJywgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiBbXSBhcyBSW11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIHVwZGF0ZTxSPih7IG1vZGVsLCB3aGVyZSwgdXBkYXRlIH06IHsgbW9kZWw6IHN0cmluZzsgd2hlcmU6IFdoZXJlW107IHVwZGF0ZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSk6IFByb21pc2U8UiB8IG51bGw+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNvbHZlUGF5bG9hZENsaWVudCgpXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25TbHVnID0gZ2V0Q29sbGVjdGlvblNsdWcobW9kZWwgYXMgTW9kZWxLZXkpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgY29sbGVjdGlvbiBleGlzdHMgYmVmb3JlIHByb2NlZWRpbmdcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVDb2xsZWN0aW9uKHBheWxvYWQsIGNvbGxlY3Rpb25TbHVnLCBtb2RlbClcblxuICAgICAgICBjb25zdCBwYXlsb2FkV2hlcmUgPSBjb252ZXJ0V2hlcmVDbGF1c2Uoe1xuICAgICAgICAgIGlkVHlwZTogaWRUeXBlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICB3aGVyZVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkSW5wdXQgPSB0cmFuc2Zvcm1JbnB1dCh7XG4gICAgICAgICAgZGF0YTogdXBkYXRlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICBpZFR5cGU6IGlkVHlwZVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlYnVnTG9nKFsndXBkYXRlJywgeyBjb2xsZWN0aW9uU2x1ZywgdXBkYXRlIH1dKVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGwgPSBudWxsXG4gICAgICAgICAgY29uc3QgaWQgPSBzaW5nbGVJZFF1ZXJ5KHBheWxvYWRXaGVyZSlcblxuICAgICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgZGVidWdMb2coWyd1cGRhdGVCeUlEJywgeyBjb2xsZWN0aW9uU2x1ZywgaWQgfV0pXG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBwYXlsb2FkLnVwZGF0ZSh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgZGF0YTogdHJhbnNmb3JtZWRJbnB1dCxcbiAgICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEgsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHsgbW9kZWwsIG9wZXJhdGlvbjogJ3VwZGF0ZUJ5SUQnIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ3VwZGF0ZUJ5V2hlcmUnLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUgfV0pXG4gICAgICAgICAgICBjb25zdCBkb2MgPSBhd2FpdCBwYXlsb2FkLnVwZGF0ZSh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgICBkYXRhOiB0cmFuc2Zvcm1lZElucHV0LFxuICAgICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ3VwZGF0ZUJ5V2hlcmUnXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmVzdWx0ID0gZG9jLmRvY3NbMF1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFJlc3VsdCA9IHRyYW5zZm9ybU91dHB1dDx0eXBlb2YgcmVzdWx0IHwgbnVsbD4oe1xuICAgICAgICAgICAgZG9jOiByZXN1bHQsXG4gICAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVidWdMb2coW1xuICAgICAgICAgICAgJ3VwZGF0ZS1yZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSZXN1bHQsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFJlc3VsdCBhcyBSXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gdXBkYXRlOiAnLCBlcnJvcl0pXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIHVwZGF0ZU1hbnkoeyBtb2RlbCwgd2hlcmUsIHVwZGF0ZSB9OiB7IG1vZGVsOiBzdHJpbmc7IHdoZXJlOiBXaGVyZVtdOyB1cGRhdGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHJlc29sdmVQYXlsb2FkQ2xpZW50KClcbiAgICAgICAgY29uc3QgY29sbGVjdGlvblNsdWcgPSBnZXRDb2xsZWN0aW9uU2x1Zyhtb2RlbCBhcyBNb2RlbEtleSlcblxuICAgICAgICAvLyBWYWxpZGF0ZSBjb2xsZWN0aW9uIGV4aXN0cyBiZWZvcmUgcHJvY2VlZGluZ1xuICAgICAgICBhd2FpdCB2YWxpZGF0ZUNvbGxlY3Rpb24ocGF5bG9hZCwgY29sbGVjdGlvblNsdWcsIG1vZGVsKVxuXG4gICAgICAgIGNvbnN0IHBheWxvYWRXaGVyZSA9IGNvbnZlcnRXaGVyZUNsYXVzZSh7XG4gICAgICAgICAgaWRUeXBlOiBpZFR5cGUsXG4gICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5LFxuICAgICAgICAgIHdoZXJlXG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRJbnB1dCA9IHRyYW5zZm9ybUlucHV0KHtcbiAgICAgICAgICBkYXRhOiB1cGRhdGUsXG4gICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5LFxuICAgICAgICAgIGlkVHlwZTogaWRUeXBlXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVidWdMb2coWyd1cGRhdGVNYW55JywgeyBjb2xsZWN0aW9uU2x1ZywgcGF5bG9hZFdoZXJlLCB1cGRhdGUgfV0pXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGRvY3M6IHVwZGF0ZVJlc3VsdCB9ID0gYXdhaXQgcGF5bG9hZC51cGRhdGUoe1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgZGF0YTogdHJhbnNmb3JtZWRJbnB1dCxcbiAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoeyBtb2RlbCwgb3BlcmF0aW9uOiAndXBkYXRlTWFueScgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVidWdMb2coW1xuICAgICAgICAgICAgJ3VwZGF0ZU1hbnkgcmVzdWx0JyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIHJlc3VsdDogdXBkYXRlUmVzdWx0LFxuICAgICAgICAgICAgICBkdXJhdGlvbjogYCR7RGF0ZS5ub3coKSAtIHN0YXJ0fW1zYFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgICByZXR1cm4gdXBkYXRlUmVzdWx0Py5sZW5ndGggfHwgMFxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmICdzdGF0dXMnIGluIGVycm9yICYmIGVycm9yLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvckxvZyhbJ0Vycm9yIGluIHVwZGF0ZU1hbnk6ICcsIGVycm9yXSlcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXN5bmMgZGVsZXRlKHsgbW9kZWwsIHdoZXJlIH06IHsgbW9kZWw6IHN0cmluZzsgd2hlcmU6IFdoZXJlW10gfSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHJlc29sdmVQYXlsb2FkQ2xpZW50KClcbiAgICAgICAgY29uc3QgY29sbGVjdGlvblNsdWcgPSBnZXRDb2xsZWN0aW9uU2x1Zyhtb2RlbCBhcyBNb2RlbEtleSlcblxuICAgICAgICAvLyBWYWxpZGF0ZSBjb2xsZWN0aW9uIGV4aXN0cyBiZWZvcmUgcHJvY2VlZGluZ1xuICAgICAgICBhd2FpdCB2YWxpZGF0ZUNvbGxlY3Rpb24ocGF5bG9hZCwgY29sbGVjdGlvblNsdWcsIG1vZGVsKVxuXG4gICAgICAgIGNvbnN0IHBheWxvYWRXaGVyZSA9IGNvbnZlcnRXaGVyZUNsYXVzZSh7XG4gICAgICAgICAgaWRUeXBlOiBpZFR5cGUsXG4gICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5LFxuICAgICAgICAgIHdoZXJlXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVidWdMb2coWydkZWxldGUnLCB7IGNvbGxlY3Rpb25TbHVnIH1dKVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IGRlbGV0ZVJlc3VsdDoge1xuICAgICAgICAgICAgZG9jOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbFxuICAgICAgICAgICAgZXJyb3JzOiBhbnlbXVxuICAgICAgICAgIH0gfCBudWxsID0gbnVsbFxuXG4gICAgICAgICAgY29uc3Qgc2luZ2xlSWQgPSBzaW5nbGVJZFF1ZXJ5KHBheWxvYWRXaGVyZSlcbiAgICAgICAgICBpZiAoc2luZ2xlSWQpIHtcbiAgICAgICAgICAgIGRlYnVnTG9nKFsnZGVsZXRlQnlJRCcsIHsgY29sbGVjdGlvblNsdWcsIGlkOiBzaW5nbGVJZCB9XSlcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGF3YWl0IHBheWxvYWQuZGVsZXRlKHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIGlkOiBzaW5nbGVJZCxcbiAgICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEgsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHsgbW9kZWwsIG9wZXJhdGlvbjogJ2RlbGV0ZUJ5SUQnIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgZGVsZXRlUmVzdWx0ID0geyBkb2MsIGVycm9yczogW10gfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ2RlbGV0ZUJ5V2hlcmUnLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUgfV0pXG4gICAgICAgICAgICBjb25zdCBkb2MgPSBhd2FpdCBwYXlsb2FkLmRlbGV0ZSh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ2RlbGV0ZUJ5V2hlcmUnXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgZGVsZXRlUmVzdWx0ID0geyBkb2M6IGRvYy5kb2NzWzBdLCBlcnJvcnM6IFtdIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnZGVsZXRlIHJlc3VsdCcsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICByZXN1bHQ6IGRlbGV0ZVJlc3VsdCxcbiAgICAgICAgICAgICAgZHVyYXRpb246IGAke0RhdGUubm93KCkgLSBzdGFydH1tc2BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmICdzdGF0dXMnIGluIGVycm9yICYmIGVycm9yLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyb3JMb2coWydFcnJvciBpbiBkZWxldGU6ICcsIGVycm9yXSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGRlbGV0ZU1hbnkoeyBtb2RlbCwgd2hlcmUgfTogeyBtb2RlbDogc3RyaW5nOyB3aGVyZTogV2hlcmVbXSB9KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNvbHZlUGF5bG9hZENsaWVudCgpXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25TbHVnID0gZ2V0Q29sbGVjdGlvblNsdWcobW9kZWwgYXMgTW9kZWxLZXkpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgY29sbGVjdGlvbiBleGlzdHMgYmVmb3JlIHByb2NlZWRpbmdcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVDb2xsZWN0aW9uKHBheWxvYWQsIGNvbGxlY3Rpb25TbHVnLCBtb2RlbClcblxuICAgICAgICBjb25zdCBwYXlsb2FkV2hlcmUgPSBjb252ZXJ0V2hlcmVDbGF1c2Uoe1xuICAgICAgICAgIGlkVHlwZTogaWRUeXBlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICB3aGVyZVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlYnVnTG9nKFsnZGVsZXRlTWFueScsIHsgY29sbGVjdGlvblNsdWcsIHBheWxvYWRXaGVyZSB9XSlcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGRlbGV0ZVJlc3VsdCA9IGF3YWl0IHBheWxvYWQuZGVsZXRlKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgd2hlcmU6IHBheWxvYWRXaGVyZSxcbiAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoeyBtb2RlbCwgb3BlcmF0aW9uOiAnZGVsZXRlTWFueScgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVidWdMb2coW1xuICAgICAgICAgICAgJ2RlbGV0ZU1hbnkgcmVzdWx0JyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIHJlc3VsdDogZGVsZXRlUmVzdWx0LFxuICAgICAgICAgICAgICBkdXJhdGlvbjogYCR7RGF0ZS5ub3coKSAtIHN0YXJ0fW1zYFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgICByZXR1cm4gZGVsZXRlUmVzdWx0LmRvY3MubGVuZ3RoXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gZGVsZXRlTWFueTogJywgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3luYyBjb3VudCh7IG1vZGVsLCB3aGVyZSB9OiB7IG1vZGVsOiBzdHJpbmc7IHdoZXJlPzogV2hlcmVbXSB9KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNvbHZlUGF5bG9hZENsaWVudCgpXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25TbHVnID0gZ2V0Q29sbGVjdGlvblNsdWcobW9kZWwgYXMgTW9kZWxLZXkpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgY29sbGVjdGlvbiBleGlzdHMgYmVmb3JlIHByb2NlZWRpbmdcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVDb2xsZWN0aW9uKHBheWxvYWQsIGNvbGxlY3Rpb25TbHVnLCBtb2RlbClcblxuICAgICAgICBjb25zdCBwYXlsb2FkV2hlcmUgPSBjb252ZXJ0V2hlcmVDbGF1c2Uoe1xuICAgICAgICAgIGlkVHlwZTogaWRUeXBlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICB3aGVyZVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlYnVnTG9nKFsnY291bnQnLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUgfV0pXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwYXlsb2FkLmNvdW50KHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgd2hlcmU6IHBheWxvYWRXaGVyZSxcbiAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoeyBtb2RlbCwgb3BlcmF0aW9uOiAnY291bnQnIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlYnVnTG9nKFtcbiAgICAgICAgICAgICdjb3VudCByZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgcmVzdWx0OiB7IHRvdGFsRG9jczogcmVzdWx0LnRvdGFsRG9jcyB9LFxuICAgICAgICAgICAgICBkdXJhdGlvbjogYCR7RGF0ZS5ub3coKSAtIHN0YXJ0fW1zYFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnRvdGFsRG9jc1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmICdzdGF0dXMnIGluIGVycm9yICYmIGVycm9yLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvckxvZyhbJ0Vycm9yIGluIGNvdW50OiAnLCBlcnJvcl0pXG4gICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZVNjaGVtYTogYXN5bmMgKG9wdGlvbnMsIGZpbGUpID0+IHtcbiAgICAgICAgY29uc3Qgc2NoZW1hQ29kZSA9IGF3YWl0IGdlbmVyYXRlU2NoZW1hKG9wdGlvbnMpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogc2NoZW1hQ29kZSxcbiAgICAgICAgICBwYXRoOiBmaWxlIHx8ICdzY2hlbWEudHMnLFxuICAgICAgICAgIGFwcGVuZDogZmFsc2UsXG4gICAgICAgICAgb3ZlcndyaXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0cmFuc2FjdGlvbjogYXN5bmMgKGZuKSA9PiB7XG4gICAgICAgIC8vIFBheWxvYWQgZG9lc24ndCBzdXBwb3J0IHRyYW5zYWN0aW9ucyBpbiB0aGUgc2FtZSB3YXkgYXMgU1FMIGRhdGFiYXNlc1xuICAgICAgICAvLyBFeGVjdXRlIHRoZSBjYWxsYmFjayBkaXJlY3RseSwgcGFzc2luZyBhIG5vLW9wIHRyYW5zYWN0aW9uIG9iamVjdFxuICAgICAgICByZXR1cm4gYXdhaXQgZm4oe30gYXMgYW55KVxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWRhcHRlckNvbmZpZzoge30gYXMgYW55XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IGdlbmVyYXRlU2NoZW1hLCBwYXlsb2FkQWRhcHRlciB9XG4iXSwibmFtZXMiOlsiQmV0dGVyQXV0aEVycm9yIiwiZ2VuZXJhdGVTY2hlbWEiLCJjcmVhdGVUcmFuc2Zvcm0iLCJCRVRURVJfQVVUSF9DT05URVhUX0tFWSIsIlBBWUxPQURfUVVFUllfREVQVEgiLCJwYXlsb2FkQWRhcHRlciIsInBheWxvYWRDbGllbnQiLCJlbmFibGVEZWJ1Z0xvZ3MiLCJpZFR5cGUiLCJkZWJ1Z0xvZyIsIm1lc3NhZ2UiLCJjb25zb2xlIiwibG9nIiwiZXJyb3JMb2ciLCJlcnJvciIsImNvbGxlY3Rpb25TbHVnRXJyb3IiLCJtb2RlbCIsInZhbGlkYXRlQ29sbGVjdGlvbiIsInBheWxvYWQiLCJjb2xsZWN0aW9uU2x1ZyIsImNvbGxlY3Rpb25zIiwiY3JlYXRlQWRhcHRlckNvbnRleHQiLCJkYXRhIiwicmVzb2x2ZVBheWxvYWRDbGllbnQiLCJjb25maWciLCJjdXN0b20iLCJoYXNCZXR0ZXJBdXRoUGx1Z2luIiwib3B0aW9ucyIsInRyYW5zZm9ybUlucHV0IiwidHJhbnNmb3JtT3V0cHV0IiwiY29udmVydFdoZXJlQ2xhdXNlIiwiY29udmVydFNlbGVjdCIsImNvbnZlcnRTb3J0IiwiZ2V0Q29sbGVjdGlvblNsdWciLCJzaW5nbGVJZFF1ZXJ5IiwiaWQiLCJjcmVhdGUiLCJ2YWx1ZXMiLCJzZWxlY3QiLCJzdGFydCIsIkRhdGUiLCJub3ciLCJ0cmFuc2Zvcm1lZElucHV0IiwicmVzdWx0IiwiY29sbGVjdGlvbiIsImNvbnRleHQiLCJvcGVyYXRpb24iLCJkZXB0aCIsInRyYW5zZm9ybWVkUmVzdWx0IiwiZG9jIiwiZHVyYXRpb24iLCJmaW5kT25lIiwid2hlcmUiLCJwYXlsb2FkV2hlcmUiLCJzaW5nbGVJZCIsImZpbmRCeUlEIiwiZG9jcyIsImZpbmQiLCJsaW1pdCIsIkVycm9yIiwic3RhdHVzIiwiZmluZE1hbnkiLCJzb3J0QnkiLCJvZmZzZXQiLCJ0b3RhbERvY3MiLCJzcGlsbCIsInBhZ2UiLCJNYXRoIiwiZmxvb3IiLCJmZXRjaExpbWl0IiwicmVzIiwic29ydCIsInNsaWNlIiwibWFwIiwidXBkYXRlIiwidXBkYXRlTWFueSIsInVwZGF0ZVJlc3VsdCIsImxlbmd0aCIsImRlbGV0ZSIsImRlbGV0ZVJlc3VsdCIsImVycm9ycyIsImRlbGV0ZU1hbnkiLCJjb3VudCIsImNyZWF0ZVNjaGVtYSIsImZpbGUiLCJzY2hlbWFDb2RlIiwiY29kZSIsInBhdGgiLCJhcHBlbmQiLCJvdmVyd3JpdGUiLCJ0cmFuc2FjdGlvbiIsImZuIiwiYWRhcHRlckNvbmZpZyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsZUFBZSxRQUFRLGNBQWE7QUFFN0MsU0FBU0MsY0FBYyxRQUFRLG9CQUFtQjtBQUNsRCxTQUFTQyxlQUFlLFFBQVEsY0FBYTtBQU03QyxPQUFPLE1BQU1DLDBCQUEwQixxQkFBb0I7QUFDM0QsTUFBTUMsc0JBQXNCO0FBRTVCOzs7Ozs7Ozs7Q0FTQyxHQUNELE1BQU1DLGlCQUFpQyxDQUFDLEVBQUVDLGFBQWEsRUFBRUMsa0JBQWtCLEtBQUssRUFBRUMsTUFBTSxFQUFFO0lBQ3hGOzs7R0FHQyxHQUNELFNBQVNDLFNBQVNDLE9BQWM7UUFDOUIsSUFBSUgsaUJBQWlCO1lBQ25CSSxRQUFRQyxHQUFHLENBQUMsMkJBQTJCRjtRQUN6QztJQUNGO0lBRUE7OztHQUdDLEdBQ0QsU0FBU0csU0FBU0gsT0FBYztRQUM5QkMsUUFBUUcsS0FBSyxDQUFDLENBQUMsb0JBQW9CLENBQUMsS0FBS0o7SUFDM0M7SUFFQTs7Ozs7R0FLQyxHQUNELFNBQVNLLG9CQUFvQkMsS0FBYTtRQUN4QyxNQUFNLElBQUloQixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUVnQixNQUFNLHdGQUF3RixDQUFDO0lBQ3pJO0lBRUE7Ozs7OztHQU1DLEdBQ0QsZUFBZUMsbUJBQW1CQyxPQUFZLEVBQUVDLGNBQXNCLEVBQUVILEtBQWE7UUFDbkYsSUFBSSxDQUFDRyxrQkFBa0IsQ0FBRUEsQ0FBQUEsa0JBQWtCRCxRQUFRRSxXQUFXLEFBQUQsR0FBSTtZQUMvREwsb0JBQW9CQztRQUN0QjtJQUNGO0lBRUE7Ozs7R0FJQyxHQUNELE1BQU1LLHVCQUF1QixDQUFDQyxPQUErQixDQUFBO1lBQzNELENBQUNuQix3QkFBd0IsRUFBRTtnQkFBRSxHQUFHbUIsSUFBSTtZQUFDO1FBQ3ZDLENBQUE7SUFFQTs7OztHQUlDLEdBQ0QsZUFBZUM7UUFDYixNQUFNTCxVQUFVLE9BQU9aLGtCQUFrQixhQUFhLE1BQU1BLGtCQUFrQixNQUFNQTtRQUNwRixJQUFJLENBQUNZLFFBQVFNLE1BQU0sRUFBRUMsUUFBUUMscUJBQXFCO1lBQ2hELE1BQU0sSUFBSTFCLGdCQUFnQixDQUFDLG9HQUFvRyxDQUFDO1FBQ2xJO1FBQ0EsT0FBT2tCO0lBQ1Q7SUFFQTs7OztHQUlDLEdBQ0QsT0FBTyxDQUFDUztRQUNOLE1BQU0sRUFBRUMsY0FBYyxFQUFFQyxlQUFlLEVBQUVDLGtCQUFrQixFQUFFQyxhQUFhLEVBQUVDLFdBQVcsRUFBRUMsaUJBQWlCLEVBQUVDLGFBQWEsRUFBRSxHQUN6SGhDLGdCQUFnQnlCLFNBQVNwQjtRQUUzQixPQUFPO1lBQ0w0QixJQUFJO1lBQ0osTUFBTUMsUUFBNkMsRUFDakRwQixLQUFLLEVBQ0xNLE1BQU1lLE1BQU0sRUFDWkMsTUFBTSxFQUtQO2dCQUNDLE1BQU1DLFFBQVFDLEtBQUtDLEdBQUc7Z0JBQ3RCLE1BQU12QixVQUFVLE1BQU1LO2dCQUN0QixNQUFNSixpQkFBaUJjLGtCQUFrQmpCO2dCQUV6QywrQ0FBK0M7Z0JBQy9DLE1BQU1DLG1CQUFtQkMsU0FBU0MsZ0JBQWdCSDtnQkFFbEQsTUFBTTBCLG1CQUFtQmQsZUFBZTtvQkFDdENOLE1BQU1lO29CQUNOckIsT0FBT0E7b0JBQ1BSLFFBQVFBO2dCQUNWO2dCQUVBQyxTQUFTO29CQUFDO29CQUFVO3dCQUFFVTt3QkFBZ0J1Qjt3QkFBa0JKO29CQUFPO2lCQUFFO2dCQUVqRSxJQUFJO29CQUNGLE1BQU1LLFNBQVMsTUFBTXpCLFFBQVFrQixNQUFNLENBQUM7d0JBQ2xDUSxZQUFZekI7d0JBQ1pHLE1BQU1vQjt3QkFDTkosUUFBUVAsY0FBY2YsT0FBbUJzQjt3QkFDekNPLFNBQVN4QixxQkFBcUI7NEJBQUVMOzRCQUFPOEIsV0FBVzt3QkFBUzt3QkFDM0RDLE9BQU8zQztvQkFDVDtvQkFFQSxNQUFNNEMsb0JBQW9CbkIsZ0JBQWdCO3dCQUN4Q29CLEtBQUtOO3dCQUNMM0IsT0FBT0E7b0JBQ1Q7b0JBRUFQLFNBQVM7d0JBQ1A7d0JBQ0E7NEJBQ0VVOzRCQUNBNkI7NEJBQ0FFLFVBQVUsR0FBR1YsS0FBS0MsR0FBRyxLQUFLRixNQUFNLEVBQUUsQ0FBQzt3QkFDckM7cUJBQ0Q7b0JBRUQsT0FBT1M7Z0JBQ1QsRUFBRSxPQUFPbEMsT0FBTztvQkFDZEQsU0FBUzt3QkFBQzt3QkFBc0JHO3dCQUFPRjtxQkFBTTtvQkFDN0MsT0FBTztnQkFDVDtZQUNGO1lBQ0EsTUFBTXFDLFNBQVcsRUFBRW5DLEtBQUssRUFBRW9DLEtBQUssRUFBRWQsTUFBTSxFQUF3RDtnQkFDN0YsTUFBTUMsUUFBUUMsS0FBS0MsR0FBRztnQkFDdEIsTUFBTXZCLFVBQVUsTUFBTUs7Z0JBQ3RCLE1BQU1KLGlCQUFpQmMsa0JBQWtCakI7Z0JBRXpDLCtDQUErQztnQkFDL0MsTUFBTUMsbUJBQW1CQyxTQUFTQyxnQkFBZ0JIO2dCQUVsRCxNQUFNcUMsZUFBZXZCLG1CQUFtQjtvQkFDdEN0QixRQUFRQTtvQkFDUlEsT0FBT0E7b0JBQ1BvQztnQkFDRjtnQkFFQTNDLFNBQVM7b0JBQUM7b0JBQVc7d0JBQUVVO29CQUFlO2lCQUFFO2dCQUV4QyxJQUFJO29CQUNGLE1BQU1tQyxXQUFXcEIsY0FBY21CO29CQUMvQixJQUFJVixTQUFxQztvQkFFekMsSUFBSVcsVUFBVTt3QkFDWjdDLFNBQVM7NEJBQUM7NEJBQWU7Z0NBQUVVO2dDQUFnQmdCLElBQUltQjs0QkFBUzt5QkFBRTt3QkFDMURYLFNBQVMsTUFBTXpCLFFBQVFxQyxRQUFRLENBQUM7NEJBQzlCWCxZQUFZekI7NEJBQ1pnQixJQUFJbUI7NEJBQ0poQixRQUFRUCxjQUFjZixPQUFtQnNCOzRCQUN6Q08sU0FBU3hCLHFCQUFxQjtnQ0FDNUJMO2dDQUNBOEIsV0FBVzs0QkFDYjs0QkFDQUMsT0FBTzNDO3dCQUNUO29CQUNGLE9BQU87d0JBQ0xLLFNBQVM7NEJBQUM7NEJBQWtCO2dDQUFFVTtnQ0FBZ0JrQzs0QkFBYTt5QkFBRTt3QkFDN0QsTUFBTUcsT0FBTyxNQUFNdEMsUUFBUXVDLElBQUksQ0FBQzs0QkFDOUJiLFlBQVl6Qjs0QkFDWmlDLE9BQU9DOzRCQUNQZixRQUFRUCxjQUFjZixPQUFtQnNCOzRCQUN6Q08sU0FBU3hCLHFCQUFxQjtnQ0FDNUJMO2dDQUNBOEIsV0FBVzs0QkFDYjs0QkFDQUMsT0FBTzNDOzRCQUNQc0QsT0FBTzt3QkFDVDt3QkFDQWYsU0FBU2EsS0FBS0EsSUFBSSxDQUFDLEVBQUU7b0JBQ3ZCO29CQUVBLE1BQU1SLG9CQUFvQm5CLGdCQUFzQzt3QkFDOURvQixLQUFLTjt3QkFDTDNCLE9BQU9BO29CQUNUO29CQUVBUCxTQUFTO3dCQUNQO3dCQUNBOzRCQUNFVTs0QkFDQTZCOzRCQUNBRSxVQUFVLEdBQUdWLEtBQUtDLEdBQUcsS0FBS0YsTUFBTSxFQUFFLENBQUM7d0JBQ3JDO3FCQUNEO29CQUVELE9BQU9TO2dCQUNULEVBQUUsT0FBT2xDLE9BQU87b0JBQ2QsSUFBSUEsaUJBQWlCNkMsU0FBUyxZQUFZN0MsU0FBU0EsTUFBTThDLE1BQU0sS0FBSyxLQUFLO3dCQUN2RSxPQUFPO29CQUNUO29CQUNBL0MsU0FBUzt3QkFBQzt3QkFBc0JDO3FCQUFNO29CQUN0QyxPQUFPO2dCQUNUO1lBQ0Y7WUFDQSxNQUFNK0MsVUFBWSxFQUNoQjdDLEtBQUssRUFDTG9DLEtBQUssRUFDTE0sUUFBUSxFQUFFLEVBQ1ZJLE1BQU0sRUFDTkMsU0FBUyxDQUFDLEVBVVg7Z0JBQ0MsTUFBTXhCLFFBQVFDLEtBQUtDLEdBQUc7Z0JBQ3RCLE1BQU12QixVQUFVLE1BQU1LO2dCQUN0QixNQUFNSixpQkFBaUJjLGtCQUFrQmpCO2dCQUV6QywrQ0FBK0M7Z0JBQy9DLE1BQU1DLG1CQUFtQkMsU0FBU0MsZ0JBQWdCSDtnQkFFbEQsTUFBTXFDLGVBQWV2QixtQkFBbUI7b0JBQ3RDdEIsUUFBUUE7b0JBQ1JRLE9BQU9BO29CQUNQb0M7Z0JBQ0Y7Z0JBRUEzQyxTQUFTO29CQUFDO29CQUFZO3dCQUFFVTt3QkFBZ0IyQzt3QkFBUUo7d0JBQU9LO29CQUFPO2lCQUFFO2dCQUVoRSxJQUFJO29CQUNGLElBQUlwQixTQUdPO29CQUVYLE1BQU1XLFdBQVdwQixjQUFjbUI7b0JBQy9CLElBQUlDLFVBQVU7d0JBQ1o3QyxTQUFTOzRCQUFDOzRCQUFzQjtnQ0FBRVU7Z0NBQWdCZ0IsSUFBSW1COzRCQUFTO3lCQUFFO3dCQUNqRSxNQUFNTCxNQUFNLE1BQU0vQixRQUFRcUMsUUFBUSxDQUFDOzRCQUNqQ1gsWUFBWXpCOzRCQUNaZ0IsSUFBSW1COzRCQUNKUCxPQUFPM0M7NEJBQ1B5QyxTQUFTeEIscUJBQXFCO2dDQUM1Qkw7Z0NBQ0E4QixXQUFXOzRCQUNiO3dCQUNGO3dCQUNBSCxTQUFTOzRCQUFFYSxNQUFNUCxNQUFNO2dDQUFDQTs2QkFBSSxHQUFHLEVBQUU7NEJBQUVlLFdBQVdmLE1BQU0sSUFBSTt3QkFBRTtvQkFDNUQsT0FBTzt3QkFDTHhDLFNBQVM7NEJBQUM7NEJBQW1CO2dDQUFFVTtnQ0FBZ0JrQzs0QkFBYTt5QkFBRTt3QkFDOUQsTUFBTVksUUFBUUYsU0FBU0w7d0JBQ3ZCLE1BQU1RLE9BQU9DLEtBQUtDLEtBQUssQ0FBQ0wsU0FBU0wsU0FBUzt3QkFDMUMsTUFBTVcsYUFBYUosUUFBUVAsUUFBUU8sUUFBUVA7d0JBRTNDLE1BQU1ZLE1BQU0sTUFBTXBELFFBQVF1QyxJQUFJLENBQUM7NEJBQzdCYixZQUFZekI7NEJBQ1ppQyxPQUFPQzs0QkFDUEssT0FBT1c7NEJBQ1BILE1BQU1BOzRCQUNOSyxNQUFNdkMsWUFBWWhCLE9BQW1COEM7NEJBQ3JDZixPQUFPM0M7NEJBQ1B5QyxTQUFTeEIscUJBQXFCO2dDQUM1Qkw7Z0NBQ0E4QixXQUFXOzRCQUNiO3dCQUNGO3dCQUNBSCxTQUFTOzRCQUFFYSxNQUFNYyxJQUFJZCxJQUFJLENBQUNnQixLQUFLLENBQUNQLE9BQU9BLFFBQVFQOzRCQUFRTSxXQUFXTSxJQUFJTixTQUFTO3dCQUFDO29CQUNsRjtvQkFFQSxNQUFNaEIsb0JBQ0pMLFFBQVFhLEtBQUtpQixJQUFJLENBQUN4QixNQUNoQnBCLGdCQUFnQjs0QkFDZG9COzRCQUNBakMsT0FBT0E7d0JBQ1QsT0FDRyxFQUFFO29CQUVUUCxTQUFTO3dCQUNQO3dCQUNBOzRCQUNFVTs0QkFDQTZCOzRCQUNBRSxVQUFVLEdBQUdWLEtBQUtDLEdBQUcsS0FBS0YsTUFBTSxFQUFFLENBQUM7d0JBQ3JDO3FCQUNEO29CQUVELE9BQU9TO2dCQUNULEVBQUUsT0FBT2xDLE9BQU87b0JBQ2QsSUFBSUEsaUJBQWlCNkMsU0FBUyxZQUFZN0MsU0FBU0EsTUFBTThDLE1BQU0sS0FBSyxLQUFLO3dCQUN2RSxPQUFPLEVBQUU7b0JBQ1g7b0JBQ0EvQyxTQUFTO3dCQUFDO3dCQUF1QkM7cUJBQU07b0JBQ3ZDLE9BQU8sRUFBRTtnQkFDWDtZQUNGO1lBQ0EsTUFBTTRELFFBQVUsRUFBRTFELEtBQUssRUFBRW9DLEtBQUssRUFBRXNCLE1BQU0sRUFBc0U7Z0JBQzFHLE1BQU1uQyxRQUFRQyxLQUFLQyxHQUFHO2dCQUN0QixNQUFNdkIsVUFBVSxNQUFNSztnQkFDdEIsTUFBTUosaUJBQWlCYyxrQkFBa0JqQjtnQkFFekMsK0NBQStDO2dCQUMvQyxNQUFNQyxtQkFBbUJDLFNBQVNDLGdCQUFnQkg7Z0JBRWxELE1BQU1xQyxlQUFldkIsbUJBQW1CO29CQUN0Q3RCLFFBQVFBO29CQUNSUSxPQUFPQTtvQkFDUG9DO2dCQUNGO2dCQUVBLE1BQU1WLG1CQUFtQmQsZUFBZTtvQkFDdENOLE1BQU1vRDtvQkFDTjFELE9BQU9BO29CQUNQUixRQUFRQTtnQkFDVjtnQkFFQUMsU0FBUztvQkFBQztvQkFBVTt3QkFBRVU7d0JBQWdCdUQ7b0JBQU87aUJBQUU7Z0JBRS9DLElBQUk7b0JBQ0YsSUFBSS9CLFNBQXFDO29CQUN6QyxNQUFNUixLQUFLRCxjQUFjbUI7b0JBRXpCLElBQUlsQixJQUFJO3dCQUNOMUIsU0FBUzs0QkFBQzs0QkFBYztnQ0FBRVU7Z0NBQWdCZ0I7NEJBQUc7eUJBQUU7d0JBQy9DUSxTQUFTLE1BQU16QixRQUFRd0QsTUFBTSxDQUFDOzRCQUM1QjlCLFlBQVl6Qjs0QkFDWmdCOzRCQUNBYixNQUFNb0I7NEJBQ05LLE9BQU8zQzs0QkFDUHlDLFNBQVN4QixxQkFBcUI7Z0NBQUVMO2dDQUFPOEIsV0FBVzs0QkFBYTt3QkFDakU7b0JBQ0YsT0FBTzt3QkFDTHJDLFNBQVM7NEJBQUM7NEJBQWlCO2dDQUFFVTtnQ0FBZ0JrQzs0QkFBYTt5QkFBRTt3QkFDNUQsTUFBTUosTUFBTSxNQUFNL0IsUUFBUXdELE1BQU0sQ0FBQzs0QkFDL0I5QixZQUFZekI7NEJBQ1ppQyxPQUFPQzs0QkFDUC9CLE1BQU1vQjs0QkFDTkssT0FBTzNDOzRCQUNQeUMsU0FBU3hCLHFCQUFxQjtnQ0FDNUJMO2dDQUNBOEIsV0FBVzs0QkFDYjt3QkFDRjt3QkFDQUgsU0FBU00sSUFBSU8sSUFBSSxDQUFDLEVBQUU7b0JBQ3RCO29CQUVBLE1BQU1SLG9CQUFvQm5CLGdCQUFzQzt3QkFDOURvQixLQUFLTjt3QkFDTDNCLE9BQU9BO29CQUNUO29CQUVBUCxTQUFTO3dCQUNQO3dCQUNBOzRCQUNFVTs0QkFDQTZCOzRCQUNBRSxVQUFVLEdBQUdWLEtBQUtDLEdBQUcsS0FBS0YsTUFBTSxFQUFFLENBQUM7d0JBQ3JDO3FCQUNEO29CQUVELE9BQU9TO2dCQUNULEVBQUUsT0FBT2xDLE9BQU87b0JBQ2QsSUFBSUEsaUJBQWlCNkMsU0FBUyxZQUFZN0MsU0FBU0EsTUFBTThDLE1BQU0sS0FBSyxLQUFLO3dCQUN2RSxPQUFPO29CQUNUO29CQUNBL0MsU0FBUzt3QkFBQzt3QkFBcUJDO3FCQUFNO29CQUNyQyxPQUFPO2dCQUNUO1lBQ0Y7WUFDQSxNQUFNNkQsWUFBVyxFQUFFM0QsS0FBSyxFQUFFb0MsS0FBSyxFQUFFc0IsTUFBTSxFQUFzRTtnQkFDM0csTUFBTW5DLFFBQVFDLEtBQUtDLEdBQUc7Z0JBQ3RCLE1BQU12QixVQUFVLE1BQU1LO2dCQUN0QixNQUFNSixpQkFBaUJjLGtCQUFrQmpCO2dCQUV6QywrQ0FBK0M7Z0JBQy9DLE1BQU1DLG1CQUFtQkMsU0FBU0MsZ0JBQWdCSDtnQkFFbEQsTUFBTXFDLGVBQWV2QixtQkFBbUI7b0JBQ3RDdEIsUUFBUUE7b0JBQ1JRLE9BQU9BO29CQUNQb0M7Z0JBQ0Y7Z0JBRUEsTUFBTVYsbUJBQW1CZCxlQUFlO29CQUN0Q04sTUFBTW9EO29CQUNOMUQsT0FBT0E7b0JBQ1BSLFFBQVFBO2dCQUNWO2dCQUVBQyxTQUFTO29CQUFDO29CQUFjO3dCQUFFVTt3QkFBZ0JrQzt3QkFBY3FCO29CQUFPO2lCQUFFO2dCQUVqRSxJQUFJO29CQUNGLE1BQU0sRUFBRWxCLE1BQU1vQixZQUFZLEVBQUUsR0FBRyxNQUFNMUQsUUFBUXdELE1BQU0sQ0FBQzt3QkFDbEQ5QixZQUFZekI7d0JBQ1ppQyxPQUFPQzt3QkFDUC9CLE1BQU1vQjt3QkFDTkssT0FBTzNDO3dCQUNQeUMsU0FBU3hCLHFCQUFxQjs0QkFBRUw7NEJBQU84QixXQUFXO3dCQUFhO29CQUNqRTtvQkFFQXJDLFNBQVM7d0JBQ1A7d0JBQ0E7NEJBQ0VVOzRCQUNBd0IsUUFBUWlDOzRCQUNSMUIsVUFBVSxHQUFHVixLQUFLQyxHQUFHLEtBQUtGLE1BQU0sRUFBRSxDQUFDO3dCQUNyQztxQkFDRDtvQkFFRCxPQUFPcUMsY0FBY0MsVUFBVTtnQkFDakMsRUFBRSxPQUFPL0QsT0FBTztvQkFDZCxJQUFJQSxpQkFBaUI2QyxTQUFTLFlBQVk3QyxTQUFTQSxNQUFNOEMsTUFBTSxLQUFLLEtBQUs7d0JBQ3ZFLE9BQU87b0JBQ1Q7b0JBQ0EvQyxTQUFTO3dCQUFDO3dCQUF5QkM7cUJBQU07b0JBQ3pDLE9BQU87Z0JBQ1Q7WUFDRjtZQUNBLE1BQU1nRSxRQUFPLEVBQUU5RCxLQUFLLEVBQUVvQyxLQUFLLEVBQXFDO2dCQUM5RCxNQUFNYixRQUFRQyxLQUFLQyxHQUFHO2dCQUN0QixNQUFNdkIsVUFBVSxNQUFNSztnQkFDdEIsTUFBTUosaUJBQWlCYyxrQkFBa0JqQjtnQkFFekMsK0NBQStDO2dCQUMvQyxNQUFNQyxtQkFBbUJDLFNBQVNDLGdCQUFnQkg7Z0JBRWxELE1BQU1xQyxlQUFldkIsbUJBQW1CO29CQUN0Q3RCLFFBQVFBO29CQUNSUSxPQUFPQTtvQkFDUG9DO2dCQUNGO2dCQUVBM0MsU0FBUztvQkFBQztvQkFBVTt3QkFBRVU7b0JBQWU7aUJBQUU7Z0JBRXZDLElBQUk7b0JBQ0YsSUFBSTRELGVBR087b0JBRVgsTUFBTXpCLFdBQVdwQixjQUFjbUI7b0JBQy9CLElBQUlDLFVBQVU7d0JBQ1o3QyxTQUFTOzRCQUFDOzRCQUFjO2dDQUFFVTtnQ0FBZ0JnQixJQUFJbUI7NEJBQVM7eUJBQUU7d0JBQ3pELE1BQU1MLE1BQU0sTUFBTS9CLFFBQVE0RCxNQUFNLENBQUM7NEJBQy9CbEMsWUFBWXpCOzRCQUNaZ0IsSUFBSW1COzRCQUNKUCxPQUFPM0M7NEJBQ1B5QyxTQUFTeEIscUJBQXFCO2dDQUFFTDtnQ0FBTzhCLFdBQVc7NEJBQWE7d0JBQ2pFO3dCQUNBaUMsZUFBZTs0QkFBRTlCOzRCQUFLK0IsUUFBUSxFQUFFO3dCQUFDO29CQUNuQyxPQUFPO3dCQUNMdkUsU0FBUzs0QkFBQzs0QkFBaUI7Z0NBQUVVO2dDQUFnQmtDOzRCQUFhO3lCQUFFO3dCQUM1RCxNQUFNSixNQUFNLE1BQU0vQixRQUFRNEQsTUFBTSxDQUFDOzRCQUMvQmxDLFlBQVl6Qjs0QkFDWmlDLE9BQU9DOzRCQUNQTixPQUFPM0M7NEJBQ1B5QyxTQUFTeEIscUJBQXFCO2dDQUM1Qkw7Z0NBQ0E4QixXQUFXOzRCQUNiO3dCQUNGO3dCQUNBaUMsZUFBZTs0QkFBRTlCLEtBQUtBLElBQUlPLElBQUksQ0FBQyxFQUFFOzRCQUFFd0IsUUFBUSxFQUFFO3dCQUFDO29CQUNoRDtvQkFFQXZFLFNBQVM7d0JBQ1A7d0JBQ0E7NEJBQ0VVOzRCQUNBd0IsUUFBUW9DOzRCQUNSN0IsVUFBVSxHQUFHVixLQUFLQyxHQUFHLEtBQUtGLE1BQU0sRUFBRSxDQUFDO3dCQUNyQztxQkFDRDtnQkFDSCxFQUFFLE9BQU96QixPQUFPO29CQUNkLElBQUlBLGlCQUFpQjZDLFNBQVMsWUFBWTdDLFNBQVNBLE1BQU04QyxNQUFNLEtBQUssS0FBSzt3QkFDdkU7b0JBQ0Y7b0JBQ0EvQyxTQUFTO3dCQUFDO3dCQUFxQkM7cUJBQU07Z0JBQ3ZDO1lBQ0Y7WUFDQSxNQUFNbUUsWUFBVyxFQUFFakUsS0FBSyxFQUFFb0MsS0FBSyxFQUFxQztnQkFDbEUsTUFBTWIsUUFBUUMsS0FBS0MsR0FBRztnQkFDdEIsTUFBTXZCLFVBQVUsTUFBTUs7Z0JBQ3RCLE1BQU1KLGlCQUFpQmMsa0JBQWtCakI7Z0JBRXpDLCtDQUErQztnQkFDL0MsTUFBTUMsbUJBQW1CQyxTQUFTQyxnQkFBZ0JIO2dCQUVsRCxNQUFNcUMsZUFBZXZCLG1CQUFtQjtvQkFDdEN0QixRQUFRQTtvQkFDUlEsT0FBT0E7b0JBQ1BvQztnQkFDRjtnQkFFQTNDLFNBQVM7b0JBQUM7b0JBQWM7d0JBQUVVO3dCQUFnQmtDO29CQUFhO2lCQUFFO2dCQUV6RCxJQUFJO29CQUNGLE1BQU0wQixlQUFlLE1BQU03RCxRQUFRNEQsTUFBTSxDQUFDO3dCQUN4Q2xDLFlBQVl6Qjt3QkFDWmlDLE9BQU9DO3dCQUNQTixPQUFPM0M7d0JBQ1B5QyxTQUFTeEIscUJBQXFCOzRCQUFFTDs0QkFBTzhCLFdBQVc7d0JBQWE7b0JBQ2pFO29CQUVBckMsU0FBUzt3QkFDUDt3QkFDQTs0QkFDRVU7NEJBQ0F3QixRQUFRb0M7NEJBQ1I3QixVQUFVLEdBQUdWLEtBQUtDLEdBQUcsS0FBS0YsTUFBTSxFQUFFLENBQUM7d0JBQ3JDO3FCQUNEO29CQUVELE9BQU93QyxhQUFhdkIsSUFBSSxDQUFDcUIsTUFBTTtnQkFDakMsRUFBRSxPQUFPL0QsT0FBTztvQkFDZCxJQUFJQSxpQkFBaUI2QyxTQUFTLFlBQVk3QyxTQUFTQSxNQUFNOEMsTUFBTSxLQUFLLEtBQUs7d0JBQ3ZFLE9BQU87b0JBQ1Q7b0JBQ0EvQyxTQUFTO3dCQUFDO3dCQUF5QkM7cUJBQU07b0JBQ3pDLE9BQU87Z0JBQ1Q7WUFDRjtZQUNBLE1BQU1vRSxPQUFNLEVBQUVsRSxLQUFLLEVBQUVvQyxLQUFLLEVBQXNDO2dCQUM5RCxNQUFNYixRQUFRQyxLQUFLQyxHQUFHO2dCQUN0QixNQUFNdkIsVUFBVSxNQUFNSztnQkFDdEIsTUFBTUosaUJBQWlCYyxrQkFBa0JqQjtnQkFFekMsK0NBQStDO2dCQUMvQyxNQUFNQyxtQkFBbUJDLFNBQVNDLGdCQUFnQkg7Z0JBRWxELE1BQU1xQyxlQUFldkIsbUJBQW1CO29CQUN0Q3RCLFFBQVFBO29CQUNSUSxPQUFPQTtvQkFDUG9DO2dCQUNGO2dCQUVBM0MsU0FBUztvQkFBQztvQkFBUzt3QkFBRVU7d0JBQWdCa0M7b0JBQWE7aUJBQUU7Z0JBRXBELElBQUk7b0JBQ0YsTUFBTVYsU0FBUyxNQUFNekIsUUFBUWdFLEtBQUssQ0FBQzt3QkFDakN0QyxZQUFZekI7d0JBQ1ppQyxPQUFPQzt3QkFDUE4sT0FBTzNDO3dCQUNQeUMsU0FBU3hCLHFCQUFxQjs0QkFBRUw7NEJBQU84QixXQUFXO3dCQUFRO29CQUM1RDtvQkFFQXJDLFNBQVM7d0JBQ1A7d0JBQ0E7NEJBQ0VVOzRCQUNBd0IsUUFBUTtnQ0FBRXFCLFdBQVdyQixPQUFPcUIsU0FBUzs0QkFBQzs0QkFDdENkLFVBQVUsR0FBR1YsS0FBS0MsR0FBRyxLQUFLRixNQUFNLEVBQUUsQ0FBQzt3QkFDckM7cUJBQ0Q7b0JBRUQsT0FBT0ksT0FBT3FCLFNBQVM7Z0JBQ3pCLEVBQUUsT0FBT2xELE9BQU87b0JBQ2QsSUFBSUEsaUJBQWlCNkMsU0FBUyxZQUFZN0MsU0FBU0EsTUFBTThDLE1BQU0sS0FBSyxLQUFLO3dCQUN2RSxPQUFPO29CQUNUO29CQUNBL0MsU0FBUzt3QkFBQzt3QkFBb0JDO3FCQUFNO29CQUNwQyxPQUFPO2dCQUNUO1lBQ0Y7WUFDQXFFLGNBQWMsT0FBT3hELFNBQVN5RDtnQkFDNUIsTUFBTUMsYUFBYSxNQUFNcEYsZUFBZTBCO2dCQUN4QyxPQUFPO29CQUNMMkQsTUFBTUQ7b0JBQ05FLE1BQU1ILFFBQVE7b0JBQ2RJLFFBQVE7b0JBQ1JDLFdBQVc7Z0JBQ2I7WUFDRjtZQUNBQyxhQUFhLE9BQU9DO2dCQUNsQix3RUFBd0U7Z0JBQ3hFLG9FQUFvRTtnQkFDcEUsT0FBTyxNQUFNQSxHQUFHLENBQUM7WUFDbkI7WUFDQWhFLFNBQVM7Z0JBQ1BpRSxlQUFlLENBQUM7WUFDbEI7UUFDRjtJQUNGO0FBQ0Y7QUFFQSxTQUFTM0YsY0FBYyxFQUFFSSxjQUFjLEdBQUUifQ==