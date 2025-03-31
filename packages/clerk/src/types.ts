import type { UserJSON } from '@clerk/backend'
import type { CollectionConfig, User } from 'payload'

/**
 * Function type for mapping Clerk user data to Payload fields
 */
export type ClerkToPayloadMappingFunction = (clerkUser: UserJSON) => Omit<User, 'id'>

export interface ClerkPluginOptions {
  /**
   * Disable the plugin
   */
  disabled?: boolean
  
  /**
   * Enable debug logs
   */
  enableDebugLogs?: boolean

  /**
   * Collection options for the Clerk users
   */
  users?: {
    /**
     * The slug for the users collection
     * @default "users"
     */
    slug?: string
    
    /**
     * Whether to hide the collection in the admin UI
     * @default false
     */
    hidden?: boolean
    
    /**
     * Collection override function that lets you customize the collection config
     */
    collectionOverrides?: (args: { collection: CollectionConfig }) => CollectionConfig
    
    /**
     * Admin roles that have permission to perform admin actions
     * @default ["admin"]
     */
    adminRoles?: string[]

    /**
     * Custom function to map Clerk user data to Payload fields
     * If not provided, default mapping will be used
     */
    clerkToPayloadMapping?: ClerkToPayloadMappingFunction
  }

  /**
   * Webhook configuration
   */
  webhook?: {
    /**
     * Svix signing secret for validating webhook requests
     * If not provided, webhook validation will be skipped (not recommended for production)
     */
    svixSecret?: string
    
    /**
     * Custom endpoint path for the webhook
     * @default "/api/webhooks/clerk"
     */
    path?: string
  }
} 