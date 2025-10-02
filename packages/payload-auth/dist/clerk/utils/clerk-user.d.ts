import { ClerkToPayloadMappingFunction } from '../types';
import type { User, UserJSON } from '@clerk/backend';
/**
 * Default mapping function for Clerk user data to Payload fields
 */
export declare const defaultClerkMapping: ClerkToPayloadMappingFunction;
/**
 * Ensures that essential Clerk fields are always set regardless of the mapping function
 * This wrapper guarantees that clerkId and email will always be present in the mapped data
 */
export declare const createMappingWithRequiredClerkFields: (mappingFunction: ClerkToPayloadMappingFunction) => ClerkToPayloadMappingFunction;
/**
 * Extracts the primary email from Clerk user data
 */
export declare function getPrimaryEmail(clerkUser: User): string | undefined;
export declare function getPrimaryEmailFromJson(clerkUser: UserJSON): string | undefined;
/**
 * Formats a user's full name from their first and last name
 */
export declare function formatFullName(firstName?: string, lastName?: string): string | undefined;
//# sourceMappingURL=clerk-user.d.ts.map