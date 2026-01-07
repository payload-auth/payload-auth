# Core Concepts Documentation

## Files Overview

This covers the `/concepts/` directory with files explaining how the plugin works internally.

---

## File: `concepts/architecture.mdx`

```mdx
---
title: Architecture
description: Understanding how payload-auth integrates Better Auth with Payload CMS
---

# Architecture

payload-auth consists of three main components that work together to provide authentication.

## Component Overview

### 1. The Adapter

The adapter acts as a bridge between Better Auth and Payload's database layer.

\`\`\`
Better Auth ──▶ Adapter ──▶ Payload DB Operations
              (transform)
\`\`\`

Key responsibilities:
- Translates Better Auth queries to Payload operations
- Handles field name mapping (e.g., `userId` → `user` relationship)
- Converts ID types between systems
- Manages schema synchronization

### 2. The Plugin

The Payload plugin that configures collections and integrates with the Payload lifecycle.

\`\`\`typescript
betterAuthPlugin(options) → (config: Config) → Config
\`\`\`

Key responsibilities:
- Builds auth-related collections automatically
- Sanitizes Better Auth options
- Configures custom admin views (when using Better Auth for admin)
- Sets up hooks and endpoints

### 3. Shared Components

UI components and utilities used across both frontend and admin.

## Data Flow

### Authentication Flow

\`\`\`
1. User submits credentials
   ↓
2. Request hits /api/auth/[...all]
   ↓
3. Better Auth processes request
   ↓
4. Adapter translates to Payload operations
   ↓
5. Payload performs database operations
   ↓
6. Response returned through Better Auth
\`\`\`

### Initialization Flow

\`\`\`
1. Payload loads config
   ↓
2. betterAuthPlugin() called
   ↓
3. buildBetterAuthData() generates schemas
   ↓
4. buildCollections() creates collection configs
   ↓
5. sanitizeBetterAuthOptions() configures Better Auth
   ↓
6. onInit: initBetterAuth() creates auth instance
   ↓
7. payload.betterAuth is available
\`\`\`

## Schema Mapping

payload-auth maintains a mapping between Better Auth's schema and Payload's collections.

### Model Keys vs Collection Slugs

| Better Auth Model | Default Payload Slug |
|-------------------|---------------------|
| `user` | `users` |
| `session` | `sessions` |
| `account` | `accounts` |
| `verification` | `verifications` |
| `organization` | `organizations` |
| `member` | `members` |

### Field Mapping

Some fields are renamed for Payload conventions:

| Better Auth Field | Payload Field |
|-------------------|---------------|
| `userId` | `user` (relationship) |
| `organizationId` | `organization` (relationship) |
| `inviterId` | `inviter` (relationship) |

## The BetterAuth Instance

After initialization, `payload.betterAuth` provides access to:

\`\`\`typescript
interface BetterAuthReturn {
  handler: (request: Request) => Promise<Response>
  api: { /* All Better Auth API methods */ }
  options: BetterAuthOptions
  $Infer: { Session, User, ... }
}
\`\`\`

### Accessing in Payload

\`\`\`typescript
// In a hook or endpoint
const auth = req.payload.betterAuth

// Get session
const session = await auth.api.getSession({
  headers: req.headers
})

// Create user programmatically
const user = await auth.api.signUpEmail({
  body: { email, password, name }
})
\`\`\`
```

---

## File: `concepts/collections.mdx`

```mdx
---
title: Collections
description: Understanding the collections created by payload-auth
---

# Collections

payload-auth automatically generates and manages several collections for authentication.

## Core Collections

These collections are always created:

### Users Collection

Stores user accounts with authentication data.

\`\`\`typescript
// Default fields added
{
  email: string          // User's email (unique, indexed)
  emailVerified: boolean // Email verification status
  name: string           // Display name
  image?: string         // Profile image URL
  role: string[]         // User roles (default: ['user'])
  createdAt: Date
  updatedAt: Date
  
  // Plugin-specific fields added when enabled:
  twoFactorEnabled?: boolean    // Two-factor plugin
  phoneNumber?: string          // Phone plugin
  banned?: boolean              // Admin plugin
  username?: string             // Username plugin
}
\`\`\`

### Sessions Collection

Stores active user sessions.

\`\`\`typescript
{
  token: string          // Session token (indexed)
  user: relationship     // Reference to user
  expiresAt: Date        // Session expiration
  ipAddress?: string     // Client IP
  userAgent?: string     // Browser/client info
  
  // Plugin-specific:
  impersonatedBy?: relationship  // Admin plugin
  activeOrganizationId?: string  // Organization plugin
}
\`\`\`

### Accounts Collection

Links users to authentication providers.

\`\`\`typescript
{
  accountId: string      // Provider's user ID
  providerId: string     // Provider name (e.g., 'google')
  user: relationship     // Reference to user
  accessToken?: string   // OAuth access token
  refreshToken?: string  // OAuth refresh token
  password?: string      // Hashed password (for email provider)
}
\`\`\`

### Verifications Collection

Stores temporary verification tokens.

\`\`\`typescript
{
  identifier: string     // What's being verified
  value: string          // Verification token
  expiresAt: Date        // Token expiration
}
\`\`\`

## Plugin Collections

Additional collections created based on enabled plugins:

| Plugin | Collections Created |
|--------|-------------------|
| `admin` | - |
| `twoFactor` | `twoFactors` |
| `passkey` | `passkeys` |
| `apiKey` | `apiKeys` |
| `organization` | `organizations`, `members`, `invitations`, `teams`, `teamMembers` |
| `oidc` | `oauthApplications`, `oauthAccessTokens`, `oauthConsents` |
| `sso` | `ssoProviders` |
| `jwt` | `jwks` |
| `stripe` | `subscriptions` |

## Custom Collection: Admin Invitations

payload-auth adds an `admin-invitations` collection for inviting users:

\`\`\`typescript
{
  token: string     // Invite token
  role: string      // Role to assign
  url: string       // Generated invite URL (virtual)
}
\`\`\`

## Customizing Collections

### Changing Slugs

\`\`\`typescript
betterAuthPlugin({
  users: { slug: 'customers' },
  sessions: { slug: 'user-sessions' },
  accounts: { slug: 'auth-accounts' },
})
\`\`\`

### Adding Fields

Use `collectionOverrides` to add custom fields:

\`\`\`typescript
betterAuthPlugin({
  users: {
    collectionOverrides: ({ collection }) => ({
      ...collection,
      fields: [
        ...collection.fields,
        {
          name: 'dateOfBirth',
          type: 'date',
        },
      ],
    }),
  },
})
\`\`\`

### Hiding Collections

\`\`\`typescript
betterAuthPlugin({
  hidePluginCollections: true, // Hide all plugin collections
  sessions: { hidden: true },  // Or hide specific ones
})
\`\`\`
```

---

## File: `concepts/roles-permissions.mdx`

```mdx
---
title: Roles & Permissions
description: Managing user roles and access control
---

# Roles & Permissions

payload-auth provides role-based access control integrated with Payload's access system.

## Defining Roles

Configure roles in the plugin options:

\`\`\`typescript
betterAuthPlugin({
  users: {
    roles: ['user', 'editor', 'publisher'],
    adminRoles: ['admin', 'superadmin'],
    defaultRole: 'user',
    defaultAdminRole: 'admin',
  },
})
\`\`\`

### Role Types

- **`roles`** - All available roles in the system
- **`adminRoles`** - Roles that grant Payload admin access
- **`defaultRole`** - Assigned to new users on signup
- **`defaultAdminRole`** - Assigned to invited admins

## Access Control

### Admin Panel Access

Users with any role in `adminRoles` can access Payload admin:

\`\`\`typescript
// Built-in access function
hasAdminRoles(['admin', 'superadmin'])
\`\`\`

### Collection Access

Access functions are automatically applied:

\`\`\`typescript
// Users collection access
access: {
  admin: hasAdminRoles(adminRoles),
  read: isAdminOrCurrentUserWithRoles({ adminRoles }),
  create: isAdminWithRoles({ adminRoles }),
  update: isAdminOrCurrentUserUpdateWithAllowedFields({
    allowedFields: ['name'], // Non-admins can only update these
    adminRoles,
  }),
  delete: isAdminOrCurrentUserWithRoles({ adminRoles }),
}
\`\`\`

### Custom Access Functions

\`\`\`typescript
import { hasAdminRoles, isAdminWithRoles } from 'payload-auth/better-auth'

// In your collection
access: {
  read: ({ req }) => {
    if (hasAdminRoles(['admin'])({ req })) return true
    return {
      author: { equals: req.user?.id }
    }
  },
}
\`\`\`

## Using with Better Auth Admin Plugin

When using the admin plugin from Better Auth:

\`\`\`typescript
import { admin } from 'better-auth/plugins'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      admin({
        impersonationSessionDuration: 60 * 60, // 1 hour
      }),
    ],
  },
  users: {
    adminRoles: ['admin'], // Synced with admin plugin
  },
})
\`\`\`

This enables:
- User impersonation
- User banning
- Role management via API
```

---

## File: `concepts/sessions.mdx`

```mdx
---
title: Sessions
description: Understanding session management in payload-auth
---

# Sessions

payload-auth uses Better Auth's session system with Payload as the storage backend.

## Session Lifecycle

1. **Creation** - Session created on successful login
2. **Validation** - Token checked on each authenticated request
3. **Refresh** - Session updated to extend expiration
4. **Termination** - Session deleted on logout or expiration

## Session Storage

Sessions are stored in the `sessions` collection:

\`\`\`typescript
{
  token: string        // Unique session token (indexed)
  user: relationship   // Link to user
  expiresAt: Date      // When session expires
  ipAddress: string    // Client IP (if available)
  userAgent: string    // Browser info
  createdAt: Date
  updatedAt: Date
}
\`\`\`

## Cookie Caching

Better Auth supports cookie caching to reduce database lookups:

\`\`\`typescript
betterAuthPlugin({
  betterAuthOptions: {
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
  },
})
\`\`\`

### How It Works

1. Session data is signed and stored in a cookie
2. On requests within `maxAge`, cookie data is used
3. After `maxAge`, database is queried and cookie refreshed

### Fields in Cookie Cache

Control what's cached with `saveToJWT`:

\`\`\`typescript
users: {
  collectionOverrides: ({ collection }) => ({
    ...collection,
    fields: collection.fields.map(field => {
      if (field.name === 'sensitiveData') {
        return { ...field, saveToJWT: false }
      }
      return field
    }),
  }),
}
\`\`\`

## Multi-Session Support

Enable multiple sessions per user:

\`\`\`typescript
import { multiSession } from 'better-auth/plugins'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [multiSession()],
  },
})
\`\`\`

This allows users to:
- Be logged in on multiple devices
- Switch between sessions
- View all active sessions

## Session Expiration

Configure session duration:

\`\`\`typescript
betterAuthOptions: {
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Update every day
  },
}
\`\`\`
```
