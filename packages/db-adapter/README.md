# Payload CMS Database Adapter for BetterAuth

Introducing a database adapter designed for [Payload CMS](https://www.payloadcms.com/) that enables seamless integration with [BetterAuth](https://www.better-auth.com/).

> [!CAUTION]
> This adapter is currently in beta.
> If you encounter any issues, please report them in the [Issues](https://github.com/forrestdevs/payload-better-auth/issues) section.

## Important Usage Notes
> [!NOTE]
> If you are using the `@payload-auth/better-auth-plugin`, you do not need to worry about these steps. The plugin handles the adapter setup internally. However, if you are implementing the Payload authentication integration manually, follow these instructions.

## Installation

```bash
npm install @payload-auth/better-auth-db-adapter
```

## Usage

### 1. Initiate the Payload Database Adapter

> [!NOTE]
> Because the `payloadAdapter` is most commonly used with the `@payload-auth/better-auth-plugin`, we need to wrap the Better Auth definition in a function that takes `payload` as a prop and returns the `auth` instance.

Head over to your Better Auth server instance, and under `database`, add the `payloadAdapter` function.

```ts
import type { BasePayload } from 'payload'
import { betterAuth as betterAuthBase } from "better-auth";
import { payloadAdapter } from "@payload-auth/better-auth-db-adapter";

export function betterAuth(payload: BasePayload) {
  return betterAuthBase({
    database: payloadAdapter(payload),
    plugins: [],
    //... other options
  })
};
```

### 2. Enable Debug Logging

You can enable debug logging to help troubleshoot database operations by passing the `enable_debug_logs` option to the adapter. This will log all database calls with their inputs and outputs to the console.

```ts
import type { BasePayload } from 'payload'
import { betterAuth as betterAuthBase } from "better-auth";
import { payloadAdapter } from "@payload-auth/better-auth-db-adapter";

export function betterAuth(payload: BasePayload) {
  return betterAuthBase({
    database: payloadAdapter(payload, { enable_debug_logs: true }),
    plugins: [],
    //... other options
  })
};
```

### Important considerations

If you decide to use `@payload-auth/better-auth-db-adapter` independently and implement the Payload CMS integration manually, there are several important considerations:

#### 1. Field Mapping Requirements

You must map BetterAuth's field names to Payload's collection field names:

```ts
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

```ts
const betterAuthOptions = {
  user: {
    modelName: 'users', // Maps to Payload's 'users' collection
  },
  session: {
    modelName: 'sessions', // Maps to Payload's 'sessions' collection
  },
}
```

#### 3. Schema Generation Utility

The adapter provides a schema generation utility that can automatically create Payload collection configurations based on your BetterAuth options:

```ts
import { generateSchema } from "@payload-auth/better-auth-db-adapter";
import { betterAuthOptions } from "./your-better-auth-config";

// Generate collection configs
const collections = generateSchema(betterAuthOptions, {
  output_dir: "./src/collections/generated",
});

// Use in your Payload config
export default buildConfig({
  collections: [
    ...collections,
    // Your other collections
  ],
  // other Payload config options
});
```

> [!IMPORTANT]
> The schema generation function is provided as a convenience to help you get started quickly. It is not yet perfect and should be considered a starting point. Always review and adjust the generated collection configurations to ensure they meet your specific requirements and security needs before using them in production.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.