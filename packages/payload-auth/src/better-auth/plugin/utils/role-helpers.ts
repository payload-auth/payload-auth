/**
 * Shared utility functions for role management
 * Handles both single role (string) and multi-role (array)
 */

/**
 * Check if user has a specific role
 * @param userRole - User's role(s) - can be string, array, null, or undefined
 * @param role - The role to check for
 * @returns true if user has the role
 */
export const hasRole = (userRole: string | string[] | null | undefined, role: string): boolean => {
  if (!userRole) return false
  return Array.isArray(userRole) ? userRole.includes(role) : userRole === role
}

/**
 * Format role(s) for display
 * @param role - Role(s) to format
 * @returns Comma-separated string for arrays, or single role string
 */
export const formatRole = (role: string | string[] | null | undefined): string => {
  if (!role) return 'user'
  return Array.isArray(role) ? role.join(', ') : role
}

/**
 * Check if user has any of the specified roles
 * @param userRole - User's role(s)
 * @param roles - Array of roles to check
 * @returns true if user has at least one of the roles
 */
export const hasAnyRole = (userRole: string | string[] | null | undefined, roles: string[]): boolean => {
  if (!userRole) return false
  const userRoles = Array.isArray(userRole) ? userRole : [userRole]
  return userRoles.some((r) => roles.includes(r))
}

/**
 * Check if user has all of the specified roles
 * Only applicable for multi-role configurations
 * @param userRole - User's role(s)
 * @param roles - Array of roles to check
 * @returns true if user has all specified roles
 */
export const hasAllRoles = (userRole: string | string[] | null | undefined, roles: string[]): boolean => {
  if (!userRole) return false
  const userRoles = Array.isArray(userRole) ? userRole : [userRole]
  return roles.every((r) => userRoles.includes(r))
}

/**
 * Check if user is admin
 * @param userRole - User's role(s)
 * @param adminRoles - Array of roles considered as admin (default: ['admin'])
 * @returns true if user has any admin role
 */
export const isAdmin = (userRole: string | string[] | null | undefined, adminRoles: string[] = ['admin']): boolean => {
  return hasAnyRole(userRole, adminRoles)
}

/**
 * Normalize role to array format
 * Useful for consistent handling of roles
 * @param role - Role(s) in any format
 * @returns Array of roles
 */
export const normalizeRoleToArray = (role: string | string[] | null | undefined): string[] => {
  if (!role) return []
  return Array.isArray(role) ? role : [role]
}

/**
 * Normalize role to string format (for single-role systems)
 * @param role - Role(s) in any format
 * @param defaultRole - Default role if none provided
 * @returns First role as string
 */
export const normalizeRoleToString = (role: string | string[] | null | undefined, defaultRole: string = 'user'): string => {
  if (!role) return defaultRole
  return Array.isArray(role) ? (role[0] || defaultRole) : role
}
