import type { Prettify, UnionToIntersection, betterAuth } from "better-auth";
import type {
  BetterAuthOptions as BetterAuthOptionsType,
  BetterAuthPlugin as BetterAuthPluginType,
  InferAPI,
  InferPluginTypes,
} from "better-auth/types";
import type {
  BasePayload,
  CollectionConfig,
  Config,
  Endpoint,
  PayloadRequest,
} from "payload";

/**
 * BetterAuth options with the following caveats:
 * - The `database` option is removed as it is configured internally
 * - The `user` `modelName` and `fields` is removed as it is configured internally
 * - The `account` `modelName` and `fields` is removed as it is configured internally
 * - The `session` `modelName` and `fields` is removed as it is configured internally
 * - The `verification` `modelName` and `fields` is removed as it is configured internally
 *
 * @see https://www.better-auth.com/docs/reference/options
 */
export interface BetterAuthOptions
  extends Omit<
    BetterAuthOptionsType,
    "database" | "user" | "account" | "verification" | "session" | "advanced"
  > {
  user?:
    | Omit<NonNullable<BetterAuthOptionsType["user"]>, "modelName" | "fields">
    | undefined;
  account?:
    | Omit<
        NonNullable<BetterAuthOptionsType["account"]>,
        "modelName" | "fields"
      >
    | undefined;
  session?:
    | Omit<
        NonNullable<BetterAuthOptionsType["session"]>,
        "modelName" | "fields"
      >
    | undefined;
  verification?:
    | Omit<
        NonNullable<BetterAuthOptionsType["verification"]>,
        "modelName" | "fields"
      >
    | undefined;
  advanced?:
    | Omit<NonNullable<BetterAuthOptionsType["advanced"]>, "generateId">
    | undefined;
}

export interface SanitizedBetterAuthOptions
  extends Omit<BetterAuthOptionsType, "database"> {}

export type SocialProvider = keyof NonNullable<
  BetterAuthOptionsType["socialProviders"]
>;

export type SocialProviders = {
  [key in SocialProvider]?: {
    enabled?: boolean;
    disableSignUp?: boolean;
  };
};

export interface BetterAuthPluginOptions {
  /**
   * Disable the plugin
   * @default false
   */
  disabled?: boolean;
  /**
   * Disable the default payload auth
   *
   * This will ensure that better-auth handles both admin and frontend auth
   *
   * Admin will make use of custom admin routes for auth and give you more control
   *
   * Note: This will override the option passed in the users collection config
   *
   * Read about this more in the docs
   * @see https://www.payloadauth.com/docs/better-auth#disable-default-payload-auth
   *
   * @default false
   */
  disableDefaultPayloadAuth?: boolean;
  /**
   * Custom admin components when disableDefaultPayloadAuth is true
   *
   * These components will be used to render the login, create first admin, and other auth-related views
   */
  adminComponents?: {
    /**
     * Custom social providers
     *
     * This will add social providers to the login view
     *
     * Make sure to include the provider in the betterAuthOptions.socialProviders array
     */
    socialProviders?: SocialProviders;
  };
  /**
   * Debug options
   */
  debug?: {
    /**
     * Enable debug logs
     * @default false
     */
    enableDebugLogs?: boolean;
    /**
     * Log the tables that are needed for better-auth on init
     * @default false
     */
    logTables?: boolean;
  };
  /**
   * Hide the better-authplugin collections from the payload admin UI
   * @default false
   */
  hidePluginCollections?: boolean;
  /**
   * Defines the admin group for collections.
   * @default "Auth"
   */
  collectionAdminGroup?: string;
  /**
   * Configure the Users collections:
   */
  users?: {
    /**
     * Will set the `modelName` for the `user` table in better-auth
     *
     * and the `slug` for the `users` collection in payload
     *
     * @default 'users'
     */
    slug?: string | undefined;
    /**
     * The default role for users
     *
     * This will be used as the default role for the role field in the users collection
     *
     * If you define this you must also have this role in the roles array
     *
     * This will also be used as the defaultRole option in the better-auth admin plugin if present
     * @see https://www.better-auth.com/docs/plugins/admin#default-role
     * @default "user"
     */
    defaultRole?: string;
    /**
     * The default role for admins
     *
     * This will be used as the default role for when admins sign up in the create first admin view or when inviting new admins
     *
     *
     * @default "admin"
     */
    defaultAdminRole?: string;
    /**
     * All roles for the users collection
     *
     * These will be used to define all the options in the user collection role field
     *
     * Will be merged with the adminRoles array, no need to worry about redefining in adminRoles or duplicates
     *
     * This should match the roles in the better-auth admin plugin if you are using it
     * @see https://www.better-auth.com/docs/plugins/admin#access-control
     *
     * @default ["user"]
     */
    roles?: string[];
    /**
     * Define admin roles for the users collection
     *
     * These roles will be given admin access to all auth collections created by this plugin
     *
     * Note: Will be merged with the roles array, no need to worry about redefining in roles or duplicates
     *
     * Will be also used as the adminRoles option in the better-auth admin plugin if present
     *
     * @see https://www.better-auth.com/docs/plugins/admin#admin-roles
     *
     * @default ["admin"]
     */
    adminRoles?: string[];
    /**
     * Hide the `users` collection from the payload admin UI
     *
     * This will be overwritten if you change the value in the collection overrides option
     */
    hidden?: boolean | undefined;
    /**
     * Define which fields users can update themselves
     *
     * Password field is automatically included and doesn't need to be specified here
     *
     * @example ['name', 'dateOfBirth', 'phoneNumber']
     * @default ['name']
     */
    allowedFields?: string[] | undefined;
    /**
     * Function to override the collection configuration
     *
     * This allows modifying the collection config after it has been built
     * Example use cases include adding saveToJwt to specific fields or
     * modifying field descriptions
     *
     * @param options Object containing the collection config and potentially additional parameters
     * @returns Modified collection config
     */
    collectionOverrides?: (options: {
      collection: CollectionConfig;
    }) => CollectionConfig;
    /**
     * This will block the first on sign up verification email from better-auth.
     * If you are using Payload's userCollection.verify option, you will want to set this to true.
     * Function that will be blocked: options.emailVerificationsendVerificationEmail
     * @default false
     */
    blockFirstBetterAuthVerificationEmail?: boolean;
  };
  /**
   * Configure the Accounts collections:
   */
  accounts?: {
    /**
     * Will set the `modelName` for the `account` table in better-auth
     *
     * and the `slug` for the `accounts` collection in payload
     *
     * @default 'accounts'
     */
    slug?: string | undefined;
    /**
     * Hide the `accounts` collection from the payload admin UI
     */
    hidden?: boolean | undefined;
    /**
     * Function to override the collection configuration
     *
     * This allows modifying the collection config after it has been built
     *
     * @param options Object containing the collection config and potentially additional parameters
     * @returns Modified collection config
     */
    collectionOverrides?: (options: {
      collection: CollectionConfig;
    }) => CollectionConfig;
  };
  /**
   * Configure the Sessions collections:
   */
  sessions?: {
    /**
     * Will set the `modelName` for the `session` table in better-auth
     *
     * and the `slug` for the `sessions` collection in payload
     *
     * @default 'sessions'
     */
    slug?: string | undefined;
    /**
     * Hide the `sessions` collection from the payload admin UI
     */
    hidden?: boolean | undefined;
    /**
     * Function to override the collection configuration
     *
     * This allows modifying the collection config after it has been built
     *
     * @param options Object containing the collection config and potentially additional parameters
     * @returns Modified collection config
     */
    collectionOverrides?: (options: {
      collection: CollectionConfig;
    }) => CollectionConfig;
  };
  /**
   * Configure the Verifications collections:
   */
  verifications?: {
    /**
     * Will set the `modelName` for the `verification` table in better-auth
     *
     * and the `slug` for the `verifications` collection in payload
     *
     * @default 'verifications'
     */
    slug?: string | undefined;
    /**
     * Hide the `verifications` collection from the payload admin UI
     */
    hidden?: boolean | undefined;
    /**
     * Function to override the collection configuration
     *
     * This allows modifying the collection config after it has been built
     *
     * @param options Object containing the collection config and potentially additional parameters
     * @returns Modified collection config
     */
    collectionOverrides?: (options: {
      collection: CollectionConfig;
    }) => CollectionConfig;
  };
  /**
   * Configure the Admin Invitations collections:
   */
  adminInvitations?: {
    /**
     * Will set the `slug` for the `admin-invitations` collection in payload
     *
     * @default 'admin-invitations'
     */
    slug?: string | undefined;
    /**
     * Hide the `admin-invitations` collection from the payload admin UI
     */
    hidden?: boolean | undefined;
    /**
     * Function to override the collection configuration
     *
     * This allows modifying the collection config after it has been built
     *
     * @param options Object containing the collection config and potentially additional parameters
     * @returns Modified collection config
     */
    collectionOverrides?: (options: {
      collection: CollectionConfig;
    }) => CollectionConfig;
  };
  /**
   * BetterAuth options with the following caveats:
   * - The `database` option is removed as it is configured internally
   * - The `user` `modelName` and `fields` is removed as it is configured internally
   * - The `account` `modelName` and `fields` is removed as it is configured internally
   * - The `session` `modelName` and `fields` is removed as it is configured internally
   * - The `verification` `modelName` and `fields` is removed as it is configured internally
   *
   * @see https://www.better-auth.com/docs/reference/options
   */
  betterAuthOptions?: BetterAuthOptions;
}

export interface BetterAuthPlugin {
  (config: Config): Config;
  pluginOptions: BetterAuthPluginOptions;
}

export interface PayloadRequestWithBetterAuth<
  TPlugins extends BetterAuthPluginType[] = [],
> extends PayloadRequest {
  payload: BasePayload & {
    betterAuth: BetterAuthReturn<TPlugins>;
  };
}

export type CollectionHookWithBetterAuth<T extends (args: any) => any> =
  T extends (args: infer A) => infer R
    ? (args: Omit<A, "req"> & { req: PayloadRequestWithBetterAuth }) => R
    : never;

export type EndpointWithBetterAuth = Omit<Endpoint, "handler"> & {
  handler: (req: PayloadRequestWithBetterAuth) => Promise<Response> | Response;
};

export type ExtractEndpoints<T> = T extends BetterAuthPlugin
  ? T extends { endpoints?: infer E }
    ? E
    : {}
  : {};

export type TPlugins<
  TPlugins extends BetterAuthPluginType[] = BetterAuthPluginType[],
> = TPlugins;

export type PluginInferTypes<T extends TPlugins> = {
  [K in keyof InferPluginTypes<{ plugins: T }>]: InferPluginTypes<{
    plugins: T;
  }>[K];
};

export type BetterAuthReturn<T extends TPlugins> = Omit<
  ReturnType<typeof betterAuth>,
  "$Infer"
> & {
  api: T extends (infer P)[]
    ? InferAPI<UnionToIntersection<ExtractEndpoints<P>>>
    : {};
  $Infer: ReturnType<typeof betterAuth>["$Infer"] & PluginInferTypes<T>;
};

export type BetterAuthFunctionOptions<P extends TPlugins> = Omit<
  BetterAuthOptions,
  "database" | "plugins"
> & {
  enableDebugLogs?: boolean;
  plugins: P;
};
