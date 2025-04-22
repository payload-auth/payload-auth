import { BetterAuthError } from 'better-auth'
import type { Adapter, BetterAuthOptions, Where } from 'better-auth'
import { generateSchema } from './generate-schema'
import { createAdapterContext, convertWhereClause, getCollectionName, mapInputData, mapSelectFields, mapOutputData } from './utils'
import { APIError } from 'better-auth/api'
import { getAuthTables } from 'better-auth/db'
import type { PayloadAdapter } from './types'

export const PAYLOAD_QUERY_DEPTH = 5

const payloadAdapter: PayloadAdapter = (payloadClient, config) => {
  function debugLog(message: any[]) {
    if (config.enableDebugLogs) {
      console.log('[payload-db-adapter]', ...message)
    }
  }

  async function resolvePayloadClient() {
    const payload = typeof payloadClient === 'function' ? await payloadClient() : await payloadClient
    if (!payload.config?.custom?.hasBetterAuthPlugin) {
      throw new BetterAuthError(`Payload is not configured with the better-auth plugin. Please add the plugin to your payload config.`)
    }
    return payload
  }

  return (authOptions: BetterAuthOptions): Adapter => {
    const schema = getAuthTables(authOptions)

    return {
      id: 'payload-adapter',
      async create<T extends Record<string, any>, R = T>({
        model,
        data: values,
        select
      }: {
        model: string
        data: T
        select?: string[]
      }): Promise<R> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        const mappedData = mapInputData(model, values, schema)
        debugLog(['create', { collection, model, data: mappedData }])
        try {
          const response = await payload.create({
            collection,
            data: mappedData,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'create' })
          })

          if (select?.length) {
            const filtered: Record<string, unknown> = {}
            select.forEach((field) => {
              if ((response as any)[field] !== undefined) {
                filtered[field] = (response as any)[field]
              }
            })
            return filtered as R
          }
          return response as R
        } catch (error) {
          debugLog(['error in create', error])
          throw error
        }
      },

      async findOne<T>({ model, where, select }: { model: string; where: Where[]; select?: string[] }): Promise<T | null> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['findOne', { collection, model, rawWhere: where, where: convertWhereClause(where, model, schema), select }])
        try {
          const response = await payload.find({
            collection,
            where: convertWhereClause(where, model, schema),
            select: mapSelectFields(model, select, schema),
            limit: 1,
            showHiddenFields: true,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'findOne' })
          })

          if (!response.docs?.length) return null

          const result = response.docs.at(0)

          debugLog(['findOne result', { ...mapOutputData(model, result as any, schema)  }])

          if (select?.length) {
            const filtered: Record<string, unknown> = {}
            select.forEach((field) => {
              if ((result as any)[field] !== undefined) {
                filtered[field] = (result as any)[field]
              }
            })
            return filtered as T
          }

          return mapOutputData(model, result as any, schema) as T
        } catch (error) {
          debugLog(['error in findOne', error])
          throw error
        }
      },

      async findMany<T>({
        model,
        where,
        limit = 100,
        offset = 0,
        sortBy
      }: {
        model: string
        where?: Where[]
        limit?: number
        offset?: number
        sortBy?: { field: string; direction: 'asc' | 'desc' }
      }): Promise<T[]> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['findMany', { collection, model, where: convertWhereClause(where, model, schema) }])
        try {
          const response = await payload.find({
            collection,
            where: where ? convertWhereClause(where, model, schema) : {},
            select: mapSelectFields(model, undefined, schema),
            limit,
            showHiddenFields: true,
            page: Math.floor(offset / limit) + 1,
            sort: sortBy ? `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}` : undefined,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'findMany' })
          })

          const mappedDocs = (response.docs as unknown[]).map((d) => mapOutputData(model, d as any, schema)) as T[]
          return mappedDocs || []
        } catch (error) {
          debugLog(['error in findMany', error])
          throw error
        }
      },

      async update<T>({ model, where, update: values }: { model: string; where: Where[]; update: Record<string, any> }): Promise<T | null> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['update', { collection, model }])
        try {
          const findResponse = await payload.find({
            collection,
            where: convertWhereClause(where, model, schema),
            limit: 1,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'updateFind' })
          })

          if (!findResponse.docs?.length) return null

          const docToUpdate = findResponse.docs[0]

          const response = await payload.update({
            collection,
            id: docToUpdate.id,
            data: values,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'update' })
          })

          return mapOutputData(model, response as any, schema) as unknown as T
        } catch (error: any) {
          debugLog(['error in update', error])
          throw new APIError('BAD_REQUEST', {
            message: error.message
          })
        }
      },

      async updateMany({ model, where, update: values }) {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['updateMany', { collection, model }])
        try {
          const findResponse = await payload.find({
            collection,
            where: convertWhereClause(where, model, schema),
            limit: 1000,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'updateManyFind' })
          })

          if (!findResponse.docs?.length) return 0

          const updatePromises = findResponse.docs.map((doc) =>
            payload.update({
              collection,
              id: doc.id,
              data: values,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'updateMany' })
            })
          )

          await Promise.all(updatePromises)

          return findResponse.docs.length
        } catch (error: any) {
          debugLog(['error in updateMany', error])
          throw new APIError('BAD_REQUEST', {
            message: error.message
          })
        }
      },

      async delete({ model, where }: { model: string; where: Where[] }): Promise<void> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['delete', { collection, model }])
        try {
          const findResponse = await payload.find({
            collection,
            where: convertWhereClause(where, model, schema),
            limit: 1,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'deleteFind' })
          })

          if (!findResponse.docs?.length) return

          const docToDelete = findResponse.docs[0]

          await payload.delete({
            collection,
            id: docToDelete.id,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'delete' })
          })
        } catch (error: any) {
          debugLog(['error in delete', error])
          throw new APIError('BAD_REQUEST', {
            message: error.message
          })
        }
      },

      async deleteMany({ model, where }: { model: string; where: Where[] }): Promise<number> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['deleteMany', { collection, model }])
        try {
          const findResponse = await payload.find({
            collection,
            where: convertWhereClause(where, model, schema),
            limit: 1000,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'deleteManyFind' })
          })

          if (!findResponse.docs?.length) return 0

          const deletePromises = findResponse.docs.map((doc) =>
            payload.delete({
              collection,
              id: doc.id,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'deleteMany' })
            })
          )

          await Promise.all(deletePromises)

          return findResponse.docs.length
        } catch (error: any) {
          debugLog(['error in deleteMany', error])
          throw new APIError('BAD_REQUEST', {
            message: error.message
          })
        }
      },

      async count({ model, where }: { model: string; where?: Where[] }): Promise<number> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['count', { collection, model }])
        const query = where ? convertWhereClause(where, model, schema) : { id: { exists: true } }

        const response = await payload.count({
          collection,
          where: query,
          depth: PAYLOAD_QUERY_DEPTH,
          context: createAdapterContext({ model, operation: 'count' })
        })

        return response.totalDocs
      },

      createSchema: async (options, file) => {
        const schemaCode = await generateSchema(options)
        return {
          code: schemaCode,
          path: file || 'schema.ts',
          append: false,
          overwrite: true
        }
      },

      options: {
        enableDebugLogs: config.enableDebugLogs,
        idType: config.idType
      }
    }
  }
}

export { generateSchema, payloadAdapter }
