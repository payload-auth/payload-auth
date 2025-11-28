# Payload Auth Plugin

A powerful authentication plugin for Payload CMS powered by [Better Auth](https://better-auth.com/).

## Installation

```bash
pnpm add payload-auth better-auth
```

## Usage

### 1. Configure the Plugin

Add the `betterAuthPlugin` to your Payload configuration.

```typescript
import { buildConfig } from "payload/config";
import { betterAuthPlugin } from "payload-auth/better-auth";

export default buildConfig({
  // ...
  plugins: [
    betterAuthPlugin({
      // Optional: Disable default Payload auth if you want to use Better Auth exclusively
      disableDefaultPayloadAuth: true, 
      
      // Better Auth Configuration
      betterAuthOptions: {
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        emailAndPassword: {
          enabled: true,
        },
        // Add other Better Auth options here
      },
    }),
  ],
});
```

### 2. Environment Variables

Ensure you have the necessary environment variables set:

```env
BETTER_AUTH_SECRET=your-secret-key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

## Features

- **Seamless Integration**: Works directly with Payload CMS collections.
- **Flexible Auth**: Supports Email/Password, Social Providers, Passkeys, and more.
- **Role Management**: Map Better Auth roles to Payload CMS access control.
