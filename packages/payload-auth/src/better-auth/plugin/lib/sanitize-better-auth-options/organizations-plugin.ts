import { baModelKey, baModelFieldKeys } from '@/better-auth/plugin/constants'
import { CollectionSchemaMap } from '../../helpers/get-collection-schema-map'
import { set } from '../../utils/set'
import { getSchemaCollectionSlug, getSchemaFieldName } from '../build-collections/utils/collection-schema'

export function configureOrganizationPlugin(plugin: any, collectionSchemaMap: CollectionSchemaMap): void {
  const models = [baModelKey.organization, baModelKey.member, baModelKey.invitation, baModelKey.team, baModelKey.session] as const
  models.forEach((model) => set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(collectionSchemaMap, model)))

  set(plugin, `schema.${baModelKey.member}.fields.organizationId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.member, baModelFieldKeys.member.organizationId))
  set(plugin, `schema.${baModelKey.member}.fields.userId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.member, baModelFieldKeys.member.userId))
  set(plugin, `schema.${baModelKey.member}.fields.teamId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.member, baModelFieldKeys.member.teamId))

  set(plugin, `schema.${baModelKey.invitation}.fields.organizationId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.invitation, baModelFieldKeys.invitation.organizationId))
  set(plugin, `schema.${baModelKey.invitation}.fields.inviterId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.invitation, baModelFieldKeys.invitation.inviterId))
  set(plugin, `schema.${baModelKey.invitation}.fields.teamId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.invitation, baModelFieldKeys.invitation.teamId))

  set(plugin, `schema.${baModelKey.team}.fields.organizationId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.team, baModelFieldKeys.team.organizationId))

  set(plugin, `schema.${baModelKey.session}.fields.activeOrganizationId.fieldName`, getSchemaFieldName(collectionSchemaMap, baModelKey.session, baModelFieldKeys.session.activeOrganizationId))
}
