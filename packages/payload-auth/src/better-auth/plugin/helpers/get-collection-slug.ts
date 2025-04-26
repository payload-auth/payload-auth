import type { BetterAuthPluginOptions } from '../types'
import { baseSlugs, baModelKeyToSlug } from '../constants'

export function getCollectionSlug({
  pluginOptions,
  modelKey
}: {
  pluginOptions: BetterAuthPluginOptions
  modelKey: string
}): string {
  const baseSlug = baModelKeyToSlug[modelKey as keyof typeof baModelKeyToSlug] ?? modelKey
  
  switch (modelKey) {
    case 'user':
      return pluginOptions.users?.slug ?? baseSlugs.users
    case 'account':
      return pluginOptions.accounts?.slug ?? baseSlugs.accounts
    case 'session':
      return pluginOptions.sessions?.slug ?? baseSlugs.sessions
    case 'verification':
      return pluginOptions.verifications?.slug ?? baseSlugs.verifications
    case 'adminInvitation':
      return pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations
    default:
      return baseSlug
  }
} 