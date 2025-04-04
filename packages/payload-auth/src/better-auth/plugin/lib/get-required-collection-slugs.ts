import { getAuthTables } from 'better-auth/db'
import type { PayloadBetterAuthPluginOptions, SanitizedBetterAuthOptions } from '..'

/**
 * Determines which collections are required based on the BetterAuth options and plugins
 */
export function getRequiredCollectionSlugs({
  logTables,
  pluginOptions,
  sanitizedBAOptions,
}: {
  logTables: boolean
  pluginOptions: PayloadBetterAuthPluginOptions
  sanitizedBAOptions: SanitizedBetterAuthOptions
}) {
  // Always include the base required collections (User, Account, Session, Verification)
  const userCollectionSlug = pluginOptions.users?.slug ?? 'users'
  const accountCollectionSlug = pluginOptions.accounts?.slug ?? 'accounts'
  const sessionCollectionSlug = pluginOptions.sessions?.slug ?? 'sessions'
  const verificationCollectionSlug = pluginOptions.verifications?.slug ?? 'verifications'

  const requiredCollectionSlugs = new Set([
    userCollectionSlug,
    accountCollectionSlug,
    sessionCollectionSlug,
    verificationCollectionSlug,
  ])

  // If we have better auth options, use getAuthTables to determine additional tables needed
  if (sanitizedBAOptions) {
    try {
      // Get the tables required by the auth configuration
      const tables = getAuthTables({
        ...sanitizedBAOptions,
      })

      const plugins = sanitizedBAOptions.plugins ?? []
      if (logTables) {
        console.log(
          'Better Auth plugins:',
          plugins.map((plugin) => plugin.id),
        )
        console.log(
          'Better Auth tables required:',
          Object.keys(tables).map((key) => tables[key].modelName),
        )
      }

      // Add all table slugs to the required collections set
      Object.values(tables).forEach((table) => {
        if (table.modelName) {
          requiredCollectionSlugs.add(table.modelName)
        }
      })
    } catch (error) {
      console.error('Error determining required auth tables:', error)
      console.warn('Falling back to base collections only')

      // Log the plugins that were attempted to be used
      if (sanitizedBAOptions.plugins?.length ?? 0 > 0) {
        console.warn(
          'Plugins that may have caused the error:',
          sanitizedBAOptions.plugins?.map((plugin) => {
            // Type-safe way to get plugin identification
            return typeof plugin === 'object' && plugin !== null && 'name' in plugin
              ? plugin.name
              : 'unnamed plugin'
          }),
        )
      }
    }
  }

  // if (enable_debug_logs) {
  //   console.log('Required collection slugs: ', Array.from(requiredCollectionSlugs))
  // }

  return requiredCollectionSlugs
}
