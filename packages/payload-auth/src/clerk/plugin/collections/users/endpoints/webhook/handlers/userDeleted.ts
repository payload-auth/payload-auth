import { Payload } from 'payload'
import { ClerkPluginOptions } from '../../../../../../types'
import { findUserFromClerkUser } from '../../../../../../utils/user'

interface UserDeletedHandlerParams {
  data: any
  payload: Payload
  userSlug: string
  options: ClerkPluginOptions
}

export async function handleUserDeleted({
  data,
  payload,
  userSlug,
  options
}: UserDeletedHandlerParams): Promise<void> {
  const clerkId = data.id
  
  try {
    const existingUsers = await findUserFromClerkUser({
      payload,
      userSlug,
      clerkUser: { id: clerkId }
    })
    
    if (existingUsers.docs.length > 0) {
      const existingUser = existingUsers.docs[0]
      
      await payload.delete({
        collection: userSlug,
        id: existingUser.id,
      })
      
      if (options.enableDebugLogs) {
        console.log(`Deleted user from Clerk: ${clerkId}`)
      }
    }
  } catch (error) {
    console.error('Error deleting user from Clerk webhook:', error)
  }
} 