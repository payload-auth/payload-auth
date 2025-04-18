/**
 * User-related utility functions for the Clerk plugin
 */

/**
 * Find a user in Payload by their Clerk ID or primary email
 */
export async function findUserFromClerkUser({ payload, userSlug, clerkUser }: { payload: any; userSlug: string; clerkUser: any }) {
  const primaryEmailObj = clerkUser.email_addresses?.find((email: any) => email.id === clerkUser.primary_email_address_id)

  const primaryEmail = primaryEmailObj?.email_address

  return payload.find({
    collection: userSlug,
    where: {
      or: [
        {
          clerkId: {
            equals: clerkUser.id
          }
        },
        primaryEmail
          ? {
              email: {
                equals: primaryEmail
              }
            }
          : undefined
      ].filter(Boolean)
    }
  })
}

/**
 * Get a user by their Clerk ID
 * Returns the first user found or null if not found
 */
export async function getUserByClerkId(payload: any, userSlug: string, clerkId: string) {
  if (!clerkId) return null

  try {
    const result = await findUserFromClerkUser({
      payload,
      userSlug,
      clerkUser: { id: clerkId }
    })
    return result.docs.length > 0 ? result.docs[0] : null
  } catch (error) {
    console.error('Error finding user by Clerk ID:', error)
    return null
  }
}
