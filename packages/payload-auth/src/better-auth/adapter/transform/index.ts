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

  /**
   * This function gets the collection slug for a better-auth schema model.
   *
   * For the base collections - The sanitizeBetterAuthOptions function ensures that whatever collection slug from the plugin options is set as the model name.
   * For plugins - The betterAuthPluginSlugs constant is set as the modelName.
   *
   * NOTE: If someone overides the base collection with the collectionOverride option this will result in errors being thrown.
   *
   * @param model - The model name
   * @returns The collection slug
   */
  function getCollectionSlug(model: string): CollectionSlug {
    const collection = schema[model]?.modelName || model
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

  function isRelationshipField(fieldKey: string, schemaFields: Record<string, FieldAttribute<FieldType>>) {
    return schemaFields[fieldKey].references !== undefined
  }

  function isDateField(value: any) {
    return typeof value === 'string' && !isNaN(Date.parse(value))
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

  function normalizeData({
    key,
    value,
    isRelatedField,
    idType
  }: {
    key: string
    value: any
    isRelatedField: boolean
    idType: 'number' | 'text'
  }) {
    // Handle relationship fields (IDs) based on idType
    if (isRelatedField) {
      if (idType === 'number' && typeof value === 'string') {
        const parsed = parseInt(value, 10)
        if (!isNaN(parsed)) {
          debugLog([`ID conversion: ${key} converting string ID to number`, { original: value, converted: parsed }])
          return parsed
        }
      } else if (idType === 'text' && typeof value === 'number') {
        const stringId = String(value)
        debugLog([`ID conversion: ${key} converting number ID to string`, { original: value, converted: stringId }])
        return stringId
      }

      // Handle array of IDs
      if (Array.isArray(value)) {
        return value.map((id) => {
          if (idType === 'number' && typeof id === 'string') {
            const parsed = parseInt(id, 10)
            return !isNaN(parsed) ? parsed : id
          } else if (idType === 'text' && typeof id === 'number') {
            return String(id)
          }
          return id
        })
      }

      return value
    }

    // For any other types or if no conversion needed, return as is
    return value
  }

  /**
   * This function transforms the input from better-auth to the expected payload format.
   *
   * It handles the conversion of relationship fields to the correct format for better-auth. (String ID)
   * and also maintains the field for how payload would expect it. (Typeof id payload would expect)
   *
   */
  function transformInput({ data, model, idType }: { data: Record<string, any>; model: string; idType: 'number' | 'text' }) {
    const transformedData: Record<string, any> = {}
    const schemaFields = schema[model].fields
    Object.entries(data).forEach(([key, value]) => {
      if (!value) {
        return
      }

      // check if we're dealing with a relationship field
      const isRelatedField = isRelationshipField(key, schemaFields)
      // get the updated fieldName from the better-auth schema
      const schemaFieldName = schemaFields[key]?.fieldName
      const normalizedData = normalizeData({
        idType,
        key,
        value,
        isRelatedField
      })

      // If there is an updated fieldName we use that, otherwise we use the original key
      if (schemaFieldName) {
        transformedData[schemaFieldName] = normalizedData
      } else {
        transformedData[key] = normalizedData
      }
    })

    return transformedData
  }

  /**
   * This function transforms the output of a payload operation to a better-auth schema.
   
   * The main use case for this function is to ensure that relationship fields align with the better-auth schema.
   * Also because better-auth has all id fields typed as a string as seen here: 
   * @see https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/db/schema.ts#L125
   *
   * We want to ensure that the returned typeof data is consistent with what the better-auth schemas expect.  
   * 
   * NOTE: By adding depth: 0 to our operations we remove the need to reduce objects and just have to do a simple type conversion to string,
   * but will keep these checks as a redundancy.
   * 
   * This also means that we need to handle string id type conversion back to the proper type with the payload database.
   * 
   * Also as dates are stored as strings in payload while better auth expects dates to be typeof date we convert those values back.
   *
   * @param doc - The payload document
   * @param model - The model name
   * @returns The transformed document
   */
  function transformOutput<T extends Record<string, any> | null>({ doc, model }: { doc: T; model: string }): T {
    if (!doc || typeof doc !== 'object') return doc

    const result = { ...doc }
    const schemaFields = schema[model].fields

    // We get all the relationship fields from the schema
    const relationshipFields = Object.entries(schemaFields)
      .filter(([key]) => isRelationshipField(key, schemaFields))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, FieldAttribute<FieldType>>)

    Object.entries(doc).forEach(([key, value]) => {
      if (value === null || value === undefined) return
      // this finds the better-auth schema field key for the renamed relationship fieldName
      const originalKey = findRelationshipOriginalKey(key, relationshipFields)
      if (originalKey) {
        // if this value exists then we know that this field is both a related document field and that its fieldName has been renamed
        processRelationshipField(result, originalKey, key, value)
        return
      }
      // Check if the value is a date value and convert to be typeof date
      if (isDateField({ value })) {
        result[key] = new Date(value)
        return
      }

      // Otherwise we do nothing and leave the value as is
    })

    return result as T
  }

  /**
   * This function finds the original better-auth schema key for a relationship field.
   *
   * @param fieldName - The field name
   * @param relationshipFields - The relationship fields
   * @returns The original key
   */
  function findRelationshipOriginalKey(
    fieldName: string,
    relationshipFields: Record<string, FieldAttribute<FieldType>>
  ): string | undefined {
    return Object.keys(relationshipFields).find((key) => relationshipFields[key].fieldName === fieldName)
  }

  /**
   * This function processes a relationship field.
   *
   * It handles the conversion of relationship fields to the correct format for better-auth. (String ID)
   * and also maintains the field for how payload would expect it. (Typeof id payload would expect)
   *
   * For redundancy we assume the value could be an object, array or primitive value
   *
   */
  function processRelationshipField(result: Record<string, any>, originalKey: string, fieldName: string, value: any): void {
    // Primitive ID value (string or number)
    if (typeof value === 'string' || typeof value === 'number') {
      result[originalKey] = String(value)
      result[fieldName] = value
      return
    }
    // simple object with ID
    if (typeof value === 'object' && 'id' in value) {
      result[originalKey] = String(value.id)
      result[fieldName] = value.id
      return
    }
    // Array of relationships
    if (Array.isArray(value) && value.length > 0) {
      if (value.every((item) => typeof item === 'object' && 'id' in item)) {
        result[originalKey] = value.map((item) => String(item.id))
        result[fieldName] = value.map((item) => item.id)
      } else {
        result[originalKey] = value.map((item) => String(item))
        result[fieldName] = value.map((item) => item)
      }
      return
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
    getCollectionSlug,
    singleIdQuery,
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort
  }
}
