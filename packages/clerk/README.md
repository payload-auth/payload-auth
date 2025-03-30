# Payload CMS Clerk Authentication Plugin

A plugin for [Payload CMS](https://payloadcms.com) that integrates with [Clerk](https://clerk.com) for authentication.

## Features

- Syncs users between Clerk and Payload CMS via webhooks
- Validates webhooks using Svix for security
- Maintains "soft copies" of Clerk user data in your Payload database
- Custom data mapping from Clerk to your Payload collections
- Can be used alongside Payload's existing auth or as a standalone solution

## Installation

```bash
npm install @payload-auth/clerk
# or
yarn add @payload-auth/clerk
# or
pnpm add @payload-auth/clerk
```

## Usage

The plugin provides a `clerkPlugin` function that integrates Clerk with your Payload app, and a `withClerkCollection` function to enhance user collections with Clerk fields.

The plugin will automatically set up a webhook endpoint to receive events from Clerk and sync user data with your Payload database.

## Setting Up Webhooks

1. In your Clerk dashboard, go to **Webhooks**
2. Add a new endpoint with the URL: `https://your-payload-app.com/api/webhooks/clerk` (or your custom path)
3. Select the events you want to receive (at minimum `user.created`, `user.updated`, and `user.deleted`)
4. Copy the signing secret and add it to your environment variables as `CLERK_WEBHOOK_SECRET`

## Configuration Options

| Option | Type | Description | Default |
| ------ | ---- | ----------- | ------- |
| `disabled` | `boolean` | Disable the plugin | `false` |
| `enableDebugLogs` | `boolean` | Enable debug logs | `false` |
| `users.slug` | `string` | Collection slug for users | `"users"` |
| `users.hidden` | `boolean` | Hide collection in admin UI | `false` |
| `users.adminRoles` | `string[]` | Roles that have admin permissions | `["admin"]` |
| `users.collectionOverrides` | `function` | Function to override collection config | `undefined` |
| `users.clerkMapping` | `function` | Function to map Clerk user data to Payload fields | `defaultClerkMapping` |
| `webhook.svixSecret` | `string` | Svix signing secret | `undefined` |
| `webhook.path` | `string` | Custom webhook endpoint path | `"/api/webhooks/clerk"` |

## Custom Data Mapping

The plugin allows complete control over how Clerk user data is mapped to your Payload fields using the `clerkMapping` option. This function receives Clerk user data and should return an object with the fields to save in Payload.

The mapping function receives a `ClerkUser` object with data from Clerk's webhook and returns an object with fields that match your collection schema.

## License

MIT 