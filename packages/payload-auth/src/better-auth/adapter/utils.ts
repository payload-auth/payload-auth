import type { Where } from 'better-auth'
import type { CollectionSlug } from 'payload'

export const BETTER_AUTH_CONTEXT_KEY = 'payload-db-adapter'

export const createAdapterContext = (data: Record<string, any>) => ({
  [BETTER_AUTH_CONTEXT_KEY]: { ...data }
})

const getFieldName = (model: string, field: string, schema: any) => {
  if (field === 'id') return field
  return schema?.[model]?.fields?.[field]?.fieldName || field
}

const isPlainObject = (val: unknown): val is Record<string, any> =>
  typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)

export const convertWhereClause = (where: Where[] = [], model: string, schema: any) => {
  if (!where.length) return {}

  const conditions = where.map(({ field, value: rawValue, operator = 'eq', connector = 'AND' }) => {
    const mappedField = getFieldName(model, field, schema)

    let value: any = rawValue
    if (isPlainObject(rawValue)) {
      if ('id' in rawValue) value = rawValue.id
      else if (field in rawValue) value = (rawValue as any)[field]
      else
        throw new Error(
          `convertWhereClause: Expected primitive, array, or object containing 'id' or '${field}' for field '${field}', got ${JSON.stringify(
            rawValue,
          )}`,
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
        ends_with: { [mappedField]: { like: `%${value}` } },
      }[operator.toLowerCase()] ?? (() => { throw new Error(`Unsupported operator: ${operator}`) })()

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

export const getCollectionName = (model: string, schema: any): CollectionSlug =>
  (schema?.[model]?.modelName || model) as CollectionSlug

export const mapInputData = (model: string, data: Record<string, any>, schema: any) =>
  Object.entries(data).reduce<Record<string, any>>((acc, [key, value]) => {
    acc[getFieldName(model, key, schema)] = value
    return acc
  }, {})

export const mapSelectFields = (model: string, select: string[] | undefined, schema: any) => {
  if (!select || select.length === 0) return undefined
  return select.reduce<Record<string, true>>((acc, field) => {
    acc[getFieldName(model, field, schema)] = true
    return acc
  }, {})
}

/**
 * Maps documents returned from Payload back to BetterAuth's static field names while
 * preserving the database field names.
 *
 * BetterAuth core expects certain canonical keys like `userId`, `organizationId`, etc.,
 * even when collections are configured with custom field names via the BetterAuth schema
 * (see `fieldName` on each field). For instance, the internal adapter queries look up
 * `session.userId` directly: https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/db/internal-adapter.ts#L311-L333
 * If the underlying Payload field was renamed to `user`, we need to re‑introduce `userId`
 * in the object so that downstream BetterAuth logic continues to work. This helper merges
 * those original keys (and flattens relationship objects to their ids) alongside the
 * mapped keys returned by Payload.
 *
 * @param model   The BetterAuth model name (user, session, etc.)
 * @param doc     The document returned from Payload (or null)
 * @param schema  The BetterAuth schema used for field mapping
 * @returns       The document with both mapped keys and original BetterAuth keys
 */

export const mapOutputData = <T extends Record<string, any> | null>(
  model: string,
  doc: T,
  schema: any,
): T => {
  if (!doc || typeof doc !== 'object') return doc

  const result: Record<string, any> = { ...(doc as Record<string, any>) }
  const schemaFields = schema?.[model]?.fields || {}

  Object.entries(schemaFields).forEach(([originalKey, attr]: [string, any]) => {
    const mappedKey = getFieldName(model, originalKey, schema)
    if (!(originalKey in result) && mappedKey in result) {
      let value = result[mappedKey]
      if (attr?.references && value && typeof value === 'object' && 'id' in value) value = value.id
      result[originalKey] = value
    }
  })

  return result as T
}