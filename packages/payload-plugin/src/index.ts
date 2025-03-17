import { getPayload } from 'payload'
import type { BasePayload, Config, SanitizedConfig } from 'payload'
import type {
  BetterAuthFunctionOptions,
  BetterAuthReturn,
  PayloadBetterAuthPluginOptions,
  TPlugins,
} from './types.js'
import { sanitizeBetterAuthOptions } from './lib/sanitize-auth-options.js'
import { getRequiredCollectionSlugs } from './lib/get-required-collection-slugs.js'
import { buildCollectionConfigs } from './lib/build-collection-configs.js'
import { payloadAdapter } from '@payload-auth/better-auth-db-adapter'
import { betterAuth } from 'better-auth'
export * from './types.js'

function initBetterAuth<P extends TPlugins>({
  payload,
  options,
}: {
  payload: BasePayload
  options: BetterAuthFunctionOptions<P>
}): BetterAuthReturn<P> {
  const auth = betterAuth({
    ...options,
    database: payloadAdapter(payload, {
      enableDebugLogs: options.enableDebugLogs ?? false,
    }),
  })

  return auth as unknown as BetterAuthReturn<P>
}

export function payloadBetterAuth(pluginOptions: PayloadBetterAuthPluginOptions) {
  return (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.collections) {
      config.collections = []
    }

    const sanitzedBetterAuthOptions = sanitizeBetterAuthOptions(pluginOptions)

    // Determine which collections to add based on the options and plugins
    const requiredCollectionSlugs = getRequiredCollectionSlugs({
      logTables: pluginOptions.logTables ?? false,
      pluginOptions,
      sanitizedBAOptions: sanitzedBetterAuthOptions,
    })

    // Update with the required collections + existing collections
    config.collections = buildCollectionConfigs({
      incomingCollections: config.collections ?? [],
      requiredCollectionSlugs,
      pluginOptions,
      sanitizedBAOptions: sanitzedBetterAuthOptions,
    })

    // Initialize admin configuration with defaults using deep merge pattern
    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        graphics: {
          ...config.admin?.components?.graphics,
          Logo: '@payload-auth/better-auth-plugin/rsc#Logo',
        },
        afterLogin: [
          {
            path: '@payload-auth/better-auth-plugin/rsc#LoginRedirect',
          },
          ...(config.admin?.components?.afterLogin || []),
        ],
        logout: {
          Button: '@payload-auth/better-auth-plugin/client#LogoutButton',
        },
        views: {
          ...config.admin?.components?.views,
          login: {
            path: '/login',
            Component: '@payload-auth/better-auth-plugin/rsc#Login',
          },
          createFirstAdmin: {
            path: '/create-first-admin',
            Component: '@payload-auth/better-auth-plugin/rsc#CreateFirstAdmin',
          },
        },
      },
      routes: {
        ...config.admin?.routes,
        login: '/login-redirect',
      },
    }

    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // Initialize and set the betterAuth instance
      const auth = initBetterAuth<NonNullable<typeof sanitzedBetterAuthOptions.plugins>>({
        payload,
        options: {
          ...sanitzedBetterAuthOptions,
          enableDebugLogs: pluginOptions.enableDebugLogs,
          plugins: [...(sanitzedBetterAuthOptions.plugins ?? [])],
        },
      })

      ;(payload as BasePayload & { betterAuth: typeof auth }).betterAuth = auth
    }
    return config
  }
}

export async function getPayloadWithAuth<P extends TPlugins>(
  config: Promise<SanitizedConfig> | SanitizedConfig,
): Promise<BasePayload & { betterAuth: BetterAuthReturn<P> }> {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<P>
  }
  return payload
}
