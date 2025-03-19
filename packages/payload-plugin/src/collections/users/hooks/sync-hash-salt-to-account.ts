import type { CollectionAfterChangeHook } from 'payload'
import type { CollectionHookWithBetterAuth } from '../../../types'

type CollectionAfterChangeHookWithBetterAuth =
  CollectionHookWithBetterAuth<CollectionAfterChangeHook>

type SyncHashSaltToAccountOptions = {
  userSlug: string
  accountSlug: string
}

export const getSyncHashSaltToAccountHook = (
  options: SyncHashSaltToAccountOptions,
): CollectionAfterChangeHook => {
  const hook: CollectionAfterChangeHookWithBetterAuth = async ({
    doc,
    req,
    operation,
    context,
  }) => {
    if (context?.syncPasswordToUser) return doc

    if (operation !== 'create' && operation !== 'update') {
      return doc
    }

    const user = await req.payload.findByID({
      collection: options.userSlug,
      id: doc.id,
      depth: 0,
      req,
      showHiddenFields: true,
    })

    if (!user || !user.hash || !user.salt) {
      return doc
    }

    const userField = req.payload.betterAuth.options.account?.fields?.userId || 'userId'

    try {
      const accounts = await req.payload.find({
        collection: options.accountSlug,
        where: {
          and: [{ [userField]: { equals: doc.id } }, { providerId: { equals: 'credential' } }],
        },
        depth: 0,
      })

      if (accounts.docs.length > 0) {
        const accountId = accounts.docs[0].id

        await req.payload.update({
          collection: options.accountSlug,
          id: accountId,
          data: {
            password: `${user.salt}:${user.hash}`,
          },
          context: { syncHashSaltToAccount: true },
        })
      }
    } catch (error) {
      console.error('Failed to sync hash/salt to account:', error)
    }

    return doc
  }

  return hook as CollectionAfterChangeHook
}
