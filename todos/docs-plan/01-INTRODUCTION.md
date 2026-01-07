# Introduction Documentation

## File: `introduction.mdx`

### Content Outline

```mdx
---
title: Introduction
description: The most powerful authentication solution for Payload CMS
---

# Introduction

payload-auth is a Payload CMS plugin that integrates Better Auth, providing a comprehensive authentication solution with support for social providers, two-factor authentication, organizations, passkeys, and more.

## Why payload-auth?

### The Problem

Payload CMS provides basic authentication out of the box, but modern applications often need:
- Social login (Google, GitHub, etc.)
- Two-factor authentication
- Organization/team management
- API key authentication
- Advanced session management
- Passkey/WebAuthn support

### The Solution

payload-auth bridges Payload CMS with Better Auth, giving you:
- **30+ authentication methods** - Email, social, magic link, passkeys
- **Full Payload integration** - Works seamlessly with Payload's admin UI
- **Auto-generated collections** - Users, sessions, accounts created automatically
- **Type-safe** - Full TypeScript support with inferred types
- **Flexible** - Use Better Auth for admin, frontend, or both

## Key Features

<Cards>
  <Card title="Email & Password" icon="mail">
    Traditional email/password authentication with email verification
  </Card>
  <Card title="Social Providers" icon="users">
    Google, GitHub, Discord, and 15+ OAuth providers
  </Card>
  <Card title="Two-Factor Auth" icon="shield">
    TOTP, SMS, and email-based 2FA
  </Card>
  <Card title="Passkeys" icon="key">
    WebAuthn/FIDO2 passwordless authentication
  </Card>
  <Card title="Organizations" icon="building">
    Multi-tenant organization and team management
  </Card>
  <Card title="API Keys" icon="code">
    Secure API key generation and management
  </Card>
</Cards>

## How It Works

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Your App      │────▶│   payload-auth    │────▶│   Payload CMS   │
│                 │     │                   │     │                 │
│  - Frontend     │     │  - Better Auth    │     │  - Database     │
│  - Admin UI     │     │  - Adapter        │     │  - Collections  │
│  - API          │     │  - Plugin         │     │  - Admin        │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

## Quick Example

\`\`\`typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { betterAuthPlugin } from 'payload-auth/better-auth'

export default buildConfig({
  // ... your config
  plugins: [
    betterAuthPlugin({
      betterAuthOptions: {
        emailAndPassword: { enabled: true },
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      },
    }),
  ],
})
\`\`\`

## Comparison

| Feature | Payload Default | payload-auth |
|---------|----------------|--------------|
| Email/Password | ✅ | ✅ |
| Social Login | ❌ | ✅ (15+ providers) |
| Magic Link | ❌ | ✅ |
| Passkeys | ❌ | ✅ |
| Two-Factor | ❌ | ✅ |
| Organizations | ❌ | ✅ |
| API Keys | ❌ | ✅ |
| Session Management | Basic | Advanced |
| Admin Customization | Limited | Full |

## Next Steps

<Cards>
  <Card title="Installation" href="/docs/installation">
    Get started with payload-auth in your project
  </Card>
  <Card title="Basic Usage" href="/docs/basic-usage">
    Learn the fundamentals with a quick start guide
  </Card>
  <Card title="Configuration" href="/docs/configuration/plugin-options">
    Explore all configuration options
  </Card>
</Cards>
```
