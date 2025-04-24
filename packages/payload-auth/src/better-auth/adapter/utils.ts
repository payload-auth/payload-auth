import { BetterAuthError, type BetterAuthOptions, type Where } from 'better-auth'
import type { CollectionSlug, Payload } from 'payload'
import { getAuthTables } from 'better-auth/db'
import { generateSchemaBuilderStage } from './generate-schema/generate-schema-builder'
import { getPayloadSchema } from './generate-schema/get-payload-schema'

export const BETTER_AUTH_CONTEXT_KEY = 'payload-db-adapter'

export const createAdapterContext = (data: Record<string, any>) => ({
  [BETTER_AUTH_CONTEXT_KEY]: { ...data }
})

export const resolvePayloadClient = async (payloadClient: Payload | (() => Promise<Payload>) | Promise<Payload>) => {
  const payload = typeof payloadClient === 'function' ? await payloadClient() : await payloadClient
  if (!payload.config?.custom?.hasBetterAuthPlugin) {
    throw new BetterAuthError(`Payload is not configured with the better-auth plugin. Please add the plugin to your payload config.`)
  }
  return payload
}

export const getAdapterHelpers = (
  betterAuthOptions: BetterAuthOptions,
  { enableDebugLogs = false }: { enableDebugLogs?: boolean } = {}
) => {
  const schema = getAuthTables(betterAuthOptions)

  function debugLog(message: any[]) {
    if (enableDebugLogs) {
      console.log('[payload-db-adapter]', ...message)
    }
  }

  const getFieldName = (model: string, field: string) => {
    if (['id', '_id'].includes(field)) return field
    return schema?.[model]?.fields?.[field]?.fieldName || field
  }

  const isPlainObject = (val: unknown): val is Record<string, any> =>
    typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)

  const convertWhereClause = (where: Where[] = [], model: string) => {
    if (!where.length) return {}

    const conditions = where.map(({ field, value: rawValue, operator = 'eq', connector = 'AND' }) => {
      const mappedField = getFieldName(model, field)

      let value: any = rawValue
      if (isPlainObject(rawValue)) {
        if ('id' in rawValue) value = rawValue.id
        else if (field in rawValue) value = (rawValue as any)[field]
        else
          throw new Error(
            `convertWhereClause: Expected primitive, array, or object containing 'id' or '${field}' for field '${field}', got ${JSON.stringify(
              rawValue
            )}`
          )
      }

      const condition =
        {
          eq: { [mappedField]: { equals: value } },
          in: { [mappedField]: { in: Array.isArray(value) ? value : [value] } },
          gt: { [mappedField]: { greater_than: value } },
          gte: { [mappedField]: { greater_than_equal: value } },
          lt: { [mappedField]: { less_than: value } },
          lte: { [mappedField]: { less_than_equal: value } },
          ne: { [mappedField]: { not_equals: value } },
          contains: { [mappedField]: { contains: value } },
          starts_with: { [mappedField]: { like: `${value}%` } },
          ends_with: { [mappedField]: { like: `%${value}` } }
        }[operator.toLowerCase()] ?? { [mappedField]: { equals: value } }

      return { condition, connector: connector as 'AND' | 'OR' }
    })

    if (conditions.length === 1) return conditions[0].condition

    const andConditions = conditions.filter((c) => c.connector === 'AND').map((c) => c.condition)
    const orConditions = conditions.filter((c) => c.connector === 'OR').map((c) => c.condition)

    const query: any = {}
    if (andConditions.length) query.and = andConditions
    if (orConditions.length) query.or = orConditions
    return query
  }

  const getCollectionSlug = (model: string): CollectionSlug => (schema?.[model]?.modelName || model) as CollectionSlug

  const transformInput = (model: string, data: Record<string, any>) =>
    Object.entries(data).reduce<Record<string, any>>((acc, [key, value]) => {
      acc[getFieldName(model, key)] = value
      return acc
    }, {})

  const convertSelect = (model: string, select: string[] | undefined) => {
    if (!select || select.length === 0) return undefined
    return select.reduce<Record<string, true>>((acc, field) => {
      acc[getFieldName(model, field)] = true
      return acc
    }, {})
  }

  const convertSort = (model: string, sortBy?: { field: string; direction: 'asc' | 'desc' }): string | undefined => {
    if (!sortBy) return undefined
    const fieldName = getFieldName(model, sortBy.field)
    const prefix = sortBy.direction === 'desc' ? '-' : ''
    return `${prefix}${fieldName}`
  }

  const transformOutput = <T extends Record<string, any> | null>(model: string, doc: T): T => {
    if (!doc || typeof doc !== 'object') return doc

    const result: Record<string, any> = { ...(doc as Record<string, any>) }
    const schemaFields = schema?.[model]?.fields || {}

    Object.entries(schemaFields).forEach(([originalKey, attr]: [string, any]) => {
      const mappedKey = getFieldName(model, originalKey)
      if (!(originalKey in result) && mappedKey in result) {
        let value = result[mappedKey]
        if (attr?.references && value && typeof value === 'object' && 'id' in value) value = value.id
        result[originalKey] = value
      }
    })

    return result as T
  }

  const getSingleId = (where: Where[] | undefined): string | number | null => {
    if (!where || where.length !== 1) return null
    const [cond] = where
    const operator = (cond.operator ?? 'eq').toLowerCase()
    return cond.field === 'id' && operator === 'eq' && (typeof cond.value === 'string' || typeof cond.value === 'number')
      ? cond.value
      : null
  }

  /**
   * Validates that a collection exists in Payload
   * @param payload - The Payload client instance
   * @param collectionSlug - The collection slug to validate
   * @param model - The model name for error messages
   * @throws {BetterAuthError} When the collection doesn't exist
   */
  async function validateCollection(payload: any, collectionSlug: string, model: string): Promise<void> {
    if (!collectionSlug || !(collectionSlug in payload.collections)) {
      throw new BetterAuthError(`Collection ${model} does not exist. Please check your payload collection slugs match the better auth schema`)
    }
  }

  const generateSchema = async (BAoptions: any, options: { outputDir: string } = { outputDir: './generated' }): Promise<string> => {
    const { outputDir } = options
    const existing_schema_code: string = await getPayloadSchema(outputDir)
    const new_schema_code = await generateSchemaBuilderStage({
      code: existing_schema_code,
      BAOptions: BAoptions
    })
    return new_schema_code
  }

  return {
    getFieldName,
    getCollectionSlug,
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort,
    getSingleId,
    generateSchema,
    debugLog,
    validateCollection
  }
}
