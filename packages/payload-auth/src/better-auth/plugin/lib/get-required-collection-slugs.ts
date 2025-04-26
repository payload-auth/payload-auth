import { getAuthTables } from 'better-auth/db'
import { baseSlugs, baModelKeyToSlug } from '../constants'
import type { BetterAuthPluginOptions } from '../types'

/**
 * Determines which collections are required based on the BetterAuth options and plugins
 * returns a map of the better-auth schema model keys to the collection slugs to be built
 */
export function getRequiredCollectionSlugs(pluginOptions: BetterAuthPluginOptions): string[] {
  const tables = getAuthTables(pluginOptions.betterAuthOptions ?? {})
  if (pluginOptions.debug?.logTables) {
    console.log('Better Auth plugins:', pluginOptions.betterAuthOptions?.plugins?.map((plugin) => plugin.id) || [])
    console.log(
      'Better Auth tables required:',
      Object.values(tables).map((table) => table.modelName)
    )
  }

  // Start with base collections
  const requiredCollectionSlugs: Set<string> = new Set(Object.values(baseSlugs))

  // Map through all better-auth schema model keys
  Object.keys(tables).forEach((key) => {
    const slug = baModelKeyToSlug[key as keyof typeof baModelKeyToSlug]
    if (slug) {
      requiredCollectionSlugs.add(slug)
    }
  })

  return Array.from(requiredCollectionSlugs)
}
