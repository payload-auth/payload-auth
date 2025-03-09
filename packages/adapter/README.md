> [!CAUTION]
> This adapter is currently in beta.
> If you encounter any issues, please report them in the [Issues](https://github.com/forrestdevs/payload-better-auth/issues) section.

# Payload CMS Database Adapter for BetterAuth

Introducing a database adapter designed for [Payload CMS](https://www.payloadcms.com/) that enables seamless integration with [BetterAuth](https://www.better-auth.com/).


## Important Usage Notes
> [!NOTE]
> If you are using the `@payload-better-auth/plugin`, you do not need to worry about these steps. The plugin handles the adapter setup internally. However, if you are implementing the Payload authentication integration manually, follow these instructions.

### Using the Adapter Standalone

If you decide to use `@payload-better-auth/adapter` independently and implement the Payload CMS integration manually, there are several important considerations:

#### 1. Field Mapping Requirements

You must map BetterAuth's field names to Payload's collection field names:

```javascript
// Example mapping configuration
const betterAuthOptions = {
  session: {
    modelName: 'sessions',
    fields: {
      userId: 'user', // Maps BetterAuth's 'userId' to Payload's 'user' relationship field
    },
  },
  // Other collections...
}
```

#### 2. Collection Name Conventions

Payload typically uses plural collection slugs (e.g., 'users', 'sessions'), while BetterAuth may expect different naming conventions. Make sure to specify the correct modelName:

```javascript
const betterAuthOptions = {
  user: {
    modelName: 'users', // Maps to Payload's 'users' collection
  },
  session: {
    modelName: 'sessions', // Maps to Payload's 'sessions' collection
  },
}
```

## Installation

```bash
npm install @payload-better-auth/adapter
```

## Usage

### 1. Initiate the Payload Database Adapter

> [!NOTE]
> Because the `payloadAdapter` is most commonly used with the `@payload-better-auth/plugin`, we need to wrap the Better Auth definition in a function that takes `payload` as a prop and returns the `auth` instance.


Head over to your Better Auth server instance, and under `database`, add the `payloadAdapter` function.

```ts
import type { BasePayload } from 'payload'
import { betterAuth as betterAuthBase } from "better-auth";
import { payloadAdapter } from "@payload-better-auth/adapter";

export function betterAuth(payload: BasePayload) {
  return betterAuthBase({
    database: payloadAdapter(payload),
    plugins: [],
    //... other options
  })
};


```