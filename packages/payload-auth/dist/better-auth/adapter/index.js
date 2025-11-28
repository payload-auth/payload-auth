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
 */ const payloadAdapter = ({ payloadClient, adapterConfig })=>{
    /**
   * Logs debug messages if debug logging is enabled
   * @param message - The message to log
   */ function debugLog(message) {
        if (adapterConfig.enableDebugLogs) {
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
        const { transformInput, transformOutput, convertWhereClause, convertSelect, convertSort, getCollectionSlug, singleIdQuery } = createTransform(options, adapterConfig.enableDebugLogs ?? false);
        return {
            id: 'payload-adapter',
            async transaction (callback) {
                return await callback(this);
            },
            async create ({ model, data: values, select }) {
                const start = Date.now();
                const payload = await resolvePayloadClient();
                const collectionSlug = getCollectionSlug(model);
                // Validate collection exists before proceeding
                await validateCollection(payload, collectionSlug, model);
                const transformedInput = transformInput({
                    data: values,
                    model: model,
                    idType: adapterConfig.idType,
                    payload
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
                        model: model,
                        payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
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
                        model: model,
                        payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
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
                            model: model,
                            payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
                });
                const transformedInput = transformInput({
                    data: update,
                    model: model,
                    idType: adapterConfig.idType,
                    payload
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
                        model: model,
                        payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
                });
                const transformedInput = transformInput({
                    data: update,
                    model: model,
                    idType: adapterConfig.idType,
                    payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
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
                    idType: adapterConfig.idType,
                    model: model,
                    where,
                    payload
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
            options: {
                adapterConfig: {},
                ...adapterConfig
            }
        };
    };
};
export { generateSchema, payloadAdapter };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9hZGFwdGVyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckF1dGhFcnJvciB9IGZyb20gJ2JldHRlci1hdXRoJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoT3B0aW9ucywgV2hlcmUgfSBmcm9tICdiZXR0ZXItYXV0aCdcbmltcG9ydCB7IGdlbmVyYXRlU2NoZW1hIH0gZnJvbSAnLi9nZW5lcmF0ZS1zY2hlbWEnXG5pbXBvcnQgeyBjcmVhdGVUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSdcbmltcG9ydCB0eXBlIHsgUGF5bG9hZEFkYXB0ZXIgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgTW9kZWxLZXkgfSBmcm9tICcuLi9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgeyBEQkFkYXB0ZXIgfSBmcm9tICdAYmV0dGVyLWF1dGgvY29yZS9kYi9hZGFwdGVyJ1xuXG5leHBvcnQgY29uc3QgQkVUVEVSX0FVVEhfQ09OVEVYVF9LRVkgPSAncGF5bG9hZC1kYi1hZGFwdGVyJ1xuY29uc3QgUEFZTE9BRF9RVUVSWV9ERVBUSCA9IDBcblxuLyoqXG4gKiBQYXlsb2FkIGFkYXB0ZXIgZm9yIEJldHRlciBBdXRoXG4gKlxuICogVGhpcyBhZGFwdGVyIGNvbm5lY3RzIEJldHRlciBBdXRoIHRvIFBheWxvYWQgQ01TLCBhbGxvd2luZyBhdXRoZW50aWNhdGlvblxuICogb3BlcmF0aW9ucyB0byBiZSBwZXJmb3JtZWQgYWdhaW5zdCBQYXlsb2FkIGNvbGxlY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBwYXlsb2FkQ2xpZW50IC0gVGhlIFBheWxvYWQgQ01TIGNsaWVudCBpbnN0YW5jZSBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBpdFxuICogQHBhcmFtIGNvbmZpZyAtIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGFkYXB0ZXJcbiAqIEByZXR1cm5zIEEgZnVuY3Rpb24gdGhhdCBjcmVhdGVzIGEgQmV0dGVyIEF1dGggYWRhcHRlclxuICovXG5jb25zdCBwYXlsb2FkQWRhcHRlcjogUGF5bG9hZEFkYXB0ZXIgPSAoeyBwYXlsb2FkQ2xpZW50LCBhZGFwdGVyQ29uZmlnIH0pID0+IHtcbiAgLyoqXG4gICAqIExvZ3MgZGVidWcgbWVzc2FnZXMgaWYgZGVidWcgbG9nZ2luZyBpcyBlbmFibGVkXG4gICAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gbG9nXG4gICAqL1xuICBmdW5jdGlvbiBkZWJ1Z0xvZyhtZXNzYWdlOiBhbnlbXSkge1xuICAgIGlmIChhZGFwdGVyQ29uZmlnLmVuYWJsZURlYnVnTG9ncykge1xuICAgICAgY29uc29sZS5sb2coJ1twYXlsb2FkLWRiLWFkYXB0ZXJdJywgLi4ubWVzc2FnZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBlcnJvciBtZXNzYWdlc1xuICAgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIGxvZ1xuICAgKi9cbiAgZnVuY3Rpb24gZXJyb3JMb2cobWVzc2FnZTogYW55W10pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbcGF5bG9hZC1kYi1hZGFwdGVyXWAsIC4uLm1lc3NhZ2UpXG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIHdoZW4gYSBjb2xsZWN0aW9uIHNsdWcgZG9lc24ndCBleGlzdFxuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwgbmFtZSB0aGF0IGNvdWxkbid0IGJlIGZvdW5kXG4gICAqIEB0aHJvd3Mge0JldHRlckF1dGhFcnJvcn0gV2hlbiB0aGUgY29sbGVjdGlvbiBkb2Vzbid0IGV4aXN0XG4gICAqIEByZXR1cm5zIE5ldmVyIC0gRnVuY3Rpb24gYWx3YXlzIHRocm93c1xuICAgKi9cbiAgZnVuY3Rpb24gY29sbGVjdGlvblNsdWdFcnJvcihtb2RlbDogc3RyaW5nKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBCZXR0ZXJBdXRoRXJyb3IoYENvbGxlY3Rpb24gJHttb2RlbH0gZG9lcyBub3QgZXhpc3QuIFBsZWFzZSBjaGVjayB5b3VyIHBheWxvYWQgY29sbGVjdGlvbiBzbHVncyBtYXRjaCB0aGUgYmV0dGVyIGF1dGggc2NoZW1hYClcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgdGhhdCBhIGNvbGxlY3Rpb24gZXhpc3RzIGluIFBheWxvYWRcbiAgICogQHBhcmFtIHBheWxvYWQgLSBUaGUgUGF5bG9hZCBjbGllbnQgaW5zdGFuY2VcbiAgICogQHBhcmFtIGNvbGxlY3Rpb25TbHVnIC0gVGhlIGNvbGxlY3Rpb24gc2x1ZyB0byB2YWxpZGF0ZVxuICAgKiBAcGFyYW0gbW9kZWwgLSBUaGUgbW9kZWwgbmFtZSBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICogQHRocm93cyB7QmV0dGVyQXV0aEVycm9yfSBXaGVuIHRoZSBjb2xsZWN0aW9uIGRvZXNuJ3QgZXhpc3RcbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkOiBhbnksIGNvbGxlY3Rpb25TbHVnOiBzdHJpbmcsIG1vZGVsOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWNvbGxlY3Rpb25TbHVnIHx8ICEoY29sbGVjdGlvblNsdWcgaW4gcGF5bG9hZC5jb2xsZWN0aW9ucykpIHtcbiAgICAgIGNvbGxlY3Rpb25TbHVnRXJyb3IobW9kZWwpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb250ZXh0IG9iamVjdCBmb3IgUGF5bG9hZCBvcGVyYXRpb25zXG4gICAqIEBwYXJhbSBkYXRhIC0gRGF0YSB0byBpbmNsdWRlIGluIHRoZSBjb250ZXh0XG4gICAqIEByZXR1cm5zIFRoZSBjb250ZXh0IG9iamVjdCB3aXRoIEJldHRlciBBdXRoIG1ldGFkYXRhXG4gICAqL1xuICBjb25zdCBjcmVhdGVBZGFwdGVyQ29udGV4dCA9IChkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiAoe1xuICAgIFtCRVRURVJfQVVUSF9DT05URVhUX0tFWV06IHsgLi4uZGF0YSB9XG4gIH0pXG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSBQYXlsb2FkIGNsaWVudCwgaGFuZGxpbmcgYm90aCBmdW5jdGlvbiBhbmQgZGlyZWN0IHJlZmVyZW5jZXNcbiAgICogQHJldHVybnMgVGhlIHJlc29sdmVkIFBheWxvYWQgY2xpZW50XG4gICAqIEB0aHJvd3Mge0JldHRlckF1dGhFcnJvcn0gV2hlbiBCZXR0ZXIgQXV0aCBwbHVnaW4gaXMgbm90IGNvbmZpZ3VyZWRcbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVQYXlsb2FkQ2xpZW50KCkge1xuICAgIGNvbnN0IHBheWxvYWQgPSB0eXBlb2YgcGF5bG9hZENsaWVudCA9PT0gJ2Z1bmN0aW9uJyA/IGF3YWl0IHBheWxvYWRDbGllbnQoKSA6IGF3YWl0IHBheWxvYWRDbGllbnRcbiAgICBpZiAoIXBheWxvYWQuY29uZmlnPy5jdXN0b20/Lmhhc0JldHRlckF1dGhQbHVnaW4pIHtcbiAgICAgIHRocm93IG5ldyBCZXR0ZXJBdXRoRXJyb3IoYFBheWxvYWQgaXMgbm90IGNvbmZpZ3VyZWQgd2l0aCB0aGUgYmV0dGVyLWF1dGggcGx1Z2luLiBQbGVhc2UgYWRkIHRoZSBwbHVnaW4gdG8geW91ciBwYXlsb2FkIGNvbmZpZy5gKVxuICAgIH1cbiAgICByZXR1cm4gcGF5bG9hZFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBCZXR0ZXIgQXV0aCBhZGFwdGVyIGZvciBQYXlsb2FkXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQmV0dGVyIEF1dGggb3B0aW9uc1xuICAgKiBAcmV0dXJucyBBIEJldHRlciBBdXRoIGFkYXB0ZXIgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHJldHVybiAob3B0aW9uczogQmV0dGVyQXV0aE9wdGlvbnMpOiBEQkFkYXB0ZXIgPT4ge1xuICAgIGNvbnN0IHsgdHJhbnNmb3JtSW5wdXQsIHRyYW5zZm9ybU91dHB1dCwgY29udmVydFdoZXJlQ2xhdXNlLCBjb252ZXJ0U2VsZWN0LCBjb252ZXJ0U29ydCwgZ2V0Q29sbGVjdGlvblNsdWcsIHNpbmdsZUlkUXVlcnkgfSA9XG4gICAgICBjcmVhdGVUcmFuc2Zvcm0ob3B0aW9ucywgYWRhcHRlckNvbmZpZy5lbmFibGVEZWJ1Z0xvZ3MgPz8gZmFsc2UpXG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6ICdwYXlsb2FkLWFkYXB0ZXInLFxuICAgICAgYXN5bmMgdHJhbnNhY3Rpb248Uj4oY2FsbGJhY2s6ICh0eDogT21pdDxEQkFkYXB0ZXIsICd0cmFuc2FjdGlvbic+KSA9PiBQcm9taXNlPFI+KTogUHJvbWlzZTxSPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjYWxsYmFjayh0aGlzKVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGNyZWF0ZTxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiwgUiA9IFQ+KHtcbiAgICAgICAgbW9kZWwsXG4gICAgICAgIGRhdGE6IHZhbHVlcyxcbiAgICAgICAgc2VsZWN0XG4gICAgICB9OiB7XG4gICAgICAgIG1vZGVsOiBzdHJpbmdcbiAgICAgICAgZGF0YTogVFxuICAgICAgICBzZWxlY3Q/OiBzdHJpbmdbXVxuICAgICAgfSk6IFByb21pc2U8Uj4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHJlc29sdmVQYXlsb2FkQ2xpZW50KClcbiAgICAgICAgY29uc3QgY29sbGVjdGlvblNsdWcgPSBnZXRDb2xsZWN0aW9uU2x1Zyhtb2RlbCBhcyBNb2RlbEtleSlcblxuICAgICAgICAvLyBWYWxpZGF0ZSBjb2xsZWN0aW9uIGV4aXN0cyBiZWZvcmUgcHJvY2VlZGluZ1xuICAgICAgICBhd2FpdCB2YWxpZGF0ZUNvbGxlY3Rpb24ocGF5bG9hZCwgY29sbGVjdGlvblNsdWcsIG1vZGVsKVxuXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkSW5wdXQgPSB0cmFuc2Zvcm1JbnB1dCh7XG4gICAgICAgICAgZGF0YTogdmFsdWVzLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICBpZFR5cGU6IGFkYXB0ZXJDb25maWcuaWRUeXBlLFxuICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSlcblxuICAgICAgICBkZWJ1Z0xvZyhbJ2NyZWF0ZScsIHsgY29sbGVjdGlvblNsdWcsIHRyYW5zZm9ybWVkSW5wdXQsIHNlbGVjdCB9XSlcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBheWxvYWQuY3JlYXRlKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgZGF0YTogdHJhbnNmb3JtZWRJbnB1dCxcbiAgICAgICAgICAgIHNlbGVjdDogY29udmVydFNlbGVjdChtb2RlbCBhcyBNb2RlbEtleSwgc2VsZWN0KSxcbiAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHsgbW9kZWwsIG9wZXJhdGlvbjogJ2NyZWF0ZScgfSksXG4gICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFJlc3VsdCA9IHRyYW5zZm9ybU91dHB1dCh7XG4gICAgICAgICAgICBkb2M6IHJlc3VsdCxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVidWdMb2coW1xuICAgICAgICAgICAgJ2NyZWF0ZSByZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSZXN1bHQsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFJlc3VsdCBhcyBSXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgZXJyb3JMb2coWydFcnJvciBpbiBjcmVhdGluZzonLCBtb2RlbCwgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiBudWxsIGFzIFJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGZpbmRPbmU8Uj4oeyBtb2RlbCwgd2hlcmUsIHNlbGVjdCB9OiB7IG1vZGVsOiBzdHJpbmc7IHdoZXJlOiBXaGVyZVtdOyBzZWxlY3Q/OiBzdHJpbmdbXSB9KTogUHJvbWlzZTxSIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHJlc29sdmVQYXlsb2FkQ2xpZW50KClcbiAgICAgICAgY29uc3QgY29sbGVjdGlvblNsdWcgPSBnZXRDb2xsZWN0aW9uU2x1Zyhtb2RlbCBhcyBNb2RlbEtleSlcblxuICAgICAgICAvLyBWYWxpZGF0ZSBjb2xsZWN0aW9uIGV4aXN0cyBiZWZvcmUgcHJvY2VlZGluZ1xuICAgICAgICBhd2FpdCB2YWxpZGF0ZUNvbGxlY3Rpb24ocGF5bG9hZCwgY29sbGVjdGlvblNsdWcsIG1vZGVsKVxuXG4gICAgICAgIGNvbnN0IHBheWxvYWRXaGVyZSA9IGNvbnZlcnRXaGVyZUNsYXVzZSh7XG4gICAgICAgICAgaWRUeXBlOiBhZGFwdGVyQ29uZmlnLmlkVHlwZSxcbiAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXksXG4gICAgICAgICAgd2hlcmUsXG4gICAgICAgICAgcGF5bG9hZFxuICAgICAgICB9KVxuXG4gICAgICAgIGRlYnVnTG9nKFsnZmluZE9uZScsIHsgY29sbGVjdGlvblNsdWcgfV0pXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBzaW5nbGVJZCA9IHNpbmdsZUlkUXVlcnkocGF5bG9hZFdoZXJlKVxuICAgICAgICAgIGxldCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsID0gbnVsbFxuXG4gICAgICAgICAgaWYgKHNpbmdsZUlkKSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ2ZpbmRPbmVCeUlEJywgeyBjb2xsZWN0aW9uU2x1ZywgaWQ6IHNpbmdsZUlkIH1dKVxuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgcGF5bG9hZC5maW5kQnlJRCh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICBpZDogc2luZ2xlSWQsXG4gICAgICAgICAgICAgIHNlbGVjdDogY29udmVydFNlbGVjdChtb2RlbCBhcyBNb2RlbEtleSwgc2VsZWN0KSxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ2ZpbmRPbmVCeUlEJ1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEhcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnTG9nKFsnZmluZE9uZUJ5V2hlcmUnLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUgfV0pXG4gICAgICAgICAgICBjb25zdCBkb2NzID0gYXdhaXQgcGF5bG9hZC5maW5kKHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIHdoZXJlOiBwYXlsb2FkV2hlcmUsXG4gICAgICAgICAgICAgIHNlbGVjdDogY29udmVydFNlbGVjdChtb2RlbCBhcyBNb2RlbEtleSwgc2VsZWN0KSxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ2ZpbmRPbmVCeVdoZXJlJ1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEgsXG4gICAgICAgICAgICAgIGxpbWl0OiAxXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmVzdWx0ID0gZG9jcy5kb2NzWzBdXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRSZXN1bHQgPSB0cmFuc2Zvcm1PdXRwdXQ8dHlwZW9mIHJlc3VsdCB8IG51bGw+KHtcbiAgICAgICAgICAgIGRvYzogcmVzdWx0LFxuICAgICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5LFxuICAgICAgICAgICAgcGF5bG9hZFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnZmluZE9uZSByZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSZXN1bHQsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFJlc3VsdCBhcyBSXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gZmluZE9uZTogJywgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3luYyBmaW5kTWFueTxSPih7XG4gICAgICAgIG1vZGVsLFxuICAgICAgICB3aGVyZSxcbiAgICAgICAgbGltaXQgPSAxMCxcbiAgICAgICAgc29ydEJ5LFxuICAgICAgICBvZmZzZXQgPSAwXG4gICAgICB9OiB7XG4gICAgICAgIG1vZGVsOiBzdHJpbmdcbiAgICAgICAgd2hlcmU/OiBXaGVyZVtdXG4gICAgICAgIGxpbWl0PzogbnVtYmVyXG4gICAgICAgIHNvcnRCeT86IHtcbiAgICAgICAgICBmaWVsZDogc3RyaW5nXG4gICAgICAgICAgZGlyZWN0aW9uOiAnYXNjJyB8ICdkZXNjJ1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldD86IG51bWJlclxuICAgICAgfSk6IFByb21pc2U8UltdPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzb2x2ZVBheWxvYWRDbGllbnQoKVxuICAgICAgICBjb25zdCBjb2xsZWN0aW9uU2x1ZyA9IGdldENvbGxlY3Rpb25TbHVnKG1vZGVsIGFzIE1vZGVsS2V5KVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGNvbGxlY3Rpb24gZXhpc3RzIGJlZm9yZSBwcm9jZWVkaW5nXG4gICAgICAgIGF3YWl0IHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkLCBjb2xsZWN0aW9uU2x1ZywgbW9kZWwpXG5cbiAgICAgICAgY29uc3QgcGF5bG9hZFdoZXJlID0gY29udmVydFdoZXJlQ2xhdXNlKHtcbiAgICAgICAgICBpZFR5cGU6IGFkYXB0ZXJDb25maWcuaWRUeXBlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICB3aGVyZSxcbiAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVidWdMb2coWydmaW5kTWFueScsIHsgY29sbGVjdGlvblNsdWcsIHNvcnRCeSwgbGltaXQsIG9mZnNldCB9XSlcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCByZXN1bHQ6IHtcbiAgICAgICAgICAgIGRvY3M6IFJlY29yZDxzdHJpbmcsIGFueT5bXVxuICAgICAgICAgICAgdG90YWxEb2NzOiBudW1iZXJcbiAgICAgICAgICB9IHwgbnVsbCA9IG51bGxcblxuICAgICAgICAgIGNvbnN0IHNpbmdsZUlkID0gc2luZ2xlSWRRdWVyeShwYXlsb2FkV2hlcmUpXG4gICAgICAgICAgaWYgKHNpbmdsZUlkKSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ2ZpbmRNYW55QnlTaW5nbGVJRCcsIHsgY29sbGVjdGlvblNsdWcsIGlkOiBzaW5nbGVJZCB9XSlcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGF3YWl0IHBheWxvYWQuZmluZEJ5SUQoe1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgaWQ6IHNpbmdsZUlkLFxuICAgICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ2ZpbmRNYW55QnlTaW5nbGVJRCdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXN1bHQgPSB7IGRvY3M6IGRvYyA/IFtkb2NdIDogW10sIHRvdGFsRG9jczogZG9jID8gMSA6IDAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ2ZpbmRNYW55QnlXaGVyZScsIHsgY29sbGVjdGlvblNsdWcsIHBheWxvYWRXaGVyZSB9XSlcbiAgICAgICAgICAgIGNvbnN0IHNwaWxsID0gb2Zmc2V0ICUgbGltaXRcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBNYXRoLmZsb29yKG9mZnNldCAvIGxpbWl0KSArIDFcbiAgICAgICAgICAgIGNvbnN0IGZldGNoTGltaXQgPSBzcGlsbCA/IGxpbWl0ICsgc3BpbGwgOiBsaW1pdFxuXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBwYXlsb2FkLmZpbmQoe1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgd2hlcmU6IHBheWxvYWRXaGVyZSxcbiAgICAgICAgICAgICAgbGltaXQ6IGZldGNoTGltaXQsXG4gICAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgICAgICAgIHNvcnQ6IGNvbnZlcnRTb3J0KG1vZGVsIGFzIE1vZGVsS2V5LCBzb3J0QnkpLFxuICAgICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ2ZpbmRNYW55QnlXaGVyZSdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXN1bHQgPSB7IGRvY3M6IHJlcy5kb2NzLnNsaWNlKHNwaWxsLCBzcGlsbCArIGxpbWl0KSwgdG90YWxEb2NzOiByZXMudG90YWxEb2NzIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFJlc3VsdCA9XG4gICAgICAgICAgICByZXN1bHQ/LmRvY3MubWFwKChkb2MpID0+XG4gICAgICAgICAgICAgIHRyYW5zZm9ybU91dHB1dCh7XG4gICAgICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICAgICAgICBwYXlsb2FkXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApID8/IFtdXG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnZmluZE1hbnkgcmVzdWx0JyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIHRyYW5zZm9ybWVkUmVzdWx0LFxuICAgICAgICAgICAgICBkdXJhdGlvbjogYCR7RGF0ZS5ub3coKSAtIHN0YXJ0fW1zYFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRSZXN1bHQgYXMgUltdXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXSBhcyBSW11cbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyb3JMb2coWydFcnJvciBpbiBmaW5kTWFueTogJywgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiBbXSBhcyBSW11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIHVwZGF0ZTxSPih7IG1vZGVsLCB3aGVyZSwgdXBkYXRlIH06IHsgbW9kZWw6IHN0cmluZzsgd2hlcmU6IFdoZXJlW107IHVwZGF0ZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfSk6IFByb21pc2U8UiB8IG51bGw+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNvbHZlUGF5bG9hZENsaWVudCgpXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25TbHVnID0gZ2V0Q29sbGVjdGlvblNsdWcobW9kZWwgYXMgTW9kZWxLZXkpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgY29sbGVjdGlvbiBleGlzdHMgYmVmb3JlIHByb2NlZWRpbmdcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVDb2xsZWN0aW9uKHBheWxvYWQsIGNvbGxlY3Rpb25TbHVnLCBtb2RlbClcblxuICAgICAgICBjb25zdCBwYXlsb2FkV2hlcmUgPSBjb252ZXJ0V2hlcmVDbGF1c2Uoe1xuICAgICAgICAgIGlkVHlwZTogYWRhcHRlckNvbmZpZy5pZFR5cGUsXG4gICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5LFxuICAgICAgICAgIHdoZXJlLFxuICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZElucHV0ID0gdHJhbnNmb3JtSW5wdXQoe1xuICAgICAgICAgIGRhdGE6IHVwZGF0ZSxcbiAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXksXG4gICAgICAgICAgaWRUeXBlOiBhZGFwdGVyQ29uZmlnLmlkVHlwZSxcbiAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVidWdMb2coWyd1cGRhdGUnLCB7IGNvbGxlY3Rpb25TbHVnLCB1cGRhdGUgfV0pXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbCA9IG51bGxcbiAgICAgICAgICBjb25zdCBpZCA9IHNpbmdsZUlkUXVlcnkocGF5bG9hZFdoZXJlKVxuXG4gICAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ3VwZGF0ZUJ5SUQnLCB7IGNvbGxlY3Rpb25TbHVnLCBpZCB9XSlcbiAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHBheWxvYWQudXBkYXRlKHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAgICBkYXRhOiB0cmFuc2Zvcm1lZElucHV0LFxuICAgICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoeyBtb2RlbCwgb3BlcmF0aW9uOiAndXBkYXRlQnlJRCcgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnTG9nKFsndXBkYXRlQnlXaGVyZScsIHsgY29sbGVjdGlvblNsdWcsIHBheWxvYWRXaGVyZSB9XSlcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGF3YWl0IHBheWxvYWQudXBkYXRlKHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIHdoZXJlOiBwYXlsb2FkV2hlcmUsXG4gICAgICAgICAgICAgIGRhdGE6IHRyYW5zZm9ybWVkSW5wdXQsXG4gICAgICAgICAgICAgIGRlcHRoOiBQQVlMT0FEX1FVRVJZX0RFUFRILFxuICAgICAgICAgICAgICBjb250ZXh0OiBjcmVhdGVBZGFwdGVyQ29udGV4dCh7XG4gICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uOiAndXBkYXRlQnlXaGVyZSdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXN1bHQgPSBkb2MuZG9jc1swXVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUmVzdWx0ID0gdHJhbnNmb3JtT3V0cHV0PHR5cGVvZiByZXN1bHQgfCBudWxsPih7XG4gICAgICAgICAgICBkb2M6IHJlc3VsdCxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVidWdMb2coW1xuICAgICAgICAgICAgJ3VwZGF0ZS1yZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRSZXN1bHQsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZFJlc3VsdCBhcyBSXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gdXBkYXRlOiAnLCBlcnJvcl0pXG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIHVwZGF0ZU1hbnkoeyBtb2RlbCwgd2hlcmUsIHVwZGF0ZSB9OiB7IG1vZGVsOiBzdHJpbmc7IHdoZXJlOiBXaGVyZVtdOyB1cGRhdGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IERhdGUubm93KClcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHJlc29sdmVQYXlsb2FkQ2xpZW50KClcbiAgICAgICAgY29uc3QgY29sbGVjdGlvblNsdWcgPSBnZXRDb2xsZWN0aW9uU2x1Zyhtb2RlbCBhcyBNb2RlbEtleSlcblxuICAgICAgICAvLyBWYWxpZGF0ZSBjb2xsZWN0aW9uIGV4aXN0cyBiZWZvcmUgcHJvY2VlZGluZ1xuICAgICAgICBhd2FpdCB2YWxpZGF0ZUNvbGxlY3Rpb24ocGF5bG9hZCwgY29sbGVjdGlvblNsdWcsIG1vZGVsKVxuXG4gICAgICAgIGNvbnN0IHBheWxvYWRXaGVyZSA9IGNvbnZlcnRXaGVyZUNsYXVzZSh7XG4gICAgICAgICAgaWRUeXBlOiBhZGFwdGVyQ29uZmlnLmlkVHlwZSxcbiAgICAgICAgICBtb2RlbDogbW9kZWwgYXMgTW9kZWxLZXksXG4gICAgICAgICAgd2hlcmUsXG4gICAgICAgICAgcGF5bG9hZFxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkSW5wdXQgPSB0cmFuc2Zvcm1JbnB1dCh7XG4gICAgICAgICAgZGF0YTogdXBkYXRlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICBpZFR5cGU6IGFkYXB0ZXJDb25maWcuaWRUeXBlLFxuICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSlcblxuICAgICAgICBkZWJ1Z0xvZyhbJ3VwZGF0ZU1hbnknLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUsIHVwZGF0ZSB9XSlcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZG9jczogdXBkYXRlUmVzdWx0IH0gPSBhd2FpdCBwYXlsb2FkLnVwZGF0ZSh7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgIHdoZXJlOiBwYXlsb2FkV2hlcmUsXG4gICAgICAgICAgICBkYXRhOiB0cmFuc2Zvcm1lZElucHV0LFxuICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEgsXG4gICAgICAgICAgICBjb250ZXh0OiBjcmVhdGVBZGFwdGVyQ29udGV4dCh7IG1vZGVsLCBvcGVyYXRpb246ICd1cGRhdGVNYW55JyB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAndXBkYXRlTWFueSByZXN1bHQnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgICAgcmVzdWx0OiB1cGRhdGVSZXN1bHQsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiB1cGRhdGVSZXN1bHQ/Lmxlbmd0aCB8fCAwXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gdXBkYXRlTWFueTogJywgZXJyb3JdKVxuICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhc3luYyBkZWxldGUoeyBtb2RlbCwgd2hlcmUgfTogeyBtb2RlbDogc3RyaW5nOyB3aGVyZTogV2hlcmVbXSB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzb2x2ZVBheWxvYWRDbGllbnQoKVxuICAgICAgICBjb25zdCBjb2xsZWN0aW9uU2x1ZyA9IGdldENvbGxlY3Rpb25TbHVnKG1vZGVsIGFzIE1vZGVsS2V5KVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGNvbGxlY3Rpb24gZXhpc3RzIGJlZm9yZSBwcm9jZWVkaW5nXG4gICAgICAgIGF3YWl0IHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkLCBjb2xsZWN0aW9uU2x1ZywgbW9kZWwpXG5cbiAgICAgICAgY29uc3QgcGF5bG9hZFdoZXJlID0gY29udmVydFdoZXJlQ2xhdXNlKHtcbiAgICAgICAgICBpZFR5cGU6IGFkYXB0ZXJDb25maWcuaWRUeXBlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICB3aGVyZSxcbiAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVidWdMb2coWydkZWxldGUnLCB7IGNvbGxlY3Rpb25TbHVnIH1dKVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IGRlbGV0ZVJlc3VsdDoge1xuICAgICAgICAgICAgZG9jOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgbnVsbFxuICAgICAgICAgICAgZXJyb3JzOiBhbnlbXVxuICAgICAgICAgIH0gfCBudWxsID0gbnVsbFxuXG4gICAgICAgICAgY29uc3Qgc2luZ2xlSWQgPSBzaW5nbGVJZFF1ZXJ5KHBheWxvYWRXaGVyZSlcbiAgICAgICAgICBpZiAoc2luZ2xlSWQpIHtcbiAgICAgICAgICAgIGRlYnVnTG9nKFsnZGVsZXRlQnlJRCcsIHsgY29sbGVjdGlvblNsdWcsIGlkOiBzaW5nbGVJZCB9XSlcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IGF3YWl0IHBheWxvYWQuZGVsZXRlKHtcbiAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICAgIGlkOiBzaW5nbGVJZCxcbiAgICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEgsXG4gICAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHsgbW9kZWwsIG9wZXJhdGlvbjogJ2RlbGV0ZUJ5SUQnIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgZGVsZXRlUmVzdWx0ID0geyBkb2MsIGVycm9yczogW10gfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z0xvZyhbJ2RlbGV0ZUJ5V2hlcmUnLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUgfV0pXG4gICAgICAgICAgICBjb25zdCBkb2MgPSBhd2FpdCBwYXlsb2FkLmRlbGV0ZSh7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgICAgY29udGV4dDogY3JlYXRlQWRhcHRlckNvbnRleHQoe1xuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wZXJhdGlvbjogJ2RlbGV0ZUJ5V2hlcmUnXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgZGVsZXRlUmVzdWx0ID0geyBkb2M6IGRvYy5kb2NzWzBdLCBlcnJvcnM6IFtdIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkZWJ1Z0xvZyhbXG4gICAgICAgICAgICAnZGVsZXRlIHJlc3VsdCcsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICByZXN1bHQ6IGRlbGV0ZVJlc3VsdCxcbiAgICAgICAgICAgICAgZHVyYXRpb246IGAke0RhdGUubm93KCkgLSBzdGFydH1tc2BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmICdzdGF0dXMnIGluIGVycm9yICYmIGVycm9yLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyb3JMb2coWydFcnJvciBpbiBkZWxldGU6ICcsIGVycm9yXSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGRlbGV0ZU1hbnkoeyBtb2RlbCwgd2hlcmUgfTogeyBtb2RlbDogc3RyaW5nOyB3aGVyZTogV2hlcmVbXSB9KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZXNvbHZlUGF5bG9hZENsaWVudCgpXG4gICAgICAgIGNvbnN0IGNvbGxlY3Rpb25TbHVnID0gZ2V0Q29sbGVjdGlvblNsdWcobW9kZWwgYXMgTW9kZWxLZXkpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgY29sbGVjdGlvbiBleGlzdHMgYmVmb3JlIHByb2NlZWRpbmdcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVDb2xsZWN0aW9uKHBheWxvYWQsIGNvbGxlY3Rpb25TbHVnLCBtb2RlbClcblxuICAgICAgICBjb25zdCBwYXlsb2FkV2hlcmUgPSBjb252ZXJ0V2hlcmVDbGF1c2Uoe1xuICAgICAgICAgIGlkVHlwZTogYWRhcHRlckNvbmZpZy5pZFR5cGUsXG4gICAgICAgICAgbW9kZWw6IG1vZGVsIGFzIE1vZGVsS2V5LFxuICAgICAgICAgIHdoZXJlLFxuICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSlcblxuICAgICAgICBkZWJ1Z0xvZyhbJ2RlbGV0ZU1hbnknLCB7IGNvbGxlY3Rpb25TbHVnLCBwYXlsb2FkV2hlcmUgfV0pXG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBkZWxldGVSZXN1bHQgPSBhd2FpdCBwYXlsb2FkLmRlbGV0ZSh7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uU2x1ZyxcbiAgICAgICAgICAgIHdoZXJlOiBwYXlsb2FkV2hlcmUsXG4gICAgICAgICAgICBkZXB0aDogUEFZTE9BRF9RVUVSWV9ERVBUSCxcbiAgICAgICAgICAgIGNvbnRleHQ6IGNyZWF0ZUFkYXB0ZXJDb250ZXh0KHsgbW9kZWwsIG9wZXJhdGlvbjogJ2RlbGV0ZU1hbnknIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlYnVnTG9nKFtcbiAgICAgICAgICAgICdkZWxldGVNYW55IHJlc3VsdCcsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICByZXN1bHQ6IGRlbGV0ZVJlc3VsdCxcbiAgICAgICAgICAgICAgZHVyYXRpb246IGAke0RhdGUubm93KCkgLSBzdGFydH1tc2BcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKVxuXG4gICAgICAgICAgcmV0dXJuIGRlbGV0ZVJlc3VsdC5kb2NzLmxlbmd0aFxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmICdzdGF0dXMnIGluIGVycm9yICYmIGVycm9yLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvckxvZyhbJ0Vycm9yIGluIGRlbGV0ZU1hbnk6ICcsIGVycm9yXSlcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYXN5bmMgY291bnQoeyBtb2RlbCwgd2hlcmUgfTogeyBtb2RlbDogc3RyaW5nOyB3aGVyZT86IFdoZXJlW10gfSk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKVxuICAgICAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcmVzb2x2ZVBheWxvYWRDbGllbnQoKVxuICAgICAgICBjb25zdCBjb2xsZWN0aW9uU2x1ZyA9IGdldENvbGxlY3Rpb25TbHVnKG1vZGVsIGFzIE1vZGVsS2V5KVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGNvbGxlY3Rpb24gZXhpc3RzIGJlZm9yZSBwcm9jZWVkaW5nXG4gICAgICAgIGF3YWl0IHZhbGlkYXRlQ29sbGVjdGlvbihwYXlsb2FkLCBjb2xsZWN0aW9uU2x1ZywgbW9kZWwpXG5cbiAgICAgICAgY29uc3QgcGF5bG9hZFdoZXJlID0gY29udmVydFdoZXJlQ2xhdXNlKHtcbiAgICAgICAgICBpZFR5cGU6IGFkYXB0ZXJDb25maWcuaWRUeXBlLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCBhcyBNb2RlbEtleSxcbiAgICAgICAgICB3aGVyZSxcbiAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVidWdMb2coWydjb3VudCcsIHsgY29sbGVjdGlvblNsdWcsIHBheWxvYWRXaGVyZSB9XSlcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBheWxvYWQuY291bnQoe1xuICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvblNsdWcsXG4gICAgICAgICAgICB3aGVyZTogcGF5bG9hZFdoZXJlLFxuICAgICAgICAgICAgZGVwdGg6IFBBWUxPQURfUVVFUllfREVQVEgsXG4gICAgICAgICAgICBjb250ZXh0OiBjcmVhdGVBZGFwdGVyQ29udGV4dCh7IG1vZGVsLCBvcGVyYXRpb246ICdjb3VudCcgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVidWdMb2coW1xuICAgICAgICAgICAgJ2NvdW50IHJlc3VsdCcsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25TbHVnLFxuICAgICAgICAgICAgICByZXN1bHQ6IHsgdG90YWxEb2NzOiByZXN1bHQudG90YWxEb2NzIH0sXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiBgJHtEYXRlLm5vdygpIC0gc3RhcnR9bXNgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcblxuICAgICAgICAgIHJldHVybiByZXN1bHQudG90YWxEb2NzXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgJ3N0YXR1cycgaW4gZXJyb3IgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTG9nKFsnRXJyb3IgaW4gY291bnQ6ICcsIGVycm9yXSlcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlU2NoZW1hOiBhc3luYyAob3B0aW9ucywgZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBzY2hlbWFDb2RlID0gYXdhaXQgZ2VuZXJhdGVTY2hlbWEob3B0aW9ucylcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBzY2hlbWFDb2RlLFxuICAgICAgICAgIHBhdGg6IGZpbGUgfHwgJ3NjaGVtYS50cycsXG4gICAgICAgICAgYXBwZW5kOiBmYWxzZSxcbiAgICAgICAgICBvdmVyd3JpdGU6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWRhcHRlckNvbmZpZzoge30gYXMgYW55LFxuICAgICAgICAuLi5hZGFwdGVyQ29uZmlnXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IGdlbmVyYXRlU2NoZW1hLCBwYXlsb2FkQWRhcHRlciB9XG4iXSwibmFtZXMiOlsiQmV0dGVyQXV0aEVycm9yIiwiZ2VuZXJhdGVTY2hlbWEiLCJjcmVhdGVUcmFuc2Zvcm0iLCJCRVRURVJfQVVUSF9DT05URVhUX0tFWSIsIlBBWUxPQURfUVVFUllfREVQVEgiLCJwYXlsb2FkQWRhcHRlciIsInBheWxvYWRDbGllbnQiLCJhZGFwdGVyQ29uZmlnIiwiZGVidWdMb2ciLCJtZXNzYWdlIiwiZW5hYmxlRGVidWdMb2dzIiwiY29uc29sZSIsImxvZyIsImVycm9yTG9nIiwiZXJyb3IiLCJjb2xsZWN0aW9uU2x1Z0Vycm9yIiwibW9kZWwiLCJ2YWxpZGF0ZUNvbGxlY3Rpb24iLCJwYXlsb2FkIiwiY29sbGVjdGlvblNsdWciLCJjb2xsZWN0aW9ucyIsImNyZWF0ZUFkYXB0ZXJDb250ZXh0IiwiZGF0YSIsInJlc29sdmVQYXlsb2FkQ2xpZW50IiwiY29uZmlnIiwiY3VzdG9tIiwiaGFzQmV0dGVyQXV0aFBsdWdpbiIsIm9wdGlvbnMiLCJ0cmFuc2Zvcm1JbnB1dCIsInRyYW5zZm9ybU91dHB1dCIsImNvbnZlcnRXaGVyZUNsYXVzZSIsImNvbnZlcnRTZWxlY3QiLCJjb252ZXJ0U29ydCIsImdldENvbGxlY3Rpb25TbHVnIiwic2luZ2xlSWRRdWVyeSIsImlkIiwidHJhbnNhY3Rpb24iLCJjYWxsYmFjayIsImNyZWF0ZSIsInZhbHVlcyIsInNlbGVjdCIsInN0YXJ0IiwiRGF0ZSIsIm5vdyIsInRyYW5zZm9ybWVkSW5wdXQiLCJpZFR5cGUiLCJyZXN1bHQiLCJjb2xsZWN0aW9uIiwiY29udGV4dCIsIm9wZXJhdGlvbiIsImRlcHRoIiwidHJhbnNmb3JtZWRSZXN1bHQiLCJkb2MiLCJkdXJhdGlvbiIsImZpbmRPbmUiLCJ3aGVyZSIsInBheWxvYWRXaGVyZSIsInNpbmdsZUlkIiwiZmluZEJ5SUQiLCJkb2NzIiwiZmluZCIsImxpbWl0IiwiRXJyb3IiLCJzdGF0dXMiLCJmaW5kTWFueSIsInNvcnRCeSIsIm9mZnNldCIsInRvdGFsRG9jcyIsInNwaWxsIiwicGFnZSIsIk1hdGgiLCJmbG9vciIsImZldGNoTGltaXQiLCJyZXMiLCJzb3J0Iiwic2xpY2UiLCJtYXAiLCJ1cGRhdGUiLCJ1cGRhdGVNYW55IiwidXBkYXRlUmVzdWx0IiwibGVuZ3RoIiwiZGVsZXRlIiwiZGVsZXRlUmVzdWx0IiwiZXJyb3JzIiwiZGVsZXRlTWFueSIsImNvdW50IiwiY3JlYXRlU2NoZW1hIiwiZmlsZSIsInNjaGVtYUNvZGUiLCJjb2RlIiwicGF0aCIsImFwcGVuZCIsIm92ZXJ3cml0ZSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsZUFBZSxRQUFRLGNBQWE7QUFFN0MsU0FBU0MsY0FBYyxRQUFRLG9CQUFtQjtBQUNsRCxTQUFTQyxlQUFlLFFBQVEsY0FBYTtBQUs3QyxPQUFPLE1BQU1DLDBCQUEwQixxQkFBb0I7QUFDM0QsTUFBTUMsc0JBQXNCO0FBRTVCOzs7Ozs7Ozs7Q0FTQyxHQUNELE1BQU1DLGlCQUFpQyxDQUFDLEVBQUVDLGFBQWEsRUFBRUMsYUFBYSxFQUFFO0lBQ3RFOzs7R0FHQyxHQUNELFNBQVNDLFNBQVNDLE9BQWM7UUFDOUIsSUFBSUYsY0FBY0csZUFBZSxFQUFFO1lBQ2pDQyxRQUFRQyxHQUFHLENBQUMsMkJBQTJCSDtRQUN6QztJQUNGO0lBRUE7OztHQUdDLEdBQ0QsU0FBU0ksU0FBU0osT0FBYztRQUM5QkUsUUFBUUcsS0FBSyxDQUFDLENBQUMsb0JBQW9CLENBQUMsS0FBS0w7SUFDM0M7SUFFQTs7Ozs7R0FLQyxHQUNELFNBQVNNLG9CQUFvQkMsS0FBYTtRQUN4QyxNQUFNLElBQUloQixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUVnQixNQUFNLHdGQUF3RixDQUFDO0lBQ3pJO0lBRUE7Ozs7OztHQU1DLEdBQ0QsZUFBZUMsbUJBQW1CQyxPQUFZLEVBQUVD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