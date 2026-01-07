# Configuration Documentation

## Files Overview

This covers the `/configuration/` directory with comprehensive configuration references.

---

## File: `configuration/plugin-options.mdx`

```mdx
---
title: Plugin Options
description: Complete reference for PayloadAuthOptions
---

# Plugin Options

The `betterAuthPlugin` function accepts a `PayloadAuthOptions` object.

## Complete Options Reference

\`\`\`typescript
interface PayloadAuthOptions {
  // Core Settings
  disabled?: boolean
  disableDefaultPayloadAuth?: boolean
  hidePluginCollections?: boolean
  collectionAdminGroup?: string
  requireAdminInviteForSignUp?: boolean
  
  // Debug
  debug?: {
    enableDebugLogs?: boolean
    logTables?: boolean
  }
  
  // Admin UI
  admin?: {
    loginMethods?: LoginMethod[]
  }
  
  // Collection Configuration
  users?: UserCollectionConfig
  accounts?: CollectionConfig
  sessions?: CollectionConfig
  verifications?: CollectionConfig
  adminInvitations?: AdminInvitationConfig
  
  // Plugin Collection Overrides
  pluginCollectionOverrides?: PluginCollectionOverrides
  
  // Better Auth Options
  betterAuthOptions?: BetterAuthOptions
}
\`\`\`

## Core Settings

### `disabled`

Completely disable the plugin.

\`\`\`typescript
disabled: process.env.NODE_ENV === 'test'
\`\`\`

### `disableDefaultPayloadAuth`

Use Better Auth for admin panel authentication instead of Payload's built-in auth.

\`\`\`typescript
disableDefaultPayloadAuth: true
\`\`\`

When enabled:
- Custom login/signup views are added
- Better Auth handles all authentication
- Social login works in admin panel
- Two-factor auth works in admin panel

### `hidePluginCollections`

Hide all plugin-generated collections from admin UI.

\`\`\`typescript
hidePluginCollections: true
\`\`\`

### `collectionAdminGroup`

Group name for auth collections in admin sidebar.

\`\`\`typescript
collectionAdminGroup: 'Authentication' // Default: 'Auth'
\`\`\`

### `requireAdminInviteForSignUp`

Require an admin invitation for any signup (including social).

\`\`\`typescript
requireAdminInviteForSignUp: true
\`\`\`

## Users Configuration

\`\`\`typescript
users: {
  slug: 'users',           // Collection slug
  hidden: false,           // Hide from admin
  
  // Roles
  roles: ['user', 'editor'],
  adminRoles: ['admin'],
  defaultRole: 'user',
  defaultAdminRole: 'admin',
  
  // Self-update permissions
  allowedFields: ['name', 'image'],
  
  // Email handling
  blockFirstBetterAuthVerificationEmail: false,
  
  // Customization
  collectionOverrides: ({ collection }) => collection,
}
\`\`\`

### `allowedFields`

Fields non-admin users can update on their own profile:

\`\`\`typescript
allowedFields: ['name', 'image', 'bio']
\`\`\`

## Admin Invitations

\`\`\`typescript
adminInvitations: {
  slug: 'admin-invitations',
  hidden: false,
  
  generateInviteUrl: ({ payload, token }) => {
    return \`\${process.env.APP_URL}/admin/signup?token=\${token}\`
  },
  
  sendInviteEmail: async ({ payload, email, url }) => {
    await payload.sendEmail({
      to: email,
      subject: 'Admin Invitation',
      html: \`<a href="\${url}">Accept Invitation</a>\`,
    })
    return { success: true }
  },
}
\`\`\`

## Debug Options

\`\`\`typescript
debug: {
  enableDebugLogs: process.env.NODE_ENV === 'development',
  logTables: true, // Log generated table structure on init
}
\`\`\`

## Collection Overrides

Each collection accepts an override function:

\`\`\`typescript
sessions: {
  slug: 'sessions',
  hidden: true,
  collectionOverrides: ({ collection }) => ({
    ...collection,
    access: {
      ...collection.access,
      read: () => false, // Override read access
    },
  }),
}
\`\`\`
```

---

## File: `configuration/better-auth-options.mdx`

```mdx
---
title: Better Auth Options
description: Configuring Better Auth within payload-auth
---

# Better Auth Options

The `betterAuthOptions` property configures Better Auth. Most options are passed through directly.

## Important Notes

Some Better Auth options are managed by payload-auth:

| Option | Status |
|--------|--------|
| `database` | ❌ Set automatically via adapter |
| `user.modelName` | ❌ Set via plugin config |
| `session.modelName` | ❌ Set via plugin config |
| `account.modelName` | ❌ Set via plugin config |
| `advanced.generateId` | ❌ Uses Payload's ID generation |

## Common Options

### Base Configuration

\`\`\`typescript
betterAuthOptions: {
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  basePath: '/api/auth', // Default
  appName: 'My App',
  trustedOrigins: ['https://myapp.com'],
}
\`\`\`

### Email & Password

\`\`\`typescript
betterAuthOptions: {
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    
    sendResetPassword: async ({ user, url }) => {
      // Send password reset email
    },
  },
}
\`\`\`

### Email Verification

\`\`\`typescript
betterAuthOptions: {
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send verification email
    },
  },
}
\`\`\`

### Session Configuration

\`\`\`typescript
betterAuthOptions: {
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
    
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
}
\`\`\`

### Social Providers

\`\`\`typescript
betterAuthOptions: {
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ['email', 'profile'],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
}
\`\`\`

### Account Linking

\`\`\`typescript
betterAuthOptions: {
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'email-password'],
    },
  },
}
\`\`\`

### Plugins

\`\`\`typescript
import { admin, twoFactor, organization } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'

betterAuthOptions: {
  plugins: [
    admin(),
    twoFactor({
      issuer: 'My App',
    }),
    passkey({
      rpID: 'myapp.com',
      rpName: 'My App',
      origin: 'https://myapp.com',
    }),
    organization({
      teams: { enabled: true },
    }),
  ],
}
\`\`\`

## User & Session Additional Fields

Add custom fields that Better Auth tracks:

\`\`\`typescript
betterAuthOptions: {
  user: {
    additionalFields: {
      bio: {
        type: 'string',
        required: false,
        input: true, // Allow setting on signup
      },
    },
  },
  session: {
    additionalFields: {
      deviceId: {
        type: 'string',
        required: false,
      },
    },
  },
}
\`\`\`

## Rate Limiting

\`\`\`typescript
betterAuthOptions: {
  rateLimit: {
    enabled: true,
    storage: 'database', // Uses Payload DB
    max: 100,
    window: 60, // seconds
  },
}
\`\`\`
```

---

## File: `configuration/collection-overrides.mdx`

```mdx
---
title: Collection Overrides
description: Customizing auto-generated collections
---

# Collection Overrides

Modify the collections generated by payload-auth without breaking functionality.

## Basic Override Pattern

\`\`\`typescript
betterAuthPlugin({
  users: {
    collectionOverrides: ({ collection }) => {
      return {
        ...collection,
        // Your modifications
      }
    },
  },
})
\`\`\`

## Adding Fields

\`\`\`typescript
users: {
  collectionOverrides: ({ collection }) => ({
    ...collection,
    fields: [
      ...collection.fields,
      {
        name: 'bio',
        type: 'textarea',
      },
      {
        name: 'dateOfBirth',
        type: 'date',
      },
      {
        name: 'preferences',
        type: 'group',
        fields: [
          { name: 'theme', type: 'select', options: ['light', 'dark'] },
          { name: 'newsletter', type: 'checkbox' },
        ],
      },
    ],
  }),
}
\`\`\`

## Modifying Existing Fields

\`\`\`typescript
users: {
  collectionOverrides: ({ collection }) => ({
    ...collection,
    fields: collection.fields.map(field => {
      // Make name required
      if (field.name === 'name') {
        return { ...field, required: true }
      }
      // Add validation to email
      if (field.name === 'email') {
        return {
          ...field,
          validate: (value) => {
            if (!value?.endsWith('@company.com')) {
              return 'Must use company email'
            }
            return true
          },
        }
      }
      return field
    }),
  }),
}
\`\`\`

## Adding Hooks

\`\`\`typescript
users: {
  collectionOverrides: ({ collection }) => ({
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        async ({ doc, operation }) => {
          if (operation === 'create') {
            // Send welcome email
          }
          return doc
        },
      ],
    },
  }),
}
\`\`\`

## Adding Endpoints

\`\`\`typescript
users: {
  collectionOverrides: ({ collection }) => ({
    ...collection,
    endpoints: [
      ...(collection.endpoints ?? []),
      {
        path: '/me/preferences',
        method: 'patch',
        handler: async (req) => {
          // Update user preferences
        },
      },
    ],
  }),
}
\`\`\`

## Modifying Access

\`\`\`typescript
sessions: {
  collectionOverrides: ({ collection }) => ({
    ...collection,
    access: {
      ...collection.access,
      read: ({ req }) => {
        // Custom read access
        if (!req.user) return false
        return {
          user: { equals: req.user.id },
        }
      },
    },
  }),
}
\`\`\`

## Plugin Collection Overrides

Override collections from Better Auth plugins:

\`\`\`typescript
betterAuthPlugin({
  pluginCollectionOverrides: {
    organizations: ({ collection }) => ({
      ...collection,
      fields: [
        ...collection.fields,
        {
          name: 'industry',
          type: 'select',
          options: ['tech', 'finance', 'healthcare'],
        },
      ],
    }),
    passkeys: ({ collection }) => ({
      ...collection,
      admin: {
        ...collection.admin,
        hidden: true, // Hide passkeys from admin
      },
    }),
  },
})
\`\`\`

## Important Considerations

<Callout type="warning">
Don't remove fields that payload-auth depends on. The plugin validates that all required fields exist.
</Callout>

Required fields vary by collection:
- **users**: email, emailVerified, role
- **sessions**: token, user, expiresAt
- **accounts**: accountId, providerId, user
- **verifications**: identifier, value, expiresAt
```
