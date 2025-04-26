import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { BETTER_AUTH_CONTEXT_KEY } from '@/better-auth/adapter'
import { getMappedCollection } from '@/better-auth/plugin/helpers/get-collection'
import { baseSlugs } from '@/better-auth/plugin/constants'

export function getSyncAccountHook(collectionMap: Record<string, CollectionConfig>): CollectionAfterChangeHook {
  const hook: CollectionAfterChangeHook = async ({ doc, req, operation, context }) => {
    if (context?.syncPasswordToUser) return doc

    if (operation !== 'create' && operation !== 'update') return doc

    const userCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baseSlugs.users })
    const accountCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baseSlugs.accounts })

    const user = await req.payload.findByID({
      collection: userCollection.slug,
      id: doc.id,
      depth: 0,
      req,
      showHiddenFields: true
    })

    if (!user || !user.hash || !user.salt) return doc

    const passwordValue = `${user.salt}:${user.hash}`

    if (operation === 'create' && !(BETTER_AUTH_CONTEXT_KEY in context)) {
      try {
        await req.payload.create({
          collection: accountCollection.slug,
          data: {
            userId: doc.id,
            accountId: doc.id.toString(),
            providerId: 'credential',
            password: passwordValue,
            context: { syncAccountHook: true }
          },
          req
        })
      } catch (error) {
        console.error('Failed to create account for user:', error)
      }
    }

    if (operation === 'update') {
      try {
        const accounts = await req.payload.find({
          collection: accountCollection.slug,
          where: {
            and: [{ userId: { equals: doc.id } }, { providerId: { equals: 'credential' } }]
          },
          req,
          depth: 0,
          context: { syncAccountHook: true }
        })

        const account = accounts.docs.at(0)
        if (account) {
          await req.payload.update({
            collection: accountCollection.slug,
            id: account.id,
            data: {
              password: passwordValue
            },
            req,
            context: { syncAccountHook: true }
          })
        }
      } catch (error) {
        console.error('Failed to sync hash/salt to account:', error)
      }
    }

    return doc
  }

  return hook as CollectionAfterChangeHook
}
