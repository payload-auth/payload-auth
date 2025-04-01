import { getAuthTables } from 'better-auth/db'
import { baseCollectionSlugs } from './config'
import type { BetterAuthPluginOptions, SanitizedBetterAuthOptions } from '../types'

/**
 * Determines which collections are required based on the BetterAuth options and plugins
 */
export function getRequiredCollectionSlugs({
  logTables,
  pluginOptions,
  sanitizedBAOptions,
}: {
  logTables: boolean
  pluginOptions: BetterAuthPluginOptions
  sanitizedBAOptions: SanitizedBetterAuthOptions
}): Set<string> {
  // Start with base collections
  const requiredCollectionSlugs = new Set([
    pluginOptions.users?.slug ?? baseCollectionSlugs.users,
    pluginOptions.accounts?.slug ?? baseCollectionSlugs.accounts,
    pluginOptions.sessions?.slug ?? baseCollectionSlugs.sessions,
    pluginOptions.verifications?.slug ?? baseCollectionSlugs.verifications,
  ])

  // Add additional collections from auth tables if available
  try {
    const tables = getAuthTables(sanitizedBAOptions)

    if (logTables) {
      console.log(
        'Better Auth plugins:',
        sanitizedBAOptions.plugins?.map((plugin) => plugin.id) || [],
      )
      console.log(
        'Better Auth tables required:',
        Object.values(tables).map((table) => table.modelName),
      )
    }

    // Add all table model names to required collections
    Object.values(tables)
      .filter((table) => table.modelName)
      .forEach((table) => requiredCollectionSlugs.add(table.modelName))
  } catch (error) {
    console.error('Error determining required auth tables:', error)
    console.warn('Falling back to base collections only')

    // Log problematic plugins if any exist
    const plugins = sanitizedBAOptions.plugins || []
    if (plugins.length > 0) {
      console.warn(
        'Plugins that may have caused the error:',
        plugins.map((plugin) =>
          typeof plugin === 'object' && plugin !== null && 'name' in plugin
            ? plugin.name
            : 'unnamed plugin',
        ),
      )
    }
  }

  return requiredCollectionSlugs
}
