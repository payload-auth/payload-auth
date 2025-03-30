import type { Config } from 'payload'
import type { ClerkPluginOptions } from '../types'
import { withClerkUsersCollection } from './collections/users'

export * from './auth-strategy'
export * from './collections/users'

export function clerkPlugin(pluginOptions: ClerkPluginOptions = {}) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    config.custom = {
      ...config.custom,
      hasClerkPlugin: true,
    }

    if (!config.collections) {
      config.collections = []
    }

    const userSlug = pluginOptions.users?.slug ?? 'users'

    const existingUserCollection = config.collections.find(
      (collection: any) => collection.slug === userSlug
    )

    if (existingUserCollection) {
      const index = config.collections.findIndex((collection: any) => collection.slug === userSlug)
      config.collections[index] = withClerkUsersCollection({
        collection: existingUserCollection,
        options: pluginOptions,
      })
    } else {
      config.collections.push(
        withClerkUsersCollection({
          options: pluginOptions,
        })
      )
    }

    return config
  }
} 