import type { Where } from 'better-auth'
import type { CollectionSlug } from 'payload'

export const BETTER_AUTH_CONTEXT_KEY = 'payload-db-adapter'

export const createAdapterContext = (data: Record<string, any>) => ({
  [BETTER_AUTH_CONTEXT_KEY]: { ...data }
})

export const convertWhereClause = (where: Where[] = [], model: string, schema: any) => {
  if (!where.length) return {}

  const conditions = where.map((w) => {
    const { field, value: rawValue, operator = 'eq', connector = 'AND' } = w

    const mappedField = schema?.[model]?.fields?.[field]?.fieldName || field
    let value: any = rawValue

    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      if ('id' in rawValue) {
        // Relationship object `{ id: ... }`
        value = (rawValue as any).id
      } else if (field in rawValue) {
        // Object contains the same key we're querying
        value = (rawValue as any)[field]
      } else {
        // Object does not include expected identifier – this is likely a mistake
        throw new Error(
          `convertWhereClause: Expected primitive, array, or object containing 'id' or '${field}' for field '${field}', got ${JSON.stringify(
            rawValue
          )}`
        )
      }
    }

    let condition: any
    switch (operator.toLowerCase()) {
      case 'eq':
        condition = { [mappedField]: { equals: value } }
        break
      case 'in':
        condition = { [mappedField]: { in: Array.isArray(value) ? value : [value] } }
        break
      case 'gt':
        condition = { [mappedField]: { greater_than: value } }
        break
      case 'gte':
        condition = { [mappedField]: { greater_than_equal: value } }
        break
      case 'lt':
        condition = { [mappedField]: { less_than: value } }
        break
      case 'lte':
        condition = { [mappedField]: { less_than_equal: value } }
        break
      case 'ne':
        condition = { [mappedField]: { not_equals: value } }
        break
      case 'contains':
        condition = { [mappedField]: { contains: value } }
        break
      case 'starts_with':
        condition = { [mappedField]: { like: `${value}%` } }
        break
      case 'ends_with':
        condition = { [mappedField]: { like: `%${value}` } }
        break
      default:
        throw new Error(`Unsupported operator: ${operator}`)
    }

    return { condition, connector: connector as 'AND' | 'OR' }
  })

  if (conditions.length === 1) {
    return conditions[0].condition
  }

  const andConditions = conditions.filter((c) => c.connector === 'AND').map((c) => c.condition)
  const orConditions = conditions.filter((c) => c.connector === 'OR').map((c) => c.condition)

  const query: any = {}
  if (andConditions.length) query.and = andConditions
  if (orConditions.length) query.or = orConditions
  return query
}

export const getCollectionName = (model: string, schema: any): CollectionSlug => {
  return (schema?.[model]?.modelName || model) as CollectionSlug
}

export const mapInputData = (model: string, data: Record<string, any>, schema: any) => {
  const mapped: Record<string, any> = {}
  const schemaFields = schema?.[model]?.fields || {}
  Object.entries(data).forEach(([key, value]) => {
    const mappedKey = schemaFields[key]?.fieldName || key
    mapped[mappedKey] = value
  })
  return mapped
}

export const mapSelectFields = (model: string, select: string[] | undefined, schema: any) => {
  if (!select || select.length === 0) return undefined
  const schemaFields = schema?.[model]?.fields || {}
  return select.reduce<Record<string, true>>((acc, field) => {
    const mappedKey = schemaFields[field]?.fieldName || field
    acc[mappedKey] = true
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
export const mapOutputData = <T extends Record<string, any> | null>(model: string, doc: T, schema: any): T => {
  if (!doc || typeof doc !== 'object') return doc

  const result: Record<string, any> = { ...(doc as Record<string, any>) }
  const schemaFields = schema?.[model]?.fields || {}

  Object.entries(schemaFields).forEach(([originalKey, attr]: [string, any]) => {
    const mappedKey = attr?.fieldName || originalKey
    if (mappedKey in result) {
      // Only add if originalKey not present
      if (!(originalKey in result)) {
        let value = result[mappedKey]
        // If reference field and value is object with id, extract
        if (attr?.references && value && typeof value === 'object') {
          if ('id' in value) {
            value = value.id
          }
        }
        result[originalKey] = value
      }
    }
  })

  return result as T
}