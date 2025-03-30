import { Payload } from 'payload'
import { ClerkUser, ClerkPluginOptions } from '../../../../../../types'
import { findUserFromClerkUser } from '../../../../../../utils/user'

interface UserUpdatedHandlerParams {
  data: any
  payload: Payload
  userSlug: string
  mappingFunction: (clerkUser: ClerkUser) => Record<string, any>
  options: ClerkPluginOptions
}

export async function handleUserUpdated({
  data,
  payload,
  userSlug,
  mappingFunction,
  options
}: UserUpdatedHandlerParams): Promise<void> {
  const clerkUser = data as ClerkUser
  
  try {
    const existingUsers = await findUserFromClerkUser({
      payload,
      userSlug,
      clerkUser
    })
    
    if (existingUsers.docs.length > 0) {
      const existingUser = existingUsers.docs[0]
      
      let userData = {
        ...mappingFunction(clerkUser),
      }
      
      if ('role' in userData) {
        const { role, ...dataWithoutRole } = userData
        userData = dataWithoutRole
      }
      
      await payload.update({
        collection: userSlug,
        id: existingUser.id,
        data: userData,
      })
      
      if (options.enableDebugLogs) {
        console.log(`Updated user from Clerk: ${clerkUser.id}`)
      }
    } else if (options.enableDebugLogs) {
      console.log(`Attempted to update non-existent user: ${clerkUser.id}`)
    }
  } catch (error) {
    console.error('Error updating user from Clerk webhook:', error)
  }
} 