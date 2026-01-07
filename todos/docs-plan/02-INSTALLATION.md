# Installation Documentation

## File: `installation.mdx`

### Content Outline

```mdx
---
title: Installation
description: Install and configure payload-auth in your Payload CMS project
---

# Installation

This guide walks you through installing payload-auth in your Payload CMS project.

## Prerequisites

- Node.js 18+ or Bun
- Payload CMS 3.x
- A supported database (PostgreSQL, MongoDB, or SQLite)

## Step 1: Install the Package

<Tabs items={['pnpm', 'npm', 'yarn', 'bun']}>
  <Tab value="pnpm">
    \`\`\`bash
    pnpm add payload-auth better-auth
    \`\`\`
  </Tab>
  <Tab value="npm">
    \`\`\`bash
    npm install payload-auth better-auth
    \`\`\`
  </Tab>
  <Tab value="yarn">
    \`\`\`bash
    yarn add payload-auth better-auth
    \`\`\`
  </Tab>
  <Tab value="bun">
    \`\`\`bash
    bun add payload-auth better-auth
    \`\`\`
  </Tab>
</Tabs>

### Optional: Install Plugin Packages

If you plan to use specific Better Auth plugins:

\`\`\`bash
# Passkey support
pnpm add @better-auth/passkey

# SSO/SAML support
pnpm add @better-auth/sso

# Stripe integration
pnpm add @better-auth/stripe
\`\`\`

## Step 2: Add the Plugin to Payload Config

\`\`\`typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { betterAuthPlugin } from 'payload-auth/better-auth'

export default buildConfig({
  admin: {
    user: 'users', // Must match your users collection slug
  },
  collections: [
    // Your other collections...
  ],
  plugins: [
    betterAuthPlugin({
      // Plugin configuration
      betterAuthOptions: {
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        emailAndPassword: {
          enabled: true,
        },
      },
    }),
  ],
  // ... rest of config
})
\`\`\`

## Step 3: Create the Auth API Route

Create an API route to handle Better Auth requests:

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

## Step 4: Set Up Environment Variables

Create or update your `.env` file:

\`\`\`env
# Required
PAYLOAD_SECRET=your-payload-secret-min-32-chars
DATABASE_URI=your-database-connection-string
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Optional: For social providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

## Step 5: Run Migrations (if needed)

For SQL databases, generate and run migrations:

\`\`\`bash
pnpm payload migrate:create
pnpm payload migrate
\`\`\`

## Verify Installation

Start your development server and check:

1. **Admin Panel** - Navigate to `/admin` and verify login works
2. **Collections** - Check that `users`, `sessions`, `accounts`, and `verifications` collections exist
3. **API** - Test the auth endpoint at `/api/auth/ok`

## Minimal Example

Here's a complete minimal setup:

\`\`\`typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { betterAuthPlugin } from 'payload-auth/better-auth'
import path from 'path'

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(__dirname),
    },
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  secret: process.env.PAYLOAD_SECRET!,
  plugins: [
    betterAuthPlugin({
      betterAuthOptions: {
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        emailAndPassword: { enabled: true },
      },
    }),
  ],
})
\`\`\`

## Next Steps

<Cards>
  <Card title="Basic Usage" href="/docs/basic-usage">
    Learn to implement authentication in your app
  </Card>
  <Card title="Configuration" href="/docs/configuration/plugin-options">
    Explore all configuration options
  </Card>
  <Card title="Social Providers" href="/docs/authentication/social-providers">
    Add Google, GitHub, and more
  </Card>
</Cards>

## Troubleshooting

### Common Issues

<Accordions>
  <Accordion title="Collection 'users' already exists">
    payload-auth will merge with your existing users collection. Ensure the 
    slug matches what you specify in `admin.user`.
  </Accordion>
  <Accordion title="Missing importMap">
    Add `importMap.baseDir` to your admin config to resolve component paths.
  </Accordion>
  <Accordion title="Database errors on first run">
    Run `pnpm payload migrate:create && pnpm payload migrate` to create tables.
  </Accordion>
</Accordions>
```
