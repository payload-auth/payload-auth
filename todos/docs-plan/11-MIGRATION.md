# Migration Documentation

## Files Overview

This covers the `/migration/` directory with upgrade and migration guides.

---

## File: `migration/from-payload-auth.mdx`

```mdx
---
title: Migrate from Default Payload Auth
description: Guide to migrating from Payload's built-in authentication
---

# Migrate from Default Payload Auth

This guide walks through migrating an existing Payload project from the default authentication system to payload-auth.

## Overview

The migration process:

1. Install payload-auth
2. Update Payload configuration
3. Migrate user data (if needed)
4. Update client code
5. Test authentication flows

## Step 1: Install payload-auth

\`\`\`bash
pnpm add payload-auth better-auth
\`\`\`

## Step 2: Update Payload Configuration

### Before

\`\`\`typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        { name: 'role', type: 'select', options: ['user', 'admin'] },
      ],
    },
  ],
})
\`\`\`

### After

\`\`\`typescript
// payload.config.ts
import { betterAuthPlugin } from 'payload-auth/better-auth'

export default buildConfig({
  collections: [
    // Remove your users collection - payload-auth handles it
    // Keep other collections
  ],
  plugins: [
    betterAuthPlugin({
      // Keep Payload's auth working (recommended for migration)
      disableDefaultPayloadAuth: false,
      
      users: {
        roles: ['user', 'admin'],
        adminRoles: ['admin'],
        defaultRole: 'user',
        // Preserve any custom fields
        collectionOverrides: ({ collection }) => ({
          ...collection,
          fields: [
            ...collection.fields,
            // Add your custom fields here
          ],
        }),
      },
      
      betterAuthOptions: {
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        emailAndPassword: { enabled: true },
      },
    }),
  ],
})
\`\`\`

## Step 3: Create Auth API Route

\`\`\`typescript
// app/api/auth/[...all]/route.ts
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'

const handler = async (request: Request) => {
  const { betterAuth } = await getPayloadAuth(config)
  return betterAuth.handler(request)
}

export { handler as GET, handler as POST }
\`\`\`

## Step 4: Run Migrations

payload-auth creates new collections for sessions, accounts, and verifications:

\`\`\`bash
pnpm payload migrate:create
pnpm payload migrate
\`\`\`

## Step 5: Migrate User Data

Existing users need account records for Better Auth:

\`\`\`typescript
// scripts/migrate-users.ts
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'

async function migrateUsers() {
  const { payload, betterAuth } = await getPayloadAuth(config)
  
  const users = await payload.find({
    collection: 'users',
    limit: 1000,
    where: {
      // Find users without accounts
    },
  })
  
  for (const user of users.docs) {
    // Check if account exists
    const existingAccount = await payload.find({
      collection: 'accounts',
      where: {
        user: { equals: user.id },
        providerId: { equals: 'credential' },
      },
    })
    
    if (existingAccount.totalDocs === 0) {
      // Create credential account
      await payload.create({
        collection: 'accounts',
        data: {
          user: user.id,
          providerId: 'credential',
          accountId: user.email,
          // Password is already hashed in user document
        },
      })
      console.log(\`Created account for \${user.email}\`)
    }
  }
}

migrateUsers()
\`\`\`

## Step 6: Update Client Code

### Before (Payload SDK)

\`\`\`typescript
// Using Payload's auth
const user = await fetch('/api/users/me').then(r => r.json())
\`\`\`

### After (Better Auth Client)

\`\`\`typescript
import { authClient } from '@/lib/auth'

// Get session
const { data: session } = authClient.useSession()
const user = session?.user
\`\`\`

## Step 7: Update Protected Routes

### Before

\`\`\`typescript
// Checking Payload auth
if (!req.user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
\`\`\`

### After

\`\`\`typescript
// Using Better Auth
const session = await betterAuth.api.getSession({
  headers: request.headers,
})

if (!session) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
\`\`\`

## Hybrid Mode

During migration, you can run both auth systems:

\`\`\`typescript
betterAuthPlugin({
  disableDefaultPayloadAuth: false, // Keep Payload auth working
})
\`\`\`

This allows:
- Admin panel continues using Payload auth
- Frontend uses Better Auth
- Gradual migration of features

## Full Migration

Once ready, switch to Better Auth for everything:

\`\`\`typescript
betterAuthPlugin({
  disableDefaultPayloadAuth: true,
})
\`\`\`

## Rollback Plan

If issues arise:

1. Remove the plugin from config
2. Restore your original users collection
3. Users can still log in with their original credentials

## Common Issues

### Passwords Not Working

If using custom password hashing, configure Better Auth:

\`\`\`typescript
emailAndPassword: {
  password: {
    hash: async (password) => yourHashFunction(password),
    verify: async ({ hash, password }) => yourVerifyFunction(hash, password),
  },
}
\`\`\`

### Missing User Fields

Ensure custom fields are preserved in collection overrides.

### Session Conflicts

Clear existing session cookies before testing:

\`\`\`typescript
// Clear all auth cookies
document.cookie.split(';').forEach(c => {
  document.cookie = c.replace(/^ +/, '')
    .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
})
\`\`\`
```

---

## File: `migration/version-upgrades.mdx`

```mdx
---
title: Version Upgrades
description: Guide for upgrading between payload-auth versions
---

# Version Upgrades

## Upgrade Process

1. Check the changelog for breaking changes
2. Update dependencies
3. Run migrations if schema changed
4. Update code for API changes
5. Test thoroughly

## Checking Current Version

\`\`\`bash
pnpm list payload-auth
\`\`\`

## Upgrading

\`\`\`bash
pnpm update payload-auth
\`\`\`

## Version-Specific Guides

### 1.x to 2.x (Future)

*Placeholder for future major version upgrade guide*

### 1.7.x to 1.8.x

No breaking changes. New features:

- Added `organizationRole` collection support
- Improved type inference for sessions
- Better debug logging

### 1.6.x to 1.7.x

No breaking changes. New features:

- Added SCIM plugin support
- Added device authorization plugin
- Improved passkey UI in admin

## Checking for Breaking Changes

Always review the [CHANGELOG.md](https://github.com/payload-auth/payload-auth/blob/main/CHANGELOG.md) before upgrading.

## Database Migrations

After upgrading, check if new migrations are needed:

\`\`\`bash
pnpm payload migrate:status
pnpm payload migrate:create
pnpm payload migrate
\`\`\`

## Rollback

If issues arise after upgrade:

\`\`\`bash
# Install specific version
pnpm add payload-auth@1.7.0

# Rollback migration if needed
pnpm payload migrate:rollback
\`\`\`

## Getting Help

- [GitHub Issues](https://github.com/payload-auth/payload-auth/issues)
- [Discord Community](https://discord.gg/payload)
- [Documentation](https://payloadauth.com/docs)
```
