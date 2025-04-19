import { CollectionBeforeChangeHook } from 'payload'

export const getBeforeCreateUserHook = (adminInviteCollectionSlug: string): CollectionBeforeChangeHook => {
  const hook: CollectionBeforeChangeHook = async ({ req, data, operation }) => {
    if (operation !== 'create') {
      return data
    }
    const payload = req.payload
    const { adminInviteToken } = data
    
    if (!adminInviteToken) {
      return data
    }
    const { docs: adminInvites } = await payload.find({
      collection: adminInviteCollectionSlug,
      where: {
        token: { equals: adminInviteToken }
      }
    })
    const adminInvite = adminInvites.at(0)
    if (!adminInvite) {
      return data
    }
    try {
      await payload.delete({
        collection: adminInviteCollectionSlug,
        where: {
          id: { equals: adminInvite.id }
        }
      })
    } catch (error) {
      // We will treat this as the admin invite never got redeemed
      return data
    }
    delete data.adminInviteToken
    return {
      ...data,
      role: adminInvite.role
    }
  }

  return hook
} 