import type { Adapter, BetterAuthOptions, Where } from 'better-auth'
import type { PayloadAdapter } from './types'
import { createAdapterContext, getAdapterHelpers, resolvePayloadClient } from './utils'

export const PAYLOAD_QUERY_DEPTH = 0

const payloadAdapter: PayloadAdapter = (payloadClient, config) => {
  function errorLog(message: any) {
    console.error('[payload-db-adapter]', ...message)
  }

  return (authOptions: BetterAuthOptions): Adapter => {
    const getPayload = async () => resolvePayloadClient(payloadClient)
    const { transformInput, transformOutput, convertWhereClause, convertSelect, convertSort, getCollectionSlug, getSingleId, debugLog } =
      getAdapterHelpers(authOptions, { enableDebugLogs: !!config?.enableDebugLogs })

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
        const payload = await getPayload()
        const collection = getCollectionSlug(model)
        const mappedData = transformInput(model, values)
        debugLog(['create', { collection, model, data: mappedData }])
        try {
          const response = await payload.create({
            collection,
            data: mappedData,
            select: convertSelect(model, select),
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'create' })
          })

          return transformOutput(model, response) as R
        } catch (error) {
          errorLog(['error in create', error])
          return null as R
        }
      },

      async findOne<T>({ model, where, select }: { model: string; where: Where[]; select?: string[] }): Promise<T | null> {
        const payload = await getPayload()
        const collection = getCollectionSlug(model)

        const singleId = getSingleId(where)
        debugLog(['findOne', { collection, model, singleId, rawWhere: where, where: convertWhereClause(where, model) }])
        try {
          let result: Record<string, any> | null = null

          if (singleId) {
            result = await payload.findByID({
              collection,
              id: singleId,
              select: convertSelect(model, select),
              showHiddenFields: true,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findOneByID' })
            })
          } else {
            const response = await payload.find({
              collection,
              where: convertWhereClause(where, model),
              select: convertSelect(model, select),
              limit: 1,
              showHiddenFields: true,
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findOneByWhere' })
            })
            result = response.docs?.at(0) || null
          }

          if (!result) return null

          debugLog(['findOne result', { ...transformOutput(model, result) }])
          return transformOutput(model, result) as T
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
        const payload = await getPayload()
        const collection = getCollectionSlug(model)

        const singleId = getSingleId(where)
        debugLog(['findMany', { collection, model, singleId, rawWhere: where, where: convertWhereClause(where, model) }])
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
              where: where ? convertWhereClause(where, model) : {},
              select: convertSelect(model, undefined),
              showHiddenFields: true,
              limit: fetchLimit,
              page,
              sort: convertSort(model, sortBy),
              depth: PAYLOAD_QUERY_DEPTH,
              context: createAdapterContext({ model, operation: 'findManyByWhere' })
            })
            docs = response.docs.slice(spill, spill + limit)
          }

          const mappedDocs = docs.map((d) => transformOutput(model, d)) as T[]
          return mappedDocs || []
        } catch (error) {
          errorLog(['error in findMany', error])
          return []
        }
      },

      async update<T>({ model, where, update: values }: { model: string; where: Where[]; update: Record<string, any> }): Promise<T | null> {
        const payload = await getPayload()
        const collection = getCollectionSlug(model)
        debugLog(['update', { collection, model, rawWhere: where, where: convertWhereClause(where, model) }])
        try {
          const res = await payload.update({
            collection,
            where: convertWhereClause(where, model),
            data: transformInput(model, values),
            depth: PAYLOAD_QUERY_DEPTH,
            context: createAdapterContext({ model, operation: 'update' })
          })

          const response = res?.docs?.at(0)
          return response ? (transformOutput(model, response as any) as T) : null
        } catch (error: any) {
          errorLog(['error in update', error])
          return null
        }
      },

      async updateMany({ model, where, update: values }) {
        const payload = await getPayload()
        const collection = getCollectionSlug(model)
        debugLog(['updateMany', { collection, model, rawWhere: where, where: convertWhereClause(where, model) }])
        try {
          const res = await payload.update({
            collection,
            where: convertWhereClause(where, model),
            data: transformInput(model, values),
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
        const payload = await getPayload()
        const collection = getCollectionSlug(model)
        debugLog(['delete', { collection, model }])
        try {
          const res = await payload.delete({
            collection,
            where: convertWhereClause(where, model),
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
        const payload = await getPayload()
        const collection = getCollectionSlug(model)
        debugLog(['deleteMany', { collection, model, rawWhere: where, where: convertWhereClause(where, model) }])
        try {
          const res = await payload.delete({
            collection,
            where: convertWhereClause(where, model),
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
        const payload = await getPayload()
        const collection = getCollectionSlug(model)
        debugLog(['count', { collection, model }])
        const query = where ? convertWhereClause(where, model) : { id: { exists: true } }

        const response = await payload.count({
          collection,
          where: query,
          depth: PAYLOAD_QUERY_DEPTH,
          context: createAdapterContext({ model, operation: 'count' })
        })

        return response.totalDocs
      },

      createSchema: async (options, file) => {
        // TODO: Replace with correct schema generation logic
        const schemaCode = ''
        return {
          code: schemaCode,
          path: file || 'schema.ts',
          append: false,
          overwrite: true
        }
      },

      options: {
        enableDebugLogs: config.enableDebugLogs
      }
    }
  }
}

export { payloadAdapter }
