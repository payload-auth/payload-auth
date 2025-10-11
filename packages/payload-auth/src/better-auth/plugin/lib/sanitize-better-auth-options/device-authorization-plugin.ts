import { baModelKey } from '@/better-auth/plugin/constants'
import { set } from '../../utils/set'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'
import type { BetterAuthSchemas } from '@/better-auth/types'

export function configureDeviceAuthorizationPlugin(plugin: any, resolvedSchemas: BetterAuthSchemas): void {
  set(plugin, `schema.${baModelKey.deviceCode}.modelName`, getSchemaCollectionSlug(resolvedSchemas, baModelKey.deviceCode))
}
