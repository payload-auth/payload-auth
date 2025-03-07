> [!CAUTION]
> This adapter is currently in beta.
> If you encounter any issues, please report them in the [Issues](https://github.com/forrestdevs/payload-better-auth/issues) section.

# Payload CMS Database Adapter for BetterAuth

Introducing a database adapter designed for [Payload CMS](https://www.payloadcms.com/) that enables seamless integration with [BetterAuth](https://www.better-auth.com/).


> [!WARNING]
> Please note that Convex DB is not inherently designed for this purpose. I have implemented workarounds to facilitate dynamic queries and mutations within Convex, which is typically not supported. Additionally, there are several limitations that may affect the functionality of BetterAuth in certain scenarios. Some plugins may not operate as expected.
>
> Here are the key limitations to consider:
>
> - **Performance Issues**: Due to the inability to perform dynamic queries/mutations, we send a request to Convex Actions, which then calls the mutate/query function. This results in at least two calls, not including subsequent database queries or mutation calls.
> - **Degraded Performance for Pagination Queries**: Convex's support for pagination is limited, which may lead to performance issues when working outside its intended scope.
> - **No Support for Certain Operators**: Operators such as `starts_with`, `ends_with`, or `contains` are not supported. This limitation primarily affects the admin plugin.

## Installation

```bash
npm install convex-better-auth
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

> [!NOTE]
> If you are using the `@payload-better-auth/plugin`, you do not need to worry about these steps. The plugin handles the adapter setup internally. However, if you are implementing the Payload authentication integration manually, follow these instructions.

### 2. Configure Model Names

When integrating with Payload CMS, it's crucial to map Better Auth's model names to your Payload collection slugs. Typically, Payload uses plural collection names (e.g., `users`, `sessions`). Ensure your Better Auth configuration reflects this.


<!-- we need to make note that the payload-better-auth/plugin uses this adapter so if your using the plugin you wont need to worry about this, however if you decide to just use the adapter and implement the payload auth integration manually there will be a few things to make sure to do, the first is mapping the better-auth modelNames and field names to the payload collections. For example any relationship in payload is commonly called by the collection name for example Session collection has a field user which is a relationship to the User collection. Because the better auth schema defines the relationship as a id in the Session Schema it would be userId. so we need to make sure we map this correctly in the better auth options. like so session: {
      modelName: 'sessions',
      fields: {
        userId: 'user',
      },} the other note is the modelName as commonly in payload we name collection slugs plurally like 'users' for User collection and 'sessions' for Session collection. so again we need to make sure were defining this in the better auth options. , please add all the information as other steps and remove any convex info -->