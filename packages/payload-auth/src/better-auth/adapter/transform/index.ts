import { BetterAuthError } from 'better-auth'
import { FieldAttribute, FieldType, getAuthTables } from 'better-auth/db'
import type { BetterAuthOptions, Where } from 'better-auth'
import type { CollectionSlug, Where as PayloadWhere } from 'payload'

export const createTransform = (options: BetterAuthOptions, enableDebugLogs: boolean) => {
  const schema = getAuthTables(options)

  function debugLog(message: any[]) {
    if (enableDebugLogs) {
      console.log(`[payload-db-adapter]`, ...message)
    }
  }

  function getModelName(model: string): CollectionSlug {
    const collection = (schema as Record<string, any>)[model]?.modelName || model
    if (!collection) {
      throw new BetterAuthError(`Model ${model} does not exist in the database.`)
    }
    return collection as CollectionSlug
  }

  function getFieldName(model: string, field: string) {
    if (field === 'id') {
      return field
    }
    const f = schema[model]?.fields[field]
    const fieldName = f?.fieldName || field
    debugLog(['getField: ', { model, originalField: field, fieldName }])
    return fieldName
  }

  function isRelationshipField(fieldKey: string) {
    return fieldKey.endsWith('Id') || fieldKey.endsWith('By')
  }

  function isDateField({ key, value }: { key?: string; value: any }) {
    if (key) {
      return (key.endsWith('At') || key.endsWith('Date') || key === 'date') && typeof value === 'string' && !isNaN(Date.parse(value))
    } else {
      return typeof value === 'string' && !isNaN(Date.parse(value))
    }
  }

  function singleIdQuery(where: PayloadWhere) {
    if (!where || 'and' in where || 'or' in where) return null

    // For a single id query like { id: { equals: 15 } }
    // First, check if there's an id field in the where clause
    if ('id' in where || '_id' in where) {
      const idField = 'id' in where ? 'id' : '_id'
      const condition = where[idField]

      // Check if condition is an object with equals operator
      if (condition && typeof condition === 'object' && !Array.isArray(condition) && 'equals' in condition) {
        const value = condition.equals
        if (typeof value === 'string' || typeof value === 'number') {
          return value
        }
      }

      // Check for contains operator with single value
      if (
        condition &&
        typeof condition === 'object' &&
        !Array.isArray(condition) &&
        'contains' in condition &&
        Array.isArray(condition.contains) &&
        condition.contains.length === 1
      ) {
        const value = condition.contains[0]
        if (typeof value === 'string' || typeof value === 'number') {
          return value
        }
      }
    }

    return null
  }

  function multipleIdsQuery(where: PayloadWhere) {
    if (!where || 'and' in where || 'or' in where) return null
    if ('id' in where || '_id' in where) {
      const idField = 'id' in where ? 'id' : '_id'
      const condition = where[idField]

      // Check if this is an 'in' operator with id field and array of values
      if (
        condition &&
        typeof condition === 'object' &&
        !Array.isArray(condition) &&
        'in' in condition &&
        Array.isArray(condition.in) &&
        condition.in.length > 1 &&
        condition.in.every((id: unknown) => typeof id === 'string' || typeof id === 'number')
      ) {
        return condition.in as (number | string)[]
      }

      // Also check for contains operator with array of IDs
      if (
        condition &&
        typeof condition === 'object' &&
        !Array.isArray(condition) &&
        'contains' in condition &&
        Array.isArray(condition.contains) &&
        condition.contains.length > 1 &&
        condition.contains.every((id: unknown) => typeof id === 'string' || typeof id === 'number')
      ) {
        return condition.contains as (number | string)[]
      }
    }
    return null
  }

  function normalizeData({
    fieldKey,
    incomingValue,
    schemaFields,
    relationshipField,
    idType
  }: {
    fieldKey: string
    incomingValue: any
    schemaFields: Record<string, FieldAttribute<FieldType>>
    relationshipField: boolean
    idType: 'number' | 'text'
  }) {
    // Early return for null/undefined values
    if (incomingValue === null || incomingValue === undefined) {
      return incomingValue
    }

    //special case for accountId field in accounts collection
    if (fieldKey === 'accountId') {
      return String(incomingValue)
    }

    // Handle relationship fields (IDs) based on idType
    if (relationshipField) {
      if (idType === 'number' && typeof incomingValue === 'string') {
        const parsed = parseInt(incomingValue, 10)
        if (!isNaN(parsed)) {
          debugLog([`ID conversion: ${fieldKey} converting string ID to number`, { original: incomingValue, converted: parsed }])
          return parsed
        }
      } else if (idType === 'text' && typeof incomingValue === 'number') {
        const stringId = String(incomingValue)
        debugLog([`ID conversion: ${fieldKey} converting number ID to string`, { original: incomingValue, converted: stringId }])
        return stringId
      }

      // Handle array of IDs
      if (Array.isArray(incomingValue)) {
        return incomingValue.map((id) => {
          if (idType === 'number' && typeof id === 'string') {
            const parsed = parseInt(id, 10)
            return !isNaN(parsed) ? parsed : id
          } else if (idType === 'text' && typeof id === 'number') {
            return String(id)
          }
          return id
        })
      }

      return incomingValue
    }

    const schemaField = schemaFields[fieldKey]

    // If no schema field exists, return as is
    if (!schemaField) {
      return incomingValue
    }

    const fieldType = schemaField.type

    // Handle string type
    if (fieldType === 'string') {
      if (typeof incomingValue !== 'string') {
        if (incomingValue instanceof Date) {
          const converted = incomingValue.toISOString()
          debugLog([`Type conversion: ${fieldKey} expected string but got Date`, { original: incomingValue, converted }])
          return converted
        }

        const converted = String(incomingValue)
        debugLog([`Type conversion: ${fieldKey} expected string but got ${typeof incomingValue}`, { original: incomingValue, converted }])
        return converted
      }
      return incomingValue
    }

    // Handle number type
    if (fieldType === 'number') {
      if (typeof incomingValue !== 'number') {
        if (incomingValue instanceof Date) {
          const converted = incomingValue.getTime()
          debugLog([`Type conversion: ${fieldKey} expected number but got Date`, { original: incomingValue, converted }])
          return converted
        }

        if (typeof incomingValue === 'boolean') {
          const converted = incomingValue ? 1 : 0
          debugLog([`Type conversion: ${fieldKey} expected number but got boolean`, { original: incomingValue, converted }])
          return converted
        }

        if (typeof incomingValue === 'string') {
          const parsed = parseFloat(incomingValue)
          if (!isNaN(parsed)) {
            debugLog([`Type conversion: ${fieldKey} expected number but got string`, { original: incomingValue, converted: parsed }])
            return parsed
          }
        }
      }
      return incomingValue
    }

    // Handle boolean type
    if (fieldType === 'boolean') {
      if (typeof incomingValue !== 'boolean') {
        let converted

        if (typeof incomingValue === 'string') {
          converted = incomingValue.toLowerCase() === 'true' || incomingValue === '1'
        } else if (typeof incomingValue === 'number') {
          converted = incomingValue !== 0
        } else {
          converted = !!incomingValue
        }

        debugLog([`Type conversion: ${fieldKey} expected boolean but got ${typeof incomingValue}`, { original: incomingValue, converted }])
        return converted
      }
      return incomingValue
    }

    // Handle date type
    if (fieldType === 'date') {
      if (!(incomingValue instanceof Date)) {
        let converted

        if (typeof incomingValue === 'string' || typeof incomingValue === 'number') {
          converted = new Date(incomingValue)
          if (!isNaN(converted.getTime())) {
            debugLog([`Type conversion: ${fieldKey} expected Date but got ${typeof incomingValue}`, { original: incomingValue, converted }])
            return converted
          }
        }
      }
      return incomingValue
    }

    // Handle array types (string[] or number[] or LiteralString[])
    if (typeof fieldType === 'string' && fieldType.endsWith('[]')) {
      const baseType = fieldType.slice(0, -2)

      // Convert to array if not already
      let arrayValue = incomingValue
      if (!Array.isArray(incomingValue)) {
        if (typeof incomingValue === 'string') {
          try {
            // Try to parse as JSON array
            const parsed = JSON.parse(incomingValue)
            if (Array.isArray(parsed)) {
              debugLog([`Type conversion: ${fieldKey} parsed JSON string to array`, { original: incomingValue, converted: parsed }])
              arrayValue = parsed
            } else {
              arrayValue = [incomingValue]
            }
          } catch (e) {
            // If parsing fails, wrap in array
            arrayValue = [incomingValue]
          }
        } else {
          // Wrap non-array values in array
          arrayValue = [incomingValue]
        }

        debugLog([`Type conversion: ${fieldKey} converted to array`, { original: incomingValue, converted: arrayValue }])
      }

      // Normalize each array element based on the base type
      return arrayValue.map((item: any, index: number) => {
        if (baseType === 'string' && typeof item !== 'string') {
          const converted = String(item)
          debugLog([`Type conversion: ${fieldKey}[${index}] expected string but got ${typeof item}`, { original: item, converted }])
          return converted
        }

        if (baseType === 'number' && typeof item !== 'number') {
          if (typeof item === 'string') {
            const parsed = parseFloat(item)
            if (!isNaN(parsed)) {
              debugLog([`Type conversion: ${fieldKey}[${index}] expected number but got string`, { original: item, converted: parsed }])
              return parsed
            }
          } else if (typeof item === 'boolean') {
            return item ? 1 : 0
          }
        }
        return item
      })
    }

    // For any other types or if no conversion needed, return as is
    return incomingValue
  }

  function transformInput({
    data,
    model,
    idType,
    action
  }: {
    data: Record<string, any>
    model: string
    idType: 'number' | 'text'
    action: 'create' | 'update'
  }) {
    const transformedData: Record<string, any> = {}
    const schemaFields = schema[model].fields
    for (const fieldKey in data) {
      if (data[fieldKey] === undefined && action === 'update') {
        continue
      }
      const relationshipField = isRelationshipField(fieldKey)
      const schemaFieldName = schemaFields[fieldKey]?.fieldName
      const normalizedData = normalizeData({
        idType,
        fieldKey,
        incomingValue: data[fieldKey],
        schemaFields,
        relationshipField
      })
      if (schemaFieldName) {
        transformedData[schemaFieldName] = normalizedData
      } else {
        transformedData[fieldKey] = normalizedData
      }
    }

    return transformedData
  }

  function transformOutput<T extends Record<string, any> | null>({ doc, model }: { doc: T; model: string }): T {
    if (doc === null || doc === undefined || typeof doc !== 'object') return doc

    const result = { ...doc } as any
    const schemaFields = schema[model].fields
    const relationshipFields = Object.entries(schemaFields)
      .filter(([key]) => isRelationshipField(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, FieldAttribute<FieldType>>)

    Object.entries(doc).forEach(([key, value]) => {
      if (value === null || value === undefined) return

      const originalKey = findRelationshipOriginalKey(key, relationshipFields)
      if (originalKey) {
        processRelationshipField(result, originalKey, key, value)
      }

      if (isDateField({ key, value })) {
        result[key] = new Date(value)
      }
    })

    return result as T
  }

  function findRelationshipOriginalKey(
    fieldName: string,
    relationshipFields: Record<string, FieldAttribute<FieldType>>
  ): string | undefined {
    return Object.keys(relationshipFields).find((key) => relationshipFields[key].fieldName === fieldName)
  }

  function processRelationshipField(result: Record<string, any>, originalKey: string, fieldName: string, value: any): void {
    // Simple ID value (string or number)
    if (typeof value === 'string' || typeof value === 'number') {
      result[originalKey] = value
      return
    }

    // Array of relationships
    if (Array.isArray(value) && value.length > 0) {
      if (value.every((item) => typeof item === 'object' && 'id' in item)) {
        result[originalKey] = value.map((item) => item.id)
        result[fieldName] = value.map((item) => item.id)
      }
      return
    }

    // Single relationship object with ID
    if (typeof value === 'object' && 'id' in value) {
      result[originalKey] = value.id
      result[fieldName] = value.id
    }
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

  function convertWhereValue({ value, fieldName, idType }: { value: any; fieldName: string; idType: 'number' | 'text' }) {
    if (fieldName === 'id' || fieldName === '_id') {
      if (typeof value === 'object' && value !== null && 'id' in value) {
        // Extract ID from object and ensure it matches the expected type
        const id = value.id
        if (idType === 'number' && typeof id === 'string' && !isNaN(Number(id))) {
          return Number(id)
        } else if (idType === 'text' && typeof id === 'number') {
          return String(id)
        }
        return id
      }
      // Convert standalone ID value to match expected type
      if (idType === 'number' && typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value)
      } else if (idType === 'text' && typeof value === 'number') {
        return String(value)
      }
      return value
    }
    return value
  }

  function convertWhereClause({ idType, model, where }: { idType: 'number' | 'text'; model: string; where?: Where[] }): PayloadWhere {
    if (!where) return {}
    if (where.length === 1) {
      const w = where[0]
      if (!w) {
        return {}
      }

      const fieldName = getFieldName(model, w.field)
      const value = convertWhereValue({
        value: w.value,
        fieldName,
        idType
      })

      const res = {
        [fieldName]: operatorToPayload(w.operator ?? '', value)
      }

      return res
    }
    const and = where.filter((w) => w.connector === 'AND' || !w.connector)
    const or = where.filter((w) => w.connector === 'OR')
    const andClause = and.map((w) => {
      const fieldName = getFieldName(model, w.field)
      const value = convertWhereValue({
        value: w.value,
        fieldName,
        idType
      })
      return {
        [fieldName]: operatorToPayload(w.operator ?? '', value)
      }
    })
    const orClause = or.map((w) => {
      const fieldName = getFieldName(model, w.field)
      const value = convertWhereValue({
        value: w.value,
        fieldName,
        idType
      })
      return {
        [fieldName]: operatorToPayload(w.operator ?? '', value)
      }
    })

    return {
      ...(andClause.length ? { AND: andClause } : {}),
      ...(orClause.length ? { OR: orClause } : {})
    }
  }

  function convertSelect(model: string, select?: string[]) {
    if (!select || select.length === 0) return undefined
    return select.reduce((acc, field) => ({ ...acc, [getFieldName(model, field)]: true }), {})
  }

  function convertSort(model: string, sortBy?: { field: string; direction: 'asc' | 'desc' }) {
    if (!sortBy) return undefined
    return `${sortBy.direction === 'desc' ? '-' : ''}${getFieldName(model, sortBy.field)}`
  }

  return {
    getFieldName,
    getModelName,
    singleIdQuery,
    multipleIdsQuery,
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort
  }
}
