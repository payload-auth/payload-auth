import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { getMappedCollection, getMappedField } from '@/better-auth/plugin/helpers/get-collection'
import { baModelKey } from '@/better-auth/plugin/constants'

export function getSyncPasswordToUserHook(collectionMap: Record<string, CollectionConfig>): CollectionAfterChangeHook {
  const hook: CollectionAfterChangeHook = async ({ doc, req, operation, context }) => {
    if (context?.syncAccountHook) return doc

    if (operation !== 'create' && operation !== 'update') {
      return doc
    }

    const userSlug = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.user }).slug
    const accountCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baModelKey.account })
    const userField = getMappedField({
      collection: accountCollection,
      betterAuthFieldKey: 'userId'
    }).name

    if (!doc[userField]) {
      return doc
    }

    const account = await req.payload.findByID({
      collection: accountCollection.slug,
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
