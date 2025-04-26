import type { CollectionAfterChangeHook } from 'payload'
import { getMappedField } from '@/better-auth/plugin/helpers/get-collection'
import { baModelKey, baseSlugs } from '@/better-auth/plugin/constants'
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { getDeafultCollectionSlug } from '@/better-auth/plugin/helpers/get-collection-slug'

export function getSyncPasswordToUserHook(pluginOptions: BetterAuthPluginOptions): CollectionAfterChangeHook {
  const hook: CollectionAfterChangeHook = async ({ doc, req, operation, context }) => {
    if (context?.syncAccountHook) return doc

    if (operation !== 'create' && operation !== 'update') {
      return doc
    }
    const userSlug = getDeafultCollectionSlug({ pluginOptions, modelKey: baModelKey.user })
    const accountSlug = getDeafultCollectionSlug({ pluginOptions, modelKey: baModelKey.account })
    const accountCollection = req.payload.collections[accountSlug]?.config

    const userField = getMappedField({
      collection: accountCollection,
      betterAuthFieldKey: 'userId'
    }).name

    if (!doc[userField]) {
      return doc
    }

    const account = await req.payload.findByID({
      collection: accountSlug,
      id: doc.id,
      depth: 0,
      req,
      showHiddenFields: true
    })

    if (!account || !account.password) {
      return doc
    }

    const [salt, hash] = account.password.split(':')

    if (!salt || !hash) {
      return doc
    }

    const userId = typeof doc[userField] === 'object' ? doc[userField]?.id : doc[userField]

    try {
      await req.payload.update({
        collection: userSlug,
        id: userId,
        data: {
          salt,
          hash
        },
        req,
        context: { syncPasswordToUser: true }
      })
    } catch (error) {
      console.error('Failed to sync password to user:', error)
    }

    return doc
  }

  return hook as CollectionAfterChangeHook
}
