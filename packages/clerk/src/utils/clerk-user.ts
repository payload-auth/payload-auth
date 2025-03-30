/**
 * Helper functions for processing Clerk user data
 */

import { ClerkMappingFunction, ClerkUser } from '../types'

/**
 * Default mapping function for Clerk user data to Payload fields
 */
export const defaultClerkMapping: ClerkMappingFunction = (clerkUser: ClerkUser) => {
  return {
    clerkId: clerkUser.id,
    email: getPrimaryEmail(clerkUser),
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
export const ensureRequiredClerkFields = (
  mappingFunction: ClerkMappingFunction
): ClerkMappingFunction => {
  return (clerkUser: ClerkUser) => {
    const mappedData = mappingFunction(clerkUser)
    
    return {
      ...mappedData,
      clerkId: clerkUser.id,
      email: mappedData.email || getPrimaryEmail(clerkUser),
    }
  }
}

/**
 * Extracts the primary email from Clerk user data
 */
export function getPrimaryEmail(clerkUser: ClerkUser): string | undefined {
  // Find primary email if marked
  const primaryEmail = clerkUser.email_addresses?.find(
    (email) => email.id === clerkUser.primary_email_address_id
  )
  
  // Fallback to first email
  return primaryEmail?.email_address || clerkUser.email_addresses?.[0]?.email_address
}

/**
 * Formats a user's full name from their first and last name
 */
export function formatFullName(firstName?: string, lastName?: string): string | undefined {
  if (!firstName && !lastName) return undefined
  return `${firstName || ''} ${lastName || ''}`.trim()
} 