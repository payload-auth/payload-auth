import { baModelKey } from '@/better-auth/plugin/constants'
import { getCollectionByModelKey } from '@/better-auth/plugin/helpers/get-collection'
import { commitTransaction, initTransaction, killTransaction, type CollectionBeforeDeleteHook } from 'payload'

export function getBeforeDeleteHook(): CollectionBeforeDeleteHook {
  const hook: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const collections = req.payload.collections
    const accountsSlug = getCollectionByModelKey(collections, baModelKey.account).slug
    const sessionsSlug = getCollectionByModelKey(collections, baModelKey.session).slug
    const verificationsSlug = getCollectionByModelKey(collections, baModelKey.verification).slug
    try {
      const { payload } = req
      const userId = id

      const shouldCommit = await initTransaction(req)

      await payload.delete({
        collection: accountsSlug,
        where: {
          user: {
            equals: userId
          }
        },
        req
      })

      await payload.delete({
        collection: sessionsSlug,
        where: {
          user: {
            equals: userId
          }
        },
        req
      })

      await payload.delete({
        collection: verificationsSlug,
        where: {
          value: {
            like: `"${userId}"`
          }
        },
        req
      })

      if (shouldCommit) {
        await commitTransaction(req)
      }

      return
    } catch (error) {
      await killTransaction(req)
      console.error('Error in user afterDelete hook:', error)
      return
    }
  }

  return hook
}
