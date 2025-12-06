import { baModelKey } from '@/better-auth/plugin/constants'
import type { BetterAuthSchemas, SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import { getSchemaCollectionSlug } from '../../build-collections/utils/collection-schema'
import type { CollectionConfig } from 'payload'
import { flattenAllFields } from 'payload'

/**
 * Mirrors Payload's `saveToJWT: false` flags into BetterAuth `additionalFields.returned: false`
 * so cookie cache output respects collection config even if BetterAuth hooks don't run.
 */
export function applySaveToJwtReturned({
  betterAuthOptions,
  collections,
  resolvedSchemas,
  modelKey
}: {
  betterAuthOptions: SanitizedBetterAuthOptions
  collections: CollectionConfig[]
  resolvedSchemas: BetterAuthSchemas
  modelKey: typeof baModelKey.user | typeof baModelKey.session
}) {
  const collectionSlug = getSchemaCollectionSlug(resolvedSchemas, modelKey)
  const collection = collections.find((c) => c.slug === collectionSlug)
  if (!collection) return

  const flattened = flattenAllFields({ fields: collection.fields })
  const optionKey = modelKey as 'user' | 'session'
  const targetOptions = (betterAuthOptions as any)[optionKey] ?? {}
  const existingAdditionalFields = targetOptions.additionalFields ?? {}
  const updatedAdditionalFields: Record<string, any> = { ...existingAdditionalFields }

  flattened.forEach((field) => {
    const saveToJWT = (field as any).saveToJWT
    const isJoin = (field as any).type === 'join'

    // Default Payload behavior: only fields with saveToJWT === true are included in JWT.
    // For BetterAuth cookie cache, explicitly mark joins and saveToJWT false as non-returned.
    if (saveToJWT === false || (isJoin && saveToJWT !== true)) {
      const betterAuthFieldKey = (field as any).custom?.betterAuthFieldKey || field.name
      updatedAdditionalFields[betterAuthFieldKey] = {
        ...updatedAdditionalFields[betterAuthFieldKey],
        returned: false
      }
    }
  })

  ;(betterAuthOptions as any)[optionKey] = {
    ...targetOptions,
    additionalFields: updatedAdditionalFields
  }
}
