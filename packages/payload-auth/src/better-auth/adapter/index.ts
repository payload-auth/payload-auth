import type { Adapter, BetterAuthOptions, Where } from 'better-auth'
import { BetterAuthError } from 'better-auth'
import { getAuthTables } from 'better-auth/db'
import { generateSchema } from './generate-schema'
import type { PayloadAdapter } from './types'
import { convertWhereClause, createAdapterContext, getCollectionName, mapInputData, mapOutputData, mapSelectFields } from './utils'

export const PAYLOAD_QUERY_DEPTH = 0

const payloadAdapter: PayloadAdapter = (payloadClient, config) => {
  function debugLog(message: any) {
    if (config.enableDebugLogs) {
      console.log('[payload-db-adapter]', ...message)
    }
  }

  function errorLog(message: any) {
    console.error('[payload-db-adapter]', ...message)
  }

  const getSingleId = (where: Where[] | undefined): string | null => {
    if (!where || where.length !== 1) return null
    const [cond] = where
    const operator = (cond.operator ?? 'eq').toLowerCase()
    return cond.field === 'id' && operator === 'eq' && typeof cond.value === 'string' ? cond.value : null
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
            select: mapSelectFields(model, select, schema),
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'create' })
          })

          return mapOutputData(model, response, schema) as R
        } catch (error) {
          errorLog(['error in create', error])
          return null as R
        }
      },

      async findOne<T>({ model, where, select }: { model: string; where: Where[]; select?: string[] }): Promise<T | null> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)

        const singleId = getSingleId(where)
        debugLog(['findOne', { collection, model, singleId, rawWhere: where, where: convertWhereClause(where, model, schema) }])
        try {
          let result: Record<string, any> | null = null

          if (singleId) {
            result = await payload.findByID({
              collection,
              id: singleId,
              select: mapSelectFields(model, select, schema),
              showHiddenFields: true,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findOneByID' })
            })
          } else {
            const response = await payload.find({
              collection,
              where: convertWhereClause(where, model, schema),
              select: mapSelectFields(model, select, schema),
              limit: 1,
              showHiddenFields: true,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findOneByWhere' })
            })
            result = response.docs?.at(0) || null
          }

          if (!result) return null

          debugLog(['findOne result', { ...mapOutputData(model, result, schema) }])
          return mapOutputData(model, result, schema) as T
        } catch (error) {
          errorLog(['error in findOne', error])
          return null
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

        const singleId = getSingleId(where)
        debugLog(['findMany', { collection, model, singleId, rawWhere: where, where: convertWhereClause(where, model, schema) }])
        try {
          let docs: any[] = []

          if (singleId) {
            const doc = await payload.findByID({
              collection,
              id: singleId,
              showHiddenFields: true,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findManyBySingleID' })
            })
            if (doc) docs = [doc]
          } else {
            const spill = offset % limit
            const page = Math.floor(offset / limit) + 1
            const fetchLimit = spill ? limit + spill : limit
            const response = await payload.find({
              collection,
              where: where ? convertWhereClause(where, model, schema) : {},
              select: mapSelectFields(model, undefined, schema),
              showHiddenFields: true,
              limit: fetchLimit,
              page,
              sort: sortBy ? `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}` : undefined,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findManyByWhere' })
            })
            docs = response.docs.slice(spill, spill + limit)
          }

          const mappedDocs = docs.map((d) => mapOutputData(model, d, schema)) as T[]
          return mappedDocs || []
        } catch (error) {
          errorLog(['error in findMany', error])
          return []
        }
      },

      async update<T>({ model, where, update: values }: { model: string; where: Where[]; update: Record<string, any> }): Promise<T | null> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['update', { collection, model, rawWhere: where, where: convertWhereClause(where, model, schema) }])
        try {
          const res = await payload.update({
            collection,
            where: convertWhereClause(where, model, schema),
            data: values,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'update' })
          })

          const response = res?.docs?.at(0)
          return response ? (mapOutputData(model, response as any, schema) as T) : null
        } catch (error: any) {
          errorLog(['error in update', error])
          return null
        }
      },

      async updateMany({ model, where, update: values }) {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['updateMany', { collection, model, rawWhere: where, where: convertWhereClause(where, model, schema) }])
        try {
          const res = await payload.update({
            collection,
            where: convertWhereClause(where, model, schema),
            data: values,
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'updateMany' })
          })

          debugLog(['updateMany result', { count: res?.docs?.length }])
          return res?.docs?.length || 0
        } catch (error: any) {
          errorLog(['error in updateMany', error])
          return 0
        }
      },

      async delete({ model, where }: { model: string; where: Where[] }): Promise<void> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['delete', { collection, model }])
        try {
          const res = await payload.delete({
            collection,
            where: convertWhereClause(where, model, schema),
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'delete' })
          })
          debugLog(['delete result', { count: res?.docs?.length }])
        } catch (error: any) {
          errorLog(['error in delete', error])
          return
        }
      },

      async deleteMany({ model, where }: { model: string; where: Where[] }): Promise<number> {
        const payload = await resolvePayloadClient()
        const collection = getCollectionName(model, schema)
        debugLog(['deleteMany', { collection, model, rawWhere: where, where: convertWhereClause(where, model, schema) }])
        try {
          const res = await payload.delete({
            collection,
            where: convertWhereClause(where, model, schema),
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'deleteMany' })
          })
          debugLog(['deleteMany result', { count: res?.docs?.length }])
          return res?.docs?.length || 0
        } catch (error: any) {
          errorLog(['error in deleteMany', error])
          return 0
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
