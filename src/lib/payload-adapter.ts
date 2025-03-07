import type { BasePayload, CollectionSlug, Where as PayloadWhere } from 'payload'

import { type Adapter, BetterAuthError, type BetterAuthOptions, type Where } from 'better-auth'
import { getAuthTables } from 'better-auth/db'

const createTransform = (options: BetterAuthOptions) => {
  const schema = getAuthTables(options)

  function getField(model: string, field: string) {
    if (field === 'id') {
      return field
    }
    const f = (schema as Record<string, any>)[model]?.fields[field]
    return f?.fieldName || field
  }

  function getModelName(model: string): CollectionSlug {
    const collection = (schema as Record<string, any>)[model]?.modelName || model
    if (!collection) {
      throw new BetterAuthError(`Model ${model} does not exist in the database.`)
    }
    return collection as CollectionSlug
  }

  function singleIdQuery(where: Where[]) {
    if (!where || where.length !== 1) return null

    const [condition] = where

    const isIdField = condition?.field === 'id' || condition?.field === '_id'
    const isEqOperator = condition?.operator === 'eq'
    const isContainsSingleId =
      condition?.operator === 'contains' &&
      Array.isArray(condition?.value) &&
      condition?.value?.length === 1 &&
      (typeof condition?.value[0] === 'string' || typeof condition?.value[0] === 'number')

    if (
      isIdField &&
      isEqOperator &&
      (typeof condition?.value === 'string' || typeof condition?.value === 'number')
    ) {
      return condition?.value
    }

    if (isIdField && isContainsSingleId && Array.isArray(condition?.value)) {
      return condition?.value[0] ?? null
    }

    return null
  }

  function multipleIdsQuery(where: Where[]) {
    if (!where || where.length !== 1) {
      return null
    }
    const condition = where[0]

    // Check if this is an 'in' operator with id field and array of values
    if (
      condition &&
      (condition.field === 'id' || condition.field === '_id') &&
      condition.operator === 'in' &&
      Array.isArray(condition.value) &&
      condition.value.length > 0 &&
      condition.value.every((id) => typeof id === 'string' || typeof id === 'number')
    ) {
      return condition.value as (number | string)[]
    }

    // Also check for contains operator with array of IDs
    if (
      condition &&
      (condition.field === 'id' || condition.field === '_id') &&
      condition.operator === 'contains' &&
      Array.isArray(condition.value) &&
      condition.value.length > 1 &&
      condition.value.every((id) => typeof id === 'string' || typeof id === 'number')
    ) {
      return condition.value as (number | string)[]
    }

    return null
  }

  function transformInput(data: Record<string, any>, model: string, action: 'create' | 'update') {
    const transformedData: Record<string, any> = {}
    const schemaFields = (schema as Record<string, any>)[model].fields
    for (const dataField in data) {
      if (data[dataField] === undefined && action === 'update') {
        continue
      }
      const updatedField = schemaFields[dataField]?.fieldName
      if (updatedField) {
        transformedData[updatedField] = data[dataField]
      } else {
        transformedData[dataField] = data[dataField]
      }
    }
    return transformedData
  }

  function transformOutput<T extends Record<string, any> | undefined>(doc: T): T {
    if (!doc || typeof doc !== 'object') return doc

    const result = { ...doc } as any

    // Scan for relationship fields that contain objects with IDs
    Object.entries(doc).forEach(([key, value]) => {
      // If the value is an object with an id property, it's likely a relationship
      if (value && typeof value === 'object' && 'id' in value) {
        // Create a new field with Id suffix containing just the ID
        const newKey = `${key}Id`
        result[newKey] = value.id

        // Keep the original value as well for backward compatibility
      } else if (Array.isArray(value)) {
        // Handle arrays of relationships
        if (value.length > 0 && typeof value[0] === 'object' && 'id' in value[0]) {
          const newKey = `${key}Ids`
          result[newKey] = value.map((item) => item.id)
        }
      }
    })

    return result as T
  }

  function operatorToPayload(operator: string, value: any) {
    switch (operator) {
      case 'eq':
        return { equals: value }
      case 'ne':
        return { not_equals: value }
      case 'gt':
        return { greater_than: value }
      case 'gte':
        return { greater_than_equal: value }
      case 'lt':
        return { less_than: value }
      case 'lte':
        return { less_than_equal: value }
      case 'contains':
        return { contains: value }
      case 'in':
        return { in: value }
      case 'starts_with':
        return { like: `${value}%` }
      case 'ends_with':
        return { like: `%${value}` }
      default:
        return { equals: value }
    }
  }

  function convertWhereClause(model: string, where?: Where[]): PayloadWhere {
    if (!where) return {}
    if (where.length === 1) {
      const w = where[0]
      if (!w) {
        return {}
      }
      return {
        [getField(model, w.field)]: operatorToPayload(w.operator ?? '', w.value),
      }
    }
    const and = where.filter((w) => w.connector === 'AND' || !w.connector)
    const or = where.filter((w) => w.connector === 'OR')
    const andClause = and.map((w) => {
      return {
        [getField(model, w.field)]: operatorToPayload(w.operator ?? '', w.value),
      }
    })
    const orClause = or.map((w) => {
      return {
        [getField(model, w.field)]: operatorToPayload(w.operator ?? '', w.value),
      }
    })

    return {
      ...(andClause.length ? { AND: andClause } : {}),
      ...(orClause.length ? { OR: orClause } : {}),
    }
  }

  function convertSelect(model: string, select?: string[]) {
    if (!select || select.length === 0) return undefined
    return select.reduce((acc, field) => ({ ...acc, [getField(model, field)]: true }), {})
  }

  function convertSort(model: string, sortBy?: { field: string; direction: 'asc' | 'desc' }) {
    if (!sortBy) return undefined
    return `${sortBy.direction === 'desc' ? '-' : ''}${getField(model, sortBy.field)}`
  }

  return {
    getField,
    getModelName,
    singleIdQuery,
    multipleIdsQuery,
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort,
  }
}

export const payloadAdapter = (payload: BasePayload) => (options: BetterAuthOptions) => {
  const {
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort,
    getModelName,
    singleIdQuery,
    multipleIdsQuery,
  } = createTransform(options)

  return {
    id: 'payload',
    async create<T extends Record<string, any>, R = T>(data: {
      model: string
      data: T
      select?: string[]
    }): Promise<R> {
      const { model, data: values, select } = data
      const collectionSlug = getModelName(model)
      const transformed = transformInput(values, model, 'create')
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        const result = await payload.create({
          collection: collectionSlug,
          data: transformed,
          select: convertSelect(model, select),
        })
        const transformedResult = transformOutput(result)
        console.log('[payload-adapter] create result', {
          id: transformedResult.id,
          collection: collectionSlug,
        })
        return transformedResult as R
      } catch (error) {
        console.error(`[better-auth/payload-adapter] Error in create: ${error}`)
        return null as R
      }
    },
    async findOne<T>(data: {
      model: string
      where: Where[]
      select?: string[]
    }): Promise<T | null> {
      const { model, where, select } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        const id = singleIdQuery(where)
        let result
        if (id) {
          const doc = await payload.findByID({
            collection: collectionSlug,
            id,
            select: convertSelect(model, select),
          })
          result = doc
        } else {
          const docs = await payload.find({
            collection: collectionSlug,
            where: payloadWhere,
            select: convertSelect(model, select),
            limit: 1,
          })
          result = docs.docs[0]
        }
        const transformedResult = transformOutput(result) ?? null
        console.log('[payload-adapter] findOne result', {
          id: transformedResult?.id,
          collection: collectionSlug,
        })
        return transformedResult as T
      } catch (error) {
        console.error(`[payload-adapter] Error in findOne: ${error}`)
        return null
      }
    },
    async findMany<T>(data: {
      model: string
      where?: Where[]
      limit?: number
      sortBy?: {
        field: string
        direction: 'asc' | 'desc'
      }
      offset?: number
    }): Promise<T[]> {
      const { model, where, sortBy, limit, offset } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        let result
        const multipleIds = where && multipleIdsQuery(where)
        const singleId = where && singleIdQuery(where)
        if (multipleIds && multipleIds.length > 0) {
          const docPromises = multipleIds.map((id) =>
            payload.findByID({
              collection: collectionSlug,
              id,
            }),
          )
          const docs = await Promise.all(docPromises)
          const validDocs = docs.filter((doc): doc is NonNullable<typeof doc> => doc !== null)
          result = {
            docs: validDocs,
            totalDocs: validDocs.length,
          }
        } else if (singleId) {
          const doc = await payload.findByID({
            collection: collectionSlug,
            id: singleId,
          })
          result = { docs: doc ? [doc] : [], totalDocs: doc ? 1 : 0 }
        } else {
          result = await payload.find({
            collection: collectionSlug,
            where: payloadWhere,
            limit: limit,
            page: offset ? Math.floor(offset / (limit || 10)) + 1 : 1,
            sort: convertSort(model, sortBy),
          })
        }
        const transformedResult = result.docs.map((doc) => transformOutput(doc)) ?? null
        console.log('[payload-adapter] findMany result', {
          totalDocs: result.totalDocs,
          collection: collectionSlug,
        })
        return transformedResult as T[]
      } catch (error) {
        console.error(`[payload-adapter] Error in findMany: ${error}`)
        return [] as T[]
      }
    },
    async update<T>(data: {
      model: string
      where: Where[]
      update: Record<string, unknown>
    }): Promise<T | null> {
      const { model, where, update } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        let result
        const id = singleIdQuery(where)
        if (id) {
          const doc = await payload.update({
            collection: collectionSlug,
            id,
            data: update,
          })
          result = doc
        } else {
          const doc = await payload.update({
            collection: collectionSlug,
            where: payloadWhere,
            data: update,
          })
          result = doc.docs[0]
        }
        const transformedResult = transformOutput(result) ?? null
        console.log('[payload-adapter] update result', {
          collection: collectionSlug,
          id: transformedResult?.id,
        })
        return transformedResult as T
      } catch (error) {
        console.error(`[payload-adapter] Error in findOne: ${error}`)
        return null
      }
    },
    async updateMany(data: {
      model: string
      where: Where[]
      update: Record<string, unknown>
    }): Promise<number> {
      const { model, where, update } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        // using updateMany is more performant
        const updateResult = await payload.db.updateMany({
          collection: collectionSlug,
          where: payloadWhere,
          data: update,
        })
        console.log('[payload-adapter] update result', {
          collection: collectionSlug,
          totalDocs: updateResult?.length,
        })
        return updateResult?.length || 0
      } catch (error) {
        console.error(`[payload-adapter] Error in findOne: ${error}`)
        return 0
      }
    },
    async delete(data: { model: string; where: Where[] }): Promise<void> {
      const { model, where } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        let deleteResult
        const id = singleIdQuery(where)
        if (id) {
          const doc = await payload.delete({
            collection: collectionSlug,
            id,
          })
          deleteResult = { doc, errors: [] }
        } else {
          const doc = await payload.delete({
            collection: collectionSlug,
            where: payloadWhere,
          })
          deleteResult = { doc: doc.docs[0], errors: [] }
        }
        console.log('[payload-adapter] delete result', {
          collection: collectionSlug,
          deletedDoc: JSON.stringify(deleteResult.doc?.id),
          errors: JSON.stringify(deleteResult.errors),
        })
        return
      } catch (error) {
        console.error(`[payload-adapter] Error in findOne: ${error}`)
        return
      }
    },
    async deleteMany(data: { model: string; where: Where[] }): Promise<number> {
      const { model, where } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        const deleteResult = await payload.delete({
          collection: collectionSlug,
          where: payloadWhere,
        })
        console.log('[payload-adapter] deleteMany result', {
          collection: collectionSlug,
          totalDocs: deleteResult.docs.length,
          errors: JSON.stringify(deleteResult.errors),
        })

        return deleteResult.docs.length
      } catch (error) {
        console.error(`[payload-adapter] Error in findOne: ${error}`)
        return 0
      }
    },
    async count(data: { model: string; where?: Where[] }): Promise<number> {
      const { model, where } = data
      const collectionSlug = getModelName(model)
      const payloadWhere = convertWhereClause(model, where)
      try {
        if (!collectionSlug || !(collectionSlug in payload.collections)) {
          throw new BetterAuthError(
            `Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`,
          )
        }
        const result = await payload.count({
          collection: collectionSlug,
          where: payloadWhere,
        })
        console.log('[payload-adapter] count result', {
          collection: collectionSlug,
          totalDocs: result.totalDocs,
        })
        return result.totalDocs
      } catch (error) {
        console.error(`[payload-adapter] Error in findOne: ${error}`)
        return 0
      }
    },
  } satisfies Adapter
}
