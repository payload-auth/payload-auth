import { baModelFieldKeys, baModelKey } from '@/better-auth/plugin/constants'
import type { BetterAuthSchemas } from '@/better-auth/types'
import { set } from '../../utils/set'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'

export function configureOrganizationPlugin(plugin: any, resolvedSchemas: BetterAuthSchemas): void {
  const models = [baModelKey.organization, baModelKey.member, baModelKey.invitation, baModelKey.team, baModelKey.session] as const
  models.forEach((model) => set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(resolvedSchemas, model)))

  set(plugin, `schema.${baModelKey.member}.fields.organizationId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.member, baModelFieldKeys.member.organizationId))
  set(plugin, `schema.${baModelKey.member}.fields.organizationId.references.model`, getSchemaCollectionSlug(resolvedSchemas, baModelKey.organization))
  set(plugin, `schema.${baModelKey.member}.fields.userId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.member, baModelFieldKeys.member.userId))
  set(plugin, `schema.${baModelKey.member}.fields.userId.references.model`, getSchemaCollectionSlug(resolvedSchemas, baModelKey.user))
  set(plugin, `schema.${baModelKey.member}.fields.teamId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.member, baModelFieldKeys.member.teamId))

  set(plugin, `schema.${baModelKey.invitation}.fields.organizationId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.invitation, baModelFieldKeys.invitation.organizationId))
  set(plugin, `schema.${baModelKey.invitation}.fields.organizationId.references.model`, getSchemaCollectionSlug(resolvedSchemas, baModelKey.organization))
  set(plugin, `schema.${baModelKey.invitation}.fields.inviterId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.invitation, baModelFieldKeys.invitation.inviterId))
  set(plugin, `schema.${baModelKey.invitation}.fields.inviterId.references.model`, getSchemaCollectionSlug(resolvedSchemas, baModelKey.user))
  set(plugin, `schema.${baModelKey.invitation}.fields.teamId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.invitation, baModelFieldKeys.invitation.teamId))
  
  set(plugin, `schema.${baModelKey.team}.fields.organizationId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.team, baModelFieldKeys.team.organizationId))
  set(plugin, `schema.${baModelKey.team}.fields.organizationId.references.model`, getSchemaCollectionSlug(resolvedSchemas, baModelKey.user))
  
  set(plugin, `schema.${baModelKey.session}.fields.activeOrganizationId.fieldName`, getSchemaFieldName(resolvedSchemas, baModelKey.session, baModelFieldKeys.session.activeOrganizationId))
}
