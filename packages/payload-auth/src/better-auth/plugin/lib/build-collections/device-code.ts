import { baModelKey } from '../../constants'
import { getAdminAccess } from '../../helpers/get-admin-access'
import { getCollectionFields } from './utils/transform-schema-fields-to-payload'
import { getSchemaCollectionSlug, getSchemaFieldName, assertAllSchemaFields } from './utils/collection-schema'

import type { CollectionConfig } from 'payload'
import type { BuildCollectionProps, FieldOverrides } from '@/better-auth/plugin/types'
import type { DeviceCode } from '@/better-auth/generated-types'

export function buildDeviceCodeCollection({ incomingCollections, pluginOptions, resolvedSchemas }: BuildCollectionProps): CollectionConfig {
  const deviceCodeSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.deviceCode)
  const deviceCodeSchema = resolvedSchemas[baModelKey.deviceCode]

  const existingDeviceCodeCollection = incomingCollections.find((collection) => collection.slug === deviceCodeSlug) as
    | CollectionConfig
    | undefined

  const fieldOverrides: FieldOverrides<keyof DeviceCode> = {
    userId: () => ({
      index: true,
      admin: { readOnly: true, description: 'The user that is a member of the team.' }
    })
  }

  const collectionFields = getCollectionFields({
    schema: deviceCodeSchema,
    additionalProperties: fieldOverrides
  })

  let deviceCodeCollection: CollectionConfig = {
    ...existingDeviceCodeCollection,
    slug: deviceCodeSlug,
    admin: {
      hidden: pluginOptions.hidePluginCollections ?? false,
      useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.deviceCode, 'deviceCode'),
      description: 'Device codes of an organization team.',
      group: pluginOptions?.collectionAdminGroup ?? 'Auth',
      ...existingDeviceCodeCollection?.admin
    },
    access: {
      ...getAdminAccess(pluginOptions),
      ...(existingDeviceCodeCollection?.access ?? {})
    },
    custom: {
      ...(existingDeviceCodeCollection?.custom ?? {}),
      betterAuthModelKey: baModelKey.deviceCode
    },
    fields: [...(existingDeviceCodeCollection?.fields ?? []), ...(collectionFields ?? [])]
  }

  assertAllSchemaFields(deviceCodeCollection, deviceCodeSchema)

  return deviceCodeCollection
}
