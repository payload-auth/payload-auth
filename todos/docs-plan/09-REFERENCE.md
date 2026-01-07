# API Reference Documentation

## Files Overview

This covers the `/reference/` directory with comprehensive API documentation.

---

## File: `reference/api.mdx`

```mdx
---
title: API Reference
description: Complete API reference for payload-auth
---

# API Reference

## Plugin Export

### betterAuthPlugin

Main plugin function for Payload configuration.

\`\`\`typescript
import { betterAuthPlugin } from 'payload-auth/better-auth'

function betterAuthPlugin(options: PayloadAuthOptions): (config: Config) => Config
\`\`\`

**Parameters:**
- `options` - Plugin configuration options

**Returns:**
- Payload plugin function

**Example:**
\`\`\`typescript
export default buildConfig({
  plugins: [
    betterAuthPlugin({
      betterAuthOptions: {
        emailAndPassword: { enabled: true },
      },
    }),
  ],
})
\`\`\`

---

### getPayloadAuth

Retrieves the Payload instance with Better Auth attached.

\`\`\`typescript
import { getPayloadAuth } from 'payload-auth/better-auth'

async function getPayloadAuth<O extends PayloadAuthOptions>(
  config: Promise<SanitizedConfig> | SanitizedConfig
): Promise<BasePayload & { betterAuth: BetterAuthReturn<O> }>
\`\`\`

**Parameters:**
- `config` - Payload configuration or promise

**Returns:**
- Payload instance with `betterAuth` property

**Example:**
\`\`\`typescript
const { payload, betterAuth } = await getPayloadAuth(config)
const session = await betterAuth.api.getSession({ headers })
\`\`\`

---

## Adapter Export

### payloadAdapter

Creates a Better Auth database adapter for Payload.

\`\`\`typescript
import { payloadAdapter } from 'payload-auth/better-auth/adapter'

function payloadAdapter(options: {
  payloadClient: BasePayload | (() => Promise<BasePayload>)
  adapterConfig: {
    idType: 'number' | 'text'
    enableDebugLogs?: boolean
  }
}): (options: BetterAuthOptions) => DBAdapter
\`\`\`

**Example:**
\`\`\`typescript
// Manual Better Auth setup (advanced)
import { betterAuth } from 'better-auth'
import { payloadAdapter } from 'payload-auth/better-auth/adapter'

const auth = betterAuth({
  database: payloadAdapter({
    payloadClient: payload,
    adapterConfig: { idType: 'text' },
  }),
})
\`\`\`

---

## Helper Exports

### generateVerifyEmailUrl

Generates email verification URL.

\`\`\`typescript
import { generateVerifyEmailUrl } from 'payload-auth/better-auth'

function generateVerifyEmailUrl(options: {
  baseURL: string
  token: string
}): string
\`\`\`

---

## Access Control Helpers

### hasAdminRoles

Check if user has any admin role.

\`\`\`typescript
import { hasAdminRoles } from 'payload-auth/better-auth'

function hasAdminRoles(adminRoles: string[]): (args: { req: PayloadRequest }) => boolean
\`\`\`

**Example:**
\`\`\`typescript
access: {
  admin: hasAdminRoles(['admin', 'superadmin']),
}
\`\`\`

### isAdminWithRoles

Access function that requires admin role.

\`\`\`typescript
function isAdminWithRoles(config?: { adminRoles?: string[] }): FieldAccess
\`\`\`

### isAdminOrCurrentUserWithRoles

Access function for admin or document owner.

\`\`\`typescript
function isAdminOrCurrentUserWithRoles(config?: {
  adminRoles?: string[]
  idField?: string
}): Access
\`\`\`

---

## Client Exports

### Component Exports

\`\`\`typescript
// payload-auth/better-auth/plugin/client
export {
  AdminButtons,
  AdminInviteButton,
  AlternativeMethods,
  CredentialsForm,
  LoginFormProvider,
  LogoutButton,
  TwoFactorAuth,
  useLoginForm,
}
\`\`\`

### RSC Exports

\`\`\`typescript
// payload-auth/better-auth/plugin/rsc
export {
  AdminLogin,
  AdminSignup,
  ForgotPassword,
  Passkeys,
  ResetPassword,
  RSCRedirect,
  TwoFactorVerify,
}
\`\`\`

### Shared Exports

\`\`\`typescript
// payload-auth/shared
export { Logo }

// payload-auth/shared/payload/fields
export { FieldCopyButton, GenerateUuidButton }
\`\`\`
```

---

## File: `reference/types.mdx`

```mdx
---
title: TypeScript Types
description: Type definitions exported by payload-auth
---

# TypeScript Types

## Plugin Types

### PayloadAuthOptions

Main plugin configuration type.

\`\`\`typescript
interface PayloadAuthOptions {
  disabled?: boolean
  disableDefaultPayloadAuth?: boolean
  hidePluginCollections?: boolean
  collectionAdminGroup?: string
  requireAdminInviteForSignUp?: boolean
  
  debug?: {
    enableDebugLogs?: boolean
    logTables?: boolean
  }
  
  admin?: {
    loginMethods?: LoginMethod[]
  }
  
  users?: UserCollectionConfig
  accounts?: CollectionConfig
  sessions?: CollectionConfig
  verifications?: CollectionConfig
  adminInvitations?: AdminInvitationConfig
  
  pluginCollectionOverrides?: PluginCollectionOverrides
  betterAuthOptions?: BetterAuthOptions
}
\`\`\`

### UserCollectionConfig

\`\`\`typescript
interface UserCollectionConfig {
  slug?: string
  hidden?: boolean
  roles?: string[]
  adminRoles?: string[]
  defaultRole?: string
  defaultAdminRole?: string
  allowedFields?: string[]
  blockFirstBetterAuthVerificationEmail?: boolean
  collectionOverrides?: (options: {
    collection: CollectionConfig
  }) => CollectionConfig
}
\`\`\`

### BetterAuthOptions

Subset of Better Auth options (some are managed internally).

\`\`\`typescript
interface BetterAuthOptions
  extends Omit<
    BetterAuthOptionsType,
    'database' | 'user' | 'account' | 'verification' | 'session' | 'advanced'
  > {
  user?: Omit<NonNullable<BetterAuthOptionsType['user']>, 'modelName' | 'fields'>
  account?: Omit<NonNullable<BetterAuthOptionsType['account']>, 'modelName' | 'fields'>
  session?: Omit<NonNullable<BetterAuthOptionsType['session']>, 'modelName' | 'fields'>
  verification?: Omit<NonNullable<BetterAuthOptionsType['verification']>, 'modelName' | 'fields'>
  advanced?: Omit<NonNullable<BetterAuthOptionsType['advanced']>, 'generateId'>
}
\`\`\`

### LoginMethod

\`\`\`typescript
type LoginMethod =
  | 'emailPassword'
  | 'magicLink'
  | 'emailOTP'
  | 'phonePassword'
  | 'phoneOTP'
  | 'phoneMagicLink'
  | 'passkey'
  | SocialProvider

type SocialProvider =
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'google'
  | 'linkedin'
  | 'microsoft'
  | 'spotify'
  | 'tiktok'
  | 'twitter'
  | 'twitch'
  | 'zoom'
  | 'gitlab'
  | 'roblox'
  | 'vk'
  | 'kick'
  | 'reddit'
\`\`\`

## Return Types

### BetterAuthReturn

Type of `payload.betterAuth`.

\`\`\`typescript
type BetterAuthReturn<O extends PayloadAuthOptions = PayloadAuthOptions> = {
  handler: (request: Request) => Promise<Response>
  api: InferAPI<ReturnType<typeof router<ExtractBA<O>>>>['endpoints']
  options: ExtractBA<O>
  $ERROR_CODES: InferPluginErrorCodes<ExtractBA<O>> & BaseErrorCodes
  $context: Promise<AuthContext>
  $Infer: {
    Session: {
      session: InferSession<ExtractBA<O>>
      user: InferUser<ExtractBA<O>>
    }
  } & InferPluginTypes<ExtractBA<O>>
}
\`\`\`

### Inferred Session Type

Access inferred types for your configuration:

\`\`\`typescript
import type { BetterAuthReturn, PayloadAuthOptions } from 'payload-auth/better-auth'

// Your options type
type MyOptions = typeof myPluginOptions

// Get session type
type Session = BetterAuthReturn<MyOptions>['$Infer']['Session']
type User = Session['user']
type SessionData = Session['session']
\`\`\`

## Hook Types

### PayloadRequestWithBetterAuth

Extended Payload request with Better Auth.

\`\`\`typescript
interface PayloadRequestWithBetterAuth<O extends PayloadAuthOptions>
  extends PayloadRequest {
  payload: BasePayload & {
    betterAuth: BetterAuthReturn<O>
  }
}
\`\`\`

### CollectionHookWithBetterAuth

Type helper for hooks with Better Auth access.

\`\`\`typescript
type CollectionHookWithBetterAuth<
  O extends PayloadAuthOptions,
  T extends (args: any) => any
> = T extends (args: infer A) => infer R
  ? (args: Omit<A, 'req'> & { req: PayloadRequestWithBetterAuth<O> }) => R
  : never
\`\`\`

### EndpointWithBetterAuth

Type for custom endpoints with Better Auth.

\`\`\`typescript
type EndpointWithBetterAuth<O extends PayloadAuthOptions> = Omit<Endpoint, 'handler'> & {
  handler: (req: PayloadRequestWithBetterAuth<O>) => Promise<Response> | Response
}
\`\`\`

## Schema Types

### ModelKey

All Better Auth model keys.

\`\`\`typescript
type ModelKey =
  | 'user'
  | 'session'
  | 'account'
  | 'verification'
  | 'rateLimit'
  | 'apikey'
  | 'passkey'
  | 'oauthApplication'
  | 'oauthAccessToken'
  | 'oauthConsent'
  | 'ssoProvider'
  | 'organization'
  | 'organizationRole'
  | 'team'
  | 'teamMember'
  | 'member'
  | 'invitation'
  | 'jwks'
  | 'twoFactor'
  | 'scimProvider'
  | 'deviceCode'
  | 'subscription'
\`\`\`
```

---

## File: `reference/hooks.mdx`

```mdx
---
title: Collection Hooks
description: Hooks available and added by payload-auth
---

# Collection Hooks

payload-auth adds several hooks to manage authentication state.

## Users Collection Hooks

### beforeChange

- **onVerifiedChange** - Syncs emailVerified status with Payload's internal verified field

### afterChange

- **syncAccount** - Syncs password changes to the accounts collection

### beforeLogin

- **beforeLoginHook** - Validates login with Better Auth configuration

### afterLogin

- **afterLoginHook** - Creates Better Auth session after Payload login

### afterLogout

- **afterLogoutHook** - Terminates Better Auth session on logout

### beforeDelete

- **beforeDeleteHook** - Cleans up related sessions and accounts

## Accounts Collection Hooks

### afterChange

- **syncPasswordToUser** - Syncs password changes back to user collection

## Admin Invitations Hooks

### beforeChange

- **urlBeforeChange** - Clears virtual URL field before save

### afterRead

- **urlAfterRead** - Generates invite URL on read

## Adding Custom Hooks

Extend the default hooks via collection overrides:

\`\`\`typescript
betterAuthPlugin({
  users: {
    collectionOverrides: ({ collection }) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        afterChange: [
          ...(collection.hooks?.afterChange ?? []),
          async ({ doc, operation }) => {
            if (operation === 'create') {
              // Custom logic for new users
              await sendWelcomeEmail(doc.email)
            }
            return doc
          },
        ],
      },
    }),
  },
})
\`\`\`

## Using Better Auth in Hooks

\`\`\`typescript
import type { CollectionHookWithBetterAuth, PayloadAuthOptions } from 'payload-auth/better-auth'
import type { CollectionAfterChangeHook } from 'payload'

type MyOptions = typeof myPluginOptions

const myHook: CollectionHookWithBetterAuth<MyOptions, CollectionAfterChangeHook> = async ({
  doc,
  req,
}) => {
  // Access Better Auth
  const session = await req.payload.betterAuth.api.getSession({
    headers: req.headers,
  })
  
  // ... your logic
  
  return doc
}
\`\`\`
```

---

## File: `reference/endpoints.mdx`

```mdx
---
title: Custom Endpoints
description: Endpoints added by payload-auth
---

# Custom Endpoints

payload-auth adds several endpoints to the Users collection.

## Users Collection Endpoints

### POST /api/users/refresh-token

Refreshes the current session token.

**Request:**
\`\`\`http
POST /api/users/refresh-token
Cookie: better-auth.session_token=...
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "session": { /* session data */ }
}
\`\`\`

### POST /api/users/set-admin-role

Sets a user's role (admin only).

**Request:**
\`\`\`json
{
  "userId": "user-id",
  "role": "admin"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": { /* updated user */ }
}
\`\`\`

### POST /api/users/generate-invite-url

Generates an admin invite URL.

**Request:**
\`\`\`json
{
  "role": "admin"
}
\`\`\`

**Response:**
\`\`\`json
{
  "url": "https://yourapp.com/admin/signup?token=..."
}
\`\`\`

### POST /api/users/send-invite

Sends an invite email.

**Request:**
\`\`\`json
{
  "email": "newadmin@example.com",
  "role": "admin"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Invite sent"
}
\`\`\`

## Adding Custom Endpoints

\`\`\`typescript
import type { EndpointWithBetterAuth, PayloadAuthOptions } from 'payload-auth/better-auth'

type MyOptions = typeof myPluginOptions

const myEndpoint: EndpointWithBetterAuth<MyOptions> = {
  path: '/my-endpoint',
  method: 'post',
  handler: async (req) => {
    const session = await req.payload.betterAuth.api.getSession({
      headers: req.headers,
    })
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Your logic here
    
    return Response.json({ success: true })
  },
}
\`\`\`

## Better Auth API Endpoints

All Better Auth endpoints are available at `/api/auth/*`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Email signup |
| `/api/auth/sign-in/email` | POST | Email signin |
| `/api/auth/sign-in/social` | GET | Social signin redirect |
| `/api/auth/callback/:provider` | GET | OAuth callback |
| `/api/auth/sign-out` | POST | Sign out |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/forget-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/auth/verify-email` | GET | Verify email |
| `/api/auth/ok` | GET | Health check |

See [Better Auth docs](https://www.better-auth.com/docs/concepts/api) for complete API reference.
```
