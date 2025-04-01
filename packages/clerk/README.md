# Payload CMS Clerk Authentication Plugin

A plugin for [Payload CMS](https://payloadcms.com) that integrates with [Clerk](https://clerk.com) for authentication.

## Features

- **Automatic User Sync:** Keeps your Payload user collection in sync with Clerk using webhooks (`user.created`, `user.updated`, `user.deleted`). Clerk is treated as the source of truth.
- **Secure Webhook Validation:** Verifies incoming webhooks using Svix signing secrets. **(Mandatory for Production)**
- **Clerk User Fields:** Automatically adds essential Clerk-related fields to your specified user collection (e.g., `clerkId`, `firstName`, `lastName`, `emailVerified`, `imageUrl`, `clerkPublicMetadata`, `lastSyncedAt`).
- **Authentication Strategy:** Provides a ready-to-use `clerk` authentication strategy for Payload (`clerkAuthStrategy`).
- **Admin UI Sync:** Includes a "Sync Users" button in the admin panel for manually fetching all users from Clerk.
- **Customizable Mapping:** Allows you to define how Clerk user data maps to your Payload collection fields, with sensible defaults provided automatically.
- **Flexible Configuration:** Offers options to configure the user collection slug, admin roles, webhook path, and more.

## Installation

```bash
npm install payload-auth
# or
yarn add payload-auth
# or
pnpm add payload-auth
```

## Getting Started

### Required Environment Variables

The plugin requires the following environment variables:

| Variable | Description | Required For |
| -------- | ----------- | ------------ |
| `CLERK_SECRET_KEY` | Your Clerk Backend API key from the Clerk dashboard | Fetching users from Clerk, required for the Admin UI sync button to work |
| `CLERK_WEBHOOK_SECRET` or `SVIX_WEBHOOK_SECRET` | Webhook signing secret from the Clerk dashboard's webhooks section | Verifying authenticity of incoming webhooks (mandatory for production security) |

Add these to your `.env` file:

```
CLERK_SECRET_KEY=sk_test_••••••••••••••••••••••••••••••••
CLERK_WEBHOOK_SECRET=whsec_••••••••••••••••••••••••••••••
```

The plugin automatically looks for these environment variables, so you don't need to explicitly set the `webhook.svixSecret` in your configuration if the environment variables are properly set.

### Basic Setup

1. Install the `payload-auth` package
2. Import the `clerkPlugin` from `payload-auth/clerk`
3. Add the plugin to your Payload config
4. Set up required environment variables
5. Configure the webhook endpoint in your Clerk dashboard

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { clerkPlugin } from 'payload-auth/clerk'

export default buildConfig({
  // ... other Payload config
  plugins: [
    clerkPlugin()
  ],
})
```

## Setting Up Webhooks

**Setting up webhooks in your Clerk dashboard is mandatory for the automatic synchronization feature to work.**

1. In your Clerk dashboard, go to **Webhooks**
2. Add a new endpoint. The URL structure is typically: `https://<YOUR_APP_URL>/<PAYLOAD_API_PATH>/<USER_SLUG>/<WEBHOOK_PATH>`
    *   `<YOUR_APP_URL>`: Your application's public URL.
    *   `<PAYLOAD_API_PATH>`: Your Payload API base path (default: `api`).
    *   `<USER_SLUG>`: Your user collection slug (default: `users`, configured via `users.slug`).
    *   `<WEBHOOK_PATH>`: The webhook path (default: `clerk-webhook`, configured via `webhook.path`).
    *   **Default Example:** `https://example.com/api/users/clerk-webhook`
    *   **Development Tip:** For testing webhooks locally, tools like [ngrok](https://ngrok.com/) are invaluable for exposing your local server to the internet.
3. Select the events you want to receive (at minimum `user.created`, `user.updated`, and `user.deleted`)
4. Copy the **Signing Secret**. **Providing this secret is mandatory for secure webhook validation in production.**
    *   Set the environment variable `CLERK_WEBHOOK_SECRET` or `SVIX_WEBHOOK_SECRET` on your server.
    *   The plugin automatically detects these environment variables without any additional configuration.
    *   Alternatively, pass it directly via the `webhook.svixSecret` option in the plugin config.
    *   If no secret is found, validation will be skipped (insecure and not advised for production).

## Configuration Options

| Option | Type | Description | Default |
| ------ | ---- | ----------- | ------- |
| `disabled` | `boolean` | Disable the plugin entirely. | `false` |
| `enableDebugLogs` | `boolean` | Enable verbose logging for debugging purposes. | `false` |
| `users.slug` | `string` | Collection slug for users. Must match an existing collection or will create a new one. | `"users"` |
| `users.hidden` | `boolean` | Hide the user collection in the admin UI. | `false` |
| `users.adminRoles` | `string[]` | Array of role slugs that have admin permissions for Clerk-related actions (e.g., reading all users, deleting users). | `["admin"]` |
| `users.collectionOverrides` | `(args: { collection: CollectionConfig }) => CollectionConfig` | Function to deeply customize the generated user collection config before it's added to Payload. | `undefined` |
| `users.clerkToPayloadMapping` | `(clerkUser: UserJSON) => Omit<User, 'id'>` | Function to map Clerk user data (`UserJSON` from `@clerk/backend`) to Payload fields. See "Custom Data Mapping". | `defaultClerkMapping` |
| `webhook.svixSecret` | `string` | Svix signing secret for webhook validation. **Mandatory for production security.** The plugin automatically checks for `CLERK_WEBHOOK_SECRET` or `SVIX_WEBHOOK_SECRET` env vars, so this is only needed if you want to override those values. | `undefined` |
| `webhook.path` | `string` | Custom **relative** path segment for the webhook endpoint (appended to `/api/<userCollectionSlug>/`). | `"clerk-webhook"` |

## Custom Data Mapping (`users.clerkToPayloadMapping`)

The plugin needs to know how to translate data from a Clerk user into fields within your Payload user collection. By default, it uses a built-in mapping (`defaultClerkMapping`) that handles common fields like email, name, profile picture, and more.

If you provide a custom `clerkToPayloadMapping` function, it **completely replaces** the default mapping. This means you must map ALL fields you want to sync from Clerk to Payload, not just additional fields. The only exception is `clerkId`, which is automatically handled by the plugin and cannot be overridden.

### Default Mapping

The default mapping function maps these Clerk fields to Payload:
* `email` (primary email address) // set by the plugin if not set
* `emailVerified` (verification status of primary email)
* `firstName` 
* `lastName`
* `imageUrl`
* `clerkPublicMetadata` (stores Clerk's `public_metadata`)
* `lastSyncedAt` (current timestamp)

### Custom Mapping Example

If you want to customize the mapping, you'll need to re-implement all the fields you want to keep from the default mapping, plus any custom fields you want to add:

```typescript
import { clerkPlugin } from 'payload-auth/clerk'
import type { UserJSON } from '@clerk/backend'

const myCustomMapping = (clerkUser: UserJSON) => {
  // You must include ALL fields you want to sync
  // Note: clerkId is automatically handled by the plugin
  return {
    // Standard fields you want to keep (similar to default mapping)
    email: '...', // This could be skipped as it's set by the plugin
    emailVerified: clerkUser.email_addresses?.find(e => e.id === clerkUser.primary_email_address_id)?.verification?.status === 'verified',
    firstName: clerkUser.first_name,
    lastName: clerkUser.last_name,
    imageUrl: clerkUser.image_url,
    lastSyncedAt: new Date(),
    
    // Your custom fields
    role: clerkUser.public_metadata?.role || 'user',
    customUserField: clerkUser.public_metadata?.someValue || 'default',
    // ... any other fields you want to sync
  }
}

clerkPlugin({
  users: {
    clerkToPayloadMapping: myCustomMapping,
  }
})
```

*Note:* This requires your Payload backend to have the necessary Clerk Backend API key (`CLERK_SECRET_KEY` environment variable) configured, as it uses `@clerk/backend`.

## Admin UI Sync

The plugin adds a **"Sync Users"** button to the user collection list view in the Payload admin UI.

Clicking this button triggers a full synchronization. It fetches all users from your Clerk instance (using the Clerk Backend API) and creates or updates the corresponding user documents in your Payload database based on your mapping configuration. This is useful for initial setup or ensuring data consistency.

**Clerk is treated as the source of truth** during this process, meaning Payload user data will be overwritten to match the data fetched from Clerk.

*Note:* **The sync button functionality** requires the `CLERK_SECRET_KEY` environment variable to be configured on your Payload backend, as it needs to make API calls to Clerk to fetch user data. Incoming webhooks from Clerk will still be processed without this key.

## License

MIT