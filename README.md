# Payload Better Auth

This monorepo contains packages that integrate [Payload CMS](https://payloadcms.com) with [Better Auth](https://github.com/better-auth/better-auth) to provide enhanced authentication capabilities for your applications.

## Packages

### [@payload-better-auth/plugin](./packages/payload-plugin)

A Payload CMS plugin that integrates with Better Auth to provide enhanced authentication capabilities for your Payload applications.

**Features:**
- Seamless integration with Better Auth for both frontend and admin
- Support for multiple authentication providers
- Compatible with Payload CMS v3
- Type-safe authentication flows
- Server and client components for Next.js applications

### [@payload-better-auth/adapter](./packages/db-adapter)

A database adapter for Better Auth that works with Payload CMS's database connection.

**Features:**
- Compatible with Payload's database connection
- Works with relational databases (PostgreSQL, SQLite)
- Type-safe database operations
- Efficient query handling
