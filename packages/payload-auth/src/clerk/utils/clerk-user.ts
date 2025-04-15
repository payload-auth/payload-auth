import { ClerkToPayloadMappingFunction } from '../types'
import type { User, UserJSON } from '@clerk/backend'

/**
 * Default mapping function for Clerk user data to Payload fields
 */
export const defaultClerkMapping: ClerkToPayloadMappingFunction = (clerkUser: UserJSON) => {
  return {
    clerkId: clerkUser.id,
    email: getPrimaryEmailFromJson(clerkUser),
    emailVerified: clerkUser.email_addresses?.[0]?.verification?.status === 'verified',
    firstName: clerkUser.first_name,
    lastName: clerkUser.last_name,
    imageUrl: clerkUser.image_url,
    lastSyncedAt: new Date(),
    clerkPublicMetadata: clerkUser?.public_metadata || {},
  }
}

/**
 * Ensures that essential Clerk fields are always set regardless of the mapping function
 * This wrapper guarantees that clerkId and email will always be present in the mapped data
 */
export const createMappingWithRequiredClerkFields = (
  mappingFunction: ClerkToPayloadMappingFunction
): ClerkToPayloadMappingFunction => {
  return (clerkUser: UserJSON) => {
    const mappedData = mappingFunction(clerkUser)
    
    return {
      ...mappedData,
      clerkId: clerkUser.id,
      email: mappedData.email || getPrimaryEmailFromJson(clerkUser),
    }
  }
}

/**
 * Extracts the primary email from Clerk user data
 */
export function getPrimaryEmail(clerkUser: User): string | undefined {
  const primaryEmail = clerkUser.emailAddresses?.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  )
  
  return primaryEmail?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress
}

export function getPrimaryEmailFromJson(clerkUser: UserJSON): string | undefined {
  const primaryEmail = clerkUser.email_addresses?.find(
    (email) => email.id === clerkUser.primary_email_address_id
  )
  
  return primaryEmail?.email_address || clerkUser.email_addresses?.[0]?.email_address
}

/**
 * Formats a user's full name from their first and last name
 */
export function formatFullName(firstName?: string, lastName?: string): string | undefined {
  if (!firstName && !lastName) return undefined
  return `${firstName || ''} ${lastName || ''}`.trim()
} 