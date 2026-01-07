# Plugins Documentation

## Files Overview

This covers the `/plugins/` directory documenting Better Auth plugin integrations.

---

## File: `plugins/overview.mdx`

```mdx
---
title: Plugins Overview
description: Better Auth plugins supported by payload-auth
---

# Plugins Overview

payload-auth supports most Better Auth plugins with automatic collection generation and configuration.

## Supported Plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| `admin` | ✅ Full | User management, impersonation, banning |
| `organization` | ✅ Full | Multi-tenant organizations and teams |
| `twoFactor` | ✅ Full | TOTP-based two-factor auth |
| `passkey` | ✅ Full | WebAuthn/FIDO2 passkeys |
| `apiKey` | ✅ Full | API key management |
| `magicLink` | ✅ Full | Email magic link auth |
| `emailOTP` | ✅ Full | Email OTP verification |
| `phoneNumber` | ✅ Full | Phone-based authentication |
| `anonymous` | ✅ Full | Anonymous users |
| `username` | ✅ Full | Username-based login |
| `multiSession` | ✅ Full | Multiple concurrent sessions |
| `jwt` | ✅ Full | JWT token generation |
| `oidc` | ✅ Full | OIDC provider |
| `sso` | ✅ Full | SSO/SAML integration |
| `openAPI` | ✅ Full | OpenAPI schema generation |
| `nextCookies` | ✅ Full | Next.js cookie helpers |
| `bearer` | ✅ Partial | Bearer token auth |
| `stripe` | ✅ Full | Stripe subscriptions |
| `scim` | ✅ Full | SCIM provisioning |
| `mcp` | ✅ Full | Machine Control Protocol |

## Using Plugins

### Basic Usage

\`\`\`typescript
import { admin, twoFactor, organization } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      admin(),
      twoFactor({ issuer: 'My App' }),
      passkey({
        rpID: 'myapp.com',
        rpName: 'My App',
        origin: 'https://myapp.com',
      }),
      organization({
        teams: { enabled: true },
      }),
    ],
  },
})
\`\`\`

## Auto-Generated Collections

Plugins automatically create their required collections:

\`\`\`
admin         → No extra collections (adds user fields)
twoFactor     → twoFactors
passkey       → passkeys
apiKey        → apiKeys
organization  → organizations, members, invitations, teams, teamMembers
jwt           → jwks
sso           → ssoProviders
oidc          → oauthApplications, oauthAccessTokens, oauthConsents
stripe        → subscriptions
scim          → scimProviders
\`\`\`

## Plugin Collection Overrides

Customize plugin collections:

\`\`\`typescript
betterAuthPlugin({
  pluginCollectionOverrides: {
    organizations: ({ collection }) => ({
      ...collection,
      fields: [
        ...collection.fields,
        { name: 'website', type: 'text' },
      ],
    }),
  },
})
\`\`\`
```

---

## File: `plugins/admin.mdx`

```mdx
---
title: Admin Plugin
description: User management, impersonation, and banning
---

# Admin Plugin

Advanced user management capabilities for administrators.

## Installation

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
    adminRoles: ['admin', 'superadmin'],
  },
})
\`\`\`

## Features

### User Impersonation

Admins can sign in as other users for debugging:

\`\`\`typescript
// Admin client
await authClient.admin.impersonateUser({
  userId: 'user-to-impersonate',
})

// The session now shows as that user
// Session includes impersonatedBy field
\`\`\`

### Stop Impersonation

\`\`\`typescript
await authClient.admin.stopImpersonation()
\`\`\`

### Ban Users

\`\`\`typescript
await authClient.admin.banUser({
  userId: 'user-id',
  banReason: 'Violation of terms',
  banExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
})

// Unban
await authClient.admin.unbanUser({
  userId: 'user-id',
})
\`\`\`

### Set User Role

\`\`\`typescript
await authClient.admin.setRole({
  userId: 'user-id',
  role: 'editor',
})
\`\`\`

## Payload Admin Integration

payload-auth adds admin buttons to the user edit view:

- **Impersonate** - Sign in as this user
- **Ban/Unban** - Ban or unban the user

## User Fields Added

\`\`\`typescript
{
  banned: boolean
  banReason?: string
  banExpires?: Date
}
\`\`\`

## Session Fields Added

\`\`\`typescript
{
  impersonatedBy?: string // ID of admin who is impersonating
}
\`\`\`

## Impersonation Bar

When impersonating, the admin sees an impersonation indicator.

Add the impersonation bar to your layout:

\`\`\`tsx
import { ImpersonatingBar } from '@/components/impersonating-bar'

export default function Layout({ children }) {
  return (
    <>
      <ImpersonatingBar />
      {children}
    </>
  )
}
\`\`\`
```

---

## File: `plugins/organization.mdx`

```mdx
---
title: Organization Plugin
description: Multi-tenant organizations and teams
---

# Organization Plugin

Build multi-tenant applications with organizations, members, and teams.

## Configuration

\`\`\`typescript
import { organization } from 'better-auth/plugins'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      organization({
        // Enable teams within organizations
        teams: { enabled: true },
        
        // Custom invitation email
        sendInvitationEmail: async (data) => {
          await sendEmail({
            to: data.email,
            subject: \`Invitation to join \${data.organization.name}\`,
            html: \`<a href="\${data.inviteLink}">Accept Invitation</a>\`,
          })
        },
      }),
    ],
  },
})
\`\`\`

## Collections Created

- **organizations** - Organization records
- **members** - Organization memberships
- **invitations** - Pending invitations
- **teams** - Teams within organizations (if enabled)
- **teamMembers** - Team memberships

## Client Usage

### Create Organization

\`\`\`typescript
const org = await authClient.organization.create({
  name: 'Acme Corp',
  slug: 'acme-corp',
})
\`\`\`

### Invite Member

\`\`\`typescript
await authClient.organization.inviteMember({
  organizationId: org.id,
  email: 'newmember@example.com',
  role: 'member',
})
\`\`\`

### Accept Invitation

\`\`\`typescript
await authClient.organization.acceptInvitation({
  invitationId: 'invitation-id',
})
\`\`\`

### Switch Active Organization

\`\`\`typescript
await authClient.organization.setActive({
  organizationId: 'org-id',
})

// Session now includes activeOrganizationId
\`\`\`

### Get Organization Members

\`\`\`typescript
const members = await authClient.organization.listMembers({
  organizationId: 'org-id',
})
\`\`\`

## Teams

When teams are enabled:

### Create Team

\`\`\`typescript
await authClient.organization.createTeam({
  organizationId: 'org-id',
  name: 'Engineering',
})
\`\`\`

### Add Team Member

\`\`\`typescript
await authClient.organization.addTeamMember({
  teamId: 'team-id',
  userId: 'user-id',
})
\`\`\`

## Access Control

Filter content by organization:

\`\`\`typescript
// In a Payload collection
access: {
  read: ({ req }) => {
    const orgId = req.user?.session?.activeOrganizationId
    if (!orgId) return false
    return {
      organization: { equals: orgId },
    }
  },
}
\`\`\`

## Organization Roles

Organizations have built-in roles:

- `owner` - Full control
- `admin` - Can manage members
- `member` - Basic access

### Custom Roles

\`\`\`typescript
organization({
  memberRoles: ['owner', 'admin', 'editor', 'viewer'],
  defaultMemberRole: 'viewer',
})
\`\`\`
```

---

## File: `plugins/api-key.mdx`

```mdx
---
title: API Key Plugin
description: Generate and manage API keys for programmatic access
---

# API Key Plugin

Allow users to create API keys for programmatic access to your API.

## Configuration

\`\`\`typescript
import { apiKey } from 'better-auth/plugins'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      apiKey({
        // API key prefix
        prefix: 'pk_',
        
        // Rate limiting
        rateLimit: {
          enabled: true,
          max: 1000,
          window: 60 * 60, // 1 hour
        },
      }),
    ],
  },
})
\`\`\`

## Client Setup

\`\`\`typescript
import { apiKeyClient } from 'better-auth/plugins'

export const authClient = createAuthClient({
  plugins: [apiKeyClient()],
})
\`\`\`

## Usage

### Create API Key

\`\`\`typescript
const { data } = await authClient.apiKey.create({
  name: 'My API Key',
  expiresIn: 30 * 24 * 60 * 60, // 30 days in seconds
})

// data.key - The full API key (only shown once!)
// data.id - Key ID for management
\`\`\`

### List API Keys

\`\`\`typescript
const keys = await authClient.apiKey.list()
// Returns keys without the secret part
\`\`\`

### Revoke API Key

\`\`\`typescript
await authClient.apiKey.revoke({
  keyId: 'key-id',
})
\`\`\`

## Using API Keys

### In Request Headers

\`\`\`typescript
fetch('/api/data', {
  headers: {
    'Authorization': 'Bearer pk_xxx...',
  },
})
\`\`\`

### Validating in API Routes

\`\`\`typescript
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'

export async function GET(request: Request) {
  const { betterAuth } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: request.headers,
  })
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // session.user is the API key owner
  return Response.json({ data: '...' })
}
\`\`\`

## API Key Collection

The plugin creates an `apiKeys` collection with:

\`\`\`typescript
{
  name: string          // User-provided name
  key: string           // Hashed key
  start: string         // First few characters for identification
  prefix: string        // Key prefix
  user: relationship    // Owner
  expiresAt?: Date      // Expiration
  enabled: boolean      // Active status
  lastRequest?: Date    // Last used
  requestCount: number  // Total requests
}
\`\`\`
```
