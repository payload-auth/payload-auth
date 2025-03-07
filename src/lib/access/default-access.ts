import type { AccessArgs, Config } from 'payload'

/**
 * Default payload access check that verifies if the user is authenticated
 * and has the admin role. We ensure this default access is only
 * applied to the admin collection to prevent regular users from
 * accessing the admin panel.
 */
function defaultAccessCheck(args: AccessArgs) {
  return (
    Boolean(args.req.user) &&
    args.req.user?.collection === 'users' &&
    args.req.user?.role === 'admin'
  )
}

/**
 * Applies default access control settings to all collections and globals
 * in the PayloadCMS configuration. This ensures proper authorization
 * across the application.
 *
 * @param config - The PayloadCMS configuration object
 * @returns The modified configuration with access controls applied
 */
export function applyDefaultAccess(config: Config): Config {
  // Apply access controls to collections
  for (const collection of config.collections ?? []) {
    collection.access = {
      // Only users collection should have admin access by default
      // Other collections should have admin access explicitly defined or be undefined
      admin:
        collection.slug === 'users' ? (collection.access?.admin ?? defaultAccessCheck) : undefined,
      create: collection.access?.create ?? defaultAccessCheck,
      delete: collection.access?.delete ?? defaultAccessCheck,
      read: collection.access?.read ?? defaultAccessCheck,
      update: collection.access?.update ?? defaultAccessCheck,
    }
  }

  // Apply access controls to globals
  for (const global of config.globals ?? []) {
    global.access = {
      read: global.access?.read ?? defaultAccessCheck,
      readDrafts: global.access?.readDrafts ?? defaultAccessCheck,
      readVersions: global.access?.readVersions ?? defaultAccessCheck,
      update: global.access?.update ?? defaultAccessCheck,
    }
  }

  return config
}
