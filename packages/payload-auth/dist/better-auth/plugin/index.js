import { getPayload } from "payload";
import { payloadAdapter } from "payload-auth/better-auth/adapter";
import { getDefaultBetterAuthSchema } from "./helpers/get-better-auth-schema";
import { syncResolvedSchemaWithCollectionMap } from "./helpers/sync-resolved-schema-with-collection-map";
import { applyDisabledDefaultAuthConfig } from "./lib/apply-disabled-default-auth-config";
import { buildCollections } from "./lib/build-collections/index";
import { initBetterAuth } from "./lib/init-better-auth";
import { sanitizeBetterAuthOptions } from "./lib/sanitize-better-auth-options/index";
import { setLoginMethods } from "./lib/set-login-methods";
import { set } from "./utils/set";
export * from "./helpers/index";
export { getPayloadAuth } from "./lib/get-payload-auth";
export { sanitizeBetterAuthOptions } from "./lib/sanitize-better-auth-options/index";
export * from "./types";
function buildBetterAuthData({ payloadConfig, pluginOptions }) {
    pluginOptions = setLoginMethods({
        pluginOptions
    });
    const defaultBetterAuthSchemas = getDefaultBetterAuthSchema(pluginOptions);
    let collectionMap = buildCollections({
        resolvedSchemas: defaultBetterAuthSchemas,
        incomingCollections: payloadConfig.collections ?? [],
        pluginOptions
    });
    const resolvedBetterAuthSchemas = syncResolvedSchemaWithCollectionMap(defaultBetterAuthSchemas, collectionMap);
    // We need to build the collections a second time with the resolved schemas
    // due to hooks, endpoints, useAsTitle, etc should relay on resolvedBetterAuthSchemas to get slugs
    // if they are referencing to other collections then it self.
    collectionMap = buildCollections({
        resolvedSchemas: resolvedBetterAuthSchemas,
        incomingCollections: payloadConfig.collections ?? [],
        pluginOptions
    });
    const sanitizedBetterAuthOptions = sanitizeBetterAuthOptions({
        config: payloadConfig,
        pluginOptions,
        resolvedSchemas: resolvedBetterAuthSchemas
    });
    pluginOptions.betterAuthOptions = sanitizedBetterAuthOptions;
    return {
        pluginOptions,
        collectionMap,
        resolvedBetterAuthSchemas,
        sanitizedBetterAuthOptions
    };
}
export function betterAuthPlugin(pluginOptions) {
    return (config)=>{
        if (pluginOptions.disabled) {
            return config;
        }
        config.custom = {
            ...config.custom,
            hasBetterAuthPlugin: true
        };
        const { collectionMap, resolvedBetterAuthSchemas, sanitizedBetterAuthOptions } = buildBetterAuthData({
            payloadConfig: config,
            pluginOptions
        });
        set(config, 'custom.betterAuth.config', sanitizedBetterAuthOptions);
        // ---------------------- Finalize config -----------------
        if (pluginOptions.disableDefaultPayloadAuth) {
            applyDisabledDefaultAuthConfig({
                config,
                pluginOptions,
                collectionMap,
                resolvedBetterAuthSchemas
            });
        }
        config.collections = config.collections ?? [];
        config.collections = Object.values(collectionMap);
        const incomingOnInit = config.onInit;
        config.onInit = async (payload)=>{
            try {
                // Execute any existing onInit functions first
                if (incomingOnInit) {
                    await incomingOnInit(payload);
                }
                // Initialize and set the betterAuth instance
                const auth = initBetterAuth({
                    payload,
                    idType: payload.db.defaultIDType,
                    options: {
                        ...sanitizedBetterAuthOptions,
                        enableDebugLogs: pluginOptions.debug?.enableDebugLogs ?? false,
                        plugins: [
                            ...sanitizedBetterAuthOptions.plugins ?? []
                        ]
                    }
                });
                // Type-safe extension of payload with betterAuth
                Object.defineProperty(payload, 'betterAuth', {
                    value: auth,
                    writable: false,
                    configurable: false
                });
            } catch (error) {
                console.error('Failed to initialize BetterAuth:', error);
                throw error;
            }
        };
        return config;
    };
}
export function withPayloadAuth({ payloadConfig }) {
    const betterAuthConfig = payloadConfig.custom.betterAuth.config;
    if (!betterAuthConfig) {
        throw new Error('BetterAuth config not found. Not set payloadConfig.custom.betterAuth.config');
    }
    const optionsWithAdapter = {
        ...betterAuthConfig,
        database: payloadAdapter({
            payloadClient: async ()=>await getPayload({
                    config: payloadConfig
                }),
            idType: payloadConfig.db.defaultIDType
        })
    };
    return optionsWithAdapter;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJ2JldHRlci1hdXRoL3R5cGVzJ1xuaW1wb3J0IHsgZ2V0UGF5bG9hZCwgU2FuaXRpemVkQ29uZmlnLCB0eXBlIENvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBwYXlsb2FkQWRhcHRlciB9IGZyb20gJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9hZGFwdGVyJ1xuaW1wb3J0IHsgUGF5bG9hZEFkYXB0ZXJQYXJhbXMgfSBmcm9tICcuLi90eXBlcydcbmltcG9ydCB7IGdldERlZmF1bHRCZXR0ZXJBdXRoU2NoZW1hIH0gZnJvbSAnLi9oZWxwZXJzL2dldC1iZXR0ZXItYXV0aC1zY2hlbWEnXG5pbXBvcnQgeyBzeW5jUmVzb2x2ZWRTY2hlbWFXaXRoQ29sbGVjdGlvbk1hcCB9IGZyb20gJy4vaGVscGVycy9zeW5jLXJlc29sdmVkLXNjaGVtYS13aXRoLWNvbGxlY3Rpb24tbWFwJ1xuaW1wb3J0IHsgYXBwbHlEaXNhYmxlZERlZmF1bHRBdXRoQ29uZmlnIH0gZnJvbSAnLi9saWIvYXBwbHktZGlzYWJsZWQtZGVmYXVsdC1hdXRoLWNvbmZpZydcbmltcG9ydCB7IGJ1aWxkQ29sbGVjdGlvbnMgfSBmcm9tICcuL2xpYi9idWlsZC1jb2xsZWN0aW9ucy9pbmRleCdcbmltcG9ydCB7IGluaXRCZXR0ZXJBdXRoIH0gZnJvbSAnLi9saWIvaW5pdC1iZXR0ZXItYXV0aCdcbmltcG9ydCB7IHNhbml0aXplQmV0dGVyQXV0aE9wdGlvbnMgfSBmcm9tICcuL2xpYi9zYW5pdGl6ZS1iZXR0ZXItYXV0aC1vcHRpb25zL2luZGV4J1xuaW1wb3J0IHsgc2V0TG9naW5NZXRob2RzIH0gZnJvbSAnLi9saWIvc2V0LWxvZ2luLW1ldGhvZHMnXG5pbXBvcnQgdHlwZSB7IEJldHRlckF1dGhQbHVnaW5PcHRpb25zIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IHNldCB9IGZyb20gJy4vdXRpbHMvc2V0J1xuXG5leHBvcnQgKiBmcm9tICcuL2hlbHBlcnMvaW5kZXgnXG5leHBvcnQgeyBnZXRQYXlsb2FkQXV0aCB9IGZyb20gJy4vbGliL2dldC1wYXlsb2FkLWF1dGgnXG5leHBvcnQgeyBzYW5pdGl6ZUJldHRlckF1dGhPcHRpb25zIH0gZnJvbSAnLi9saWIvc2FuaXRpemUtYmV0dGVyLWF1dGgtb3B0aW9ucy9pbmRleCdcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXMnXG5cbmZ1bmN0aW9uIGJ1aWxkQmV0dGVyQXV0aERhdGEoeyBwYXlsb2FkQ29uZmlnLCBwbHVnaW5PcHRpb25zIH06IHsgcGF5bG9hZENvbmZpZzogU2FuaXRpemVkQ29uZmlnOyBwbHVnaW5PcHRpb25zOiBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9KSB7XG4gIHBsdWdpbk9wdGlvbnMgPSBzZXRMb2dpbk1ldGhvZHMoeyBwbHVnaW5PcHRpb25zIH0pXG5cbiAgY29uc3QgZGVmYXVsdEJldHRlckF1dGhTY2hlbWFzID0gZ2V0RGVmYXVsdEJldHRlckF1dGhTY2hlbWEocGx1Z2luT3B0aW9ucylcblxuICBsZXQgY29sbGVjdGlvbk1hcCA9IGJ1aWxkQ29sbGVjdGlvbnMoe1xuICAgIHJlc29sdmVkU2NoZW1hczogZGVmYXVsdEJldHRlckF1dGhTY2hlbWFzLFxuICAgIGluY29taW5nQ29sbGVjdGlvbnM6IHBheWxvYWRDb25maWcuY29sbGVjdGlvbnMgPz8gW10sXG4gICAgcGx1Z2luT3B0aW9uc1xuICB9KVxuXG4gIGNvbnN0IHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXMgPSBzeW5jUmVzb2x2ZWRTY2hlbWFXaXRoQ29sbGVjdGlvbk1hcChkZWZhdWx0QmV0dGVyQXV0aFNjaGVtYXMsIGNvbGxlY3Rpb25NYXApXG5cbiAgLy8gV2UgbmVlZCB0byBidWlsZCB0aGUgY29sbGVjdGlvbnMgYSBzZWNvbmQgdGltZSB3aXRoIHRoZSByZXNvbHZlZCBzY2hlbWFzXG4gIC8vIGR1ZSB0byBob29rcywgZW5kcG9pbnRzLCB1c2VBc1RpdGxlLCBldGMgc2hvdWxkIHJlbGF5IG9uIHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXMgdG8gZ2V0IHNsdWdzXG4gIC8vIGlmIHRoZXkgYXJlIHJlZmVyZW5jaW5nIHRvIG90aGVyIGNvbGxlY3Rpb25zIHRoZW4gaXQgc2VsZi5cbiAgY29sbGVjdGlvbk1hcCA9IGJ1aWxkQ29sbGVjdGlvbnMoe1xuICAgIHJlc29sdmVkU2NoZW1hczogcmVzb2x2ZWRCZXR0ZXJBdXRoU2NoZW1hcyxcbiAgICBpbmNvbWluZ0NvbGxlY3Rpb25zOiBwYXlsb2FkQ29uZmlnLmNvbGxlY3Rpb25zID8/IFtdLFxuICAgIHBsdWdpbk9wdGlvbnNcbiAgfSlcblxuICBjb25zdCBzYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyA9IHNhbml0aXplQmV0dGVyQXV0aE9wdGlvbnMoe1xuICAgIGNvbmZpZzogcGF5bG9hZENvbmZpZyxcbiAgICBwbHVnaW5PcHRpb25zLFxuICAgIHJlc29sdmVkU2NoZW1hczogcmVzb2x2ZWRCZXR0ZXJBdXRoU2NoZW1hc1xuICB9KVxuXG4gIHBsdWdpbk9wdGlvbnMuYmV0dGVyQXV0aE9wdGlvbnMgPSBzYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9uc1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luT3B0aW9ucyxcbiAgICBjb2xsZWN0aW9uTWFwLFxuICAgIHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXMsXG4gICAgc2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnNcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0dGVyQXV0aFBsdWdpbihwbHVnaW5PcHRpb25zOiBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucykge1xuICByZXR1cm4gKGNvbmZpZzogQ29uZmlnKTogQ29uZmlnID0+IHtcbiAgICBpZiAocGx1Z2luT3B0aW9ucy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuIGNvbmZpZ1xuICAgIH1cblxuICAgIGNvbmZpZy5jdXN0b20gPSB7XG4gICAgICAuLi5jb25maWcuY3VzdG9tLFxuICAgICAgaGFzQmV0dGVyQXV0aFBsdWdpbjogdHJ1ZVxuICAgIH1cblxuICAgIGNvbnN0IHsgY29sbGVjdGlvbk1hcCwgcmVzb2x2ZWRCZXR0ZXJBdXRoU2NoZW1hcywgc2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnMgfSA9IGJ1aWxkQmV0dGVyQXV0aERhdGEoe1xuICAgICAgcGF5bG9hZENvbmZpZzogY29uZmlnIGFzIFNhbml0aXplZENvbmZpZyxcbiAgICAgIHBsdWdpbk9wdGlvbnNcbiAgICB9KVxuXG4gICAgc2V0KGNvbmZpZywgJ2N1c3RvbS5iZXR0ZXJBdXRoLmNvbmZpZycsIHNhbml0aXplZEJldHRlckF1dGhPcHRpb25zKVxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGaW5hbGl6ZSBjb25maWcgLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAocGx1Z2luT3B0aW9ucy5kaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoKSB7XG4gICAgICBhcHBseURpc2FibGVkRGVmYXVsdEF1dGhDb25maWcoe1xuICAgICAgICBjb25maWcsXG4gICAgICAgIHBsdWdpbk9wdGlvbnMsXG4gICAgICAgIGNvbGxlY3Rpb25NYXAsXG4gICAgICAgIHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXNcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uZmlnLmNvbGxlY3Rpb25zID0gY29uZmlnLmNvbGxlY3Rpb25zID8/IFtdXG4gICAgY29uZmlnLmNvbGxlY3Rpb25zID0gT2JqZWN0LnZhbHVlcyhjb2xsZWN0aW9uTWFwKVxuXG4gICAgY29uc3QgaW5jb21pbmdPbkluaXQgPSBjb25maWcub25Jbml0XG5cbiAgICBjb25maWcub25Jbml0ID0gYXN5bmMgKHBheWxvYWQpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEV4ZWN1dGUgYW55IGV4aXN0aW5nIG9uSW5pdCBmdW5jdGlvbnMgZmlyc3RcbiAgICAgICAgaWYgKGluY29taW5nT25Jbml0KSB7XG4gICAgICAgICAgYXdhaXQgaW5jb21pbmdPbkluaXQocGF5bG9hZClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCB0aGUgYmV0dGVyQXV0aCBpbnN0YW5jZVxuICAgICAgICBjb25zdCBhdXRoID0gaW5pdEJldHRlckF1dGg8Tm9uTnVsbGFibGU8dHlwZW9mIHNhbml0aXplZEJldHRlckF1dGhPcHRpb25zLnBsdWdpbnM+Pih7XG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBpZFR5cGU6IHBheWxvYWQuZGIuZGVmYXVsdElEVHlwZSxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAuLi5zYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyxcbiAgICAgICAgICAgIGVuYWJsZURlYnVnTG9nczogcGx1Z2luT3B0aW9ucy5kZWJ1Zz8uZW5hYmxlRGVidWdMb2dzID8/IGZhbHNlLFxuICAgICAgICAgICAgcGx1Z2luczogWy4uLihzYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucy5wbHVnaW5zID8/IFtdKV1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gVHlwZS1zYWZlIGV4dGVuc2lvbiBvZiBwYXlsb2FkIHdpdGggYmV0dGVyQXV0aFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGF5bG9hZCwgJ2JldHRlckF1dGgnLCB7XG4gICAgICAgICAgdmFsdWU6IGF1dGgsXG4gICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIEJldHRlckF1dGg6JywgZXJyb3IpXG4gICAgICAgIHRocm93IGVycm9yXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb25maWdcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aFBheWxvYWRBdXRoKHsgcGF5bG9hZENvbmZpZyB9OiB7IHBheWxvYWRDb25maWc6IFNhbml0aXplZENvbmZpZyB9KTogQmV0dGVyQXV0aE9wdGlvbnMge1xuICBjb25zdCBiZXR0ZXJBdXRoQ29uZmlnID0gcGF5bG9hZENvbmZpZy5jdXN0b20uYmV0dGVyQXV0aC5jb25maWcgYXMgQmV0dGVyQXV0aE9wdGlvbnNcblxuICBpZiAoIWJldHRlckF1dGhDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JldHRlckF1dGggY29uZmlnIG5vdCBmb3VuZC4gTm90IHNldCBwYXlsb2FkQ29uZmlnLmN1c3RvbS5iZXR0ZXJBdXRoLmNvbmZpZycpXG4gIH1cblxuICBjb25zdCBvcHRpb25zV2l0aEFkYXB0ZXI6IEJldHRlckF1dGhPcHRpb25zID0ge1xuICAgIC4uLmJldHRlckF1dGhDb25maWcsXG4gICAgZGF0YWJhc2U6IHBheWxvYWRBZGFwdGVyKHtcbiAgICAgIHBheWxvYWRDbGllbnQ6IGFzeW5jICgpID0+IGF3YWl0IGdldFBheWxvYWQoeyBjb25maWc6IHBheWxvYWRDb25maWcgfSksXG4gICAgICBpZFR5cGU6IHBheWxvYWRDb25maWcuZGIuZGVmYXVsdElEVHlwZVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gb3B0aW9uc1dpdGhBZGFwdGVyXG59XG4iXSwibmFtZXMiOlsiZ2V0UGF5bG9hZCIsInBheWxvYWRBZGFwdGVyIiwiZ2V0RGVmYXVsdEJldHRlckF1dGhTY2hlbWEiLCJzeW5jUmVzb2x2ZWRTY2hlbWFXaXRoQ29sbGVjdGlvbk1hcCIsImFwcGx5RGlzYWJsZWREZWZhdWx0QXV0aENvbmZpZyIsImJ1aWxkQ29sbGVjdGlvbnMiLCJpbml0QmV0dGVyQXV0aCIsInNhbml0aXplQmV0dGVyQXV0aE9wdGlvbnMiLCJzZXRMb2dpbk1ldGhvZHMiLCJzZXQiLCJnZXRQYXlsb2FkQXV0aCIsImJ1aWxkQmV0dGVyQXV0aERhdGEiLCJwYXlsb2FkQ29uZmlnIiwicGx1Z2luT3B0aW9ucyIsImRlZmF1bHRCZXR0ZXJBdXRoU2NoZW1hcyIsImNvbGxlY3Rpb25NYXAiLCJyZXNvbHZlZFNjaGVtYXMiLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwiY29sbGVjdGlvbnMiLCJyZXNvbHZlZEJldHRlckF1dGhTY2hlbWFzIiwic2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnMiLCJjb25maWciLCJiZXR0ZXJBdXRoT3B0aW9ucyIsImJldHRlckF1dGhQbHVnaW4iLCJkaXNhYmxlZCIsImN1c3RvbSIsImhhc0JldHRlckF1dGhQbHVnaW4iLCJkaXNhYmxlRGVmYXVsdFBheWxvYWRBdXRoIiwiT2JqZWN0IiwidmFsdWVzIiwiaW5jb21pbmdPbkluaXQiLCJvbkluaXQiLCJwYXlsb2FkIiwiYXV0aCIsImlkVHlwZSIsImRiIiwiZGVmYXVsdElEVHlwZSIsIm9wdGlvbnMiLCJlbmFibGVEZWJ1Z0xvZ3MiLCJkZWJ1ZyIsInBsdWdpbnMiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid3JpdGFibGUiLCJjb25maWd1cmFibGUiLCJlcnJvciIsImNvbnNvbGUiLCJ3aXRoUGF5bG9hZEF1dGgiLCJiZXR0ZXJBdXRoQ29uZmlnIiwiYmV0dGVyQXV0aCIsIkVycm9yIiwib3B0aW9uc1dpdGhBZGFwdGVyIiwiZGF0YWJhc2UiLCJwYXlsb2FkQ2xpZW50Il0sIm1hcHBpbmdzIjoiQUFDQSxTQUFTQSxVQUFVLFFBQXNDLFVBQVM7QUFDbEUsU0FBU0MsY0FBYyxRQUFRLG1DQUFrQztBQUVqRSxTQUFTQywwQkFBMEIsUUFBUSxtQ0FBa0M7QUFDN0UsU0FBU0MsbUNBQW1DLFFBQVEscURBQW9EO0FBQ3hHLFNBQVNDLDhCQUE4QixRQUFRLDJDQUEwQztBQUN6RixTQUFTQyxnQkFBZ0IsUUFBUSxnQ0FBK0I7QUFDaEUsU0FBU0MsY0FBYyxRQUFRLHlCQUF3QjtBQUN2RCxTQUFTQyx5QkFBeUIsUUFBUSwyQ0FBMEM7QUFDcEYsU0FBU0MsZUFBZSxRQUFRLDBCQUF5QjtBQUV6RCxTQUFTQyxHQUFHLFFBQVEsY0FBYTtBQUVqQyxjQUFjLGtCQUFpQjtBQUMvQixTQUFTQyxjQUFjLFFBQVEseUJBQXdCO0FBQ3ZELFNBQVNILHlCQUF5QixRQUFRLDJDQUEwQztBQUNwRixjQUFjLFVBQVM7QUFFdkIsU0FBU0ksb0JBQW9CLEVBQUVDLGFBQWEsRUFBRUMsYUFBYSxFQUE4RTtJQUN2SUEsZ0JBQWdCTCxnQkFBZ0I7UUFBRUs7SUFBYztJQUVoRCxNQUFNQywyQkFBMkJaLDJCQUEyQlc7SUFFNUQsSUFBSUUsZ0JBQWdCVixpQkFBaUI7UUFDbkNXLGlCQUFpQkY7UUFDakJHLHFCQUFxQkwsY0FBY00sV0FBVyxJQUFJLEVBQUU7UUFDcERMO0lBQ0Y7SUFFQSxNQUFNTSw0QkFBNEJoQixvQ0FBb0NXLDBCQUEwQkM7SUFFaEcsMkVBQTJFO0lBQzNFLGtHQUFrRztJQUNsRyw2REFBNkQ7SUFDN0RBLGdCQUFnQlYsaUJBQWlCO1FBQy9CVyxpQkFBaUJHO1FBQ2pCRixxQkFBcUJMLGNBQWNNLFdBQVcsSUFBSSxFQUFFO1FBQ3BETDtJQUNGO0lBRUEsTUFBTU8sNkJBQTZCYiwwQkFBMEI7UUFDM0RjLFFBQVFUO1FBQ1JDO1FBQ0FHLGlCQUFpQkc7SUFDbkI7SUFFQU4sY0FBY1MsaUJBQWlCLEdBQUdGO0lBRWxDLE9BQU87UUFDTFA7UUFDQUU7UUFDQUk7UUFDQUM7SUFDRjtBQUNGO0FBRUEsT0FBTyxTQUFTRyxpQkFBaUJWLGFBQXNDO0lBQ3JFLE9BQU8sQ0FBQ1E7UUFDTixJQUFJUixjQUFjVyxRQUFRLEVBQUU7WUFDMUIsT0FBT0g7UUFDVDtRQUVBQSxPQUFPSSxNQUFNLEdBQUc7WUFDZCxHQUFHSixPQUFPSSxNQUFNO1lBQ2hCQyxxQkFBcUI7UUFDdkI7UUFFQSxNQUFNLEVBQUVYLGFBQWEsRUFBRUkseUJBQXlCLEVBQUVDLDBCQUEwQixFQUFFLEdBQUdULG9CQUFvQjtZQUNuR0MsZUFBZVM7WUFDZlI7UUFDRjtRQUVBSixJQUFJWSxRQUFRLDRCQUE0QkQ7UUFFeEMsMkRBQTJEO1FBQzNELElBQUlQLGNBQWNjLHlCQUF5QixFQUFFO1lBQzNDdkIsK0JBQStCO2dCQUM3QmlCO2dCQUNBUjtnQkFDQUU7Z0JBQ0FJO1lBQ0Y7UUFDRjtRQUVBRSxPQUFPSCxXQUFXLEdBQUdHLE9BQU9ILFdBQVcsSUFBSSxFQUFFO1FBQzdDRyxPQUFPSCxXQUFXLEdBQUdVLE9BQU9DLE1BQU0sQ0FBQ2Q7UUFFbkMsTUFBTWUsaUJBQWlCVCxPQUFPVSxNQUFNO1FBRXBDVixPQUFPVSxNQUFNLEdBQUcsT0FBT0M7WUFDckIsSUFBSTtnQkFDRiw4Q0FBOEM7Z0JBQzlDLElBQUlGLGdCQUFnQjtvQkFDbEIsTUFBTUEsZUFBZUU7Z0JBQ3ZCO2dCQUVBLDZDQUE2QztnQkFDN0MsTUFBTUMsT0FBTzNCLGVBQXVFO29CQUNsRjBCO29CQUNBRSxRQUFRRixRQUFRRyxFQUFFLENBQUNDLGFBQWE7b0JBQ2hDQyxTQUFTO3dCQUNQLEdBQUdqQiwwQkFBMEI7d0JBQzdCa0IsaUJBQWlCekIsY0FBYzBCLEtBQUssRUFBRUQsbUJBQW1CO3dCQUN6REUsU0FBUzsrQkFBS3BCLDJCQUEyQm9CLE9BQU8sSUFBSSxFQUFFO3lCQUFFO29CQUMxRDtnQkFDRjtnQkFFQSxpREFBaUQ7Z0JBQ2pEWixPQUFPYSxjQUFjLENBQUNULFNBQVMsY0FBYztvQkFDM0NVLE9BQU9UO29CQUNQVSxVQUFVO29CQUNWQyxjQUFjO2dCQUNoQjtZQUNGLEVBQUUsT0FBT0MsT0FBTztnQkFDZEMsUUFBUUQsS0FBSyxDQUFDLG9DQUFvQ0E7Z0JBQ2xELE1BQU1BO1lBQ1I7UUFDRjtRQUNBLE9BQU94QjtJQUNUO0FBQ0Y7QUFFQSxPQUFPLFNBQVMwQixnQkFBZ0IsRUFBRW5DLGFBQWEsRUFBc0M7SUFDbkYsTUFBTW9DLG1CQUFtQnBDLGNBQWNhLE1BQU0sQ0FBQ3dCLFVBQVUsQ0FBQzVCLE1BQU07SUFFL0QsSUFBSSxDQUFDMkIsa0JBQWtCO1FBQ3JCLE1BQU0sSUFBSUUsTUFBTTtJQUNsQjtJQUVBLE1BQU1DLHFCQUF3QztRQUM1QyxHQUFHSCxnQkFBZ0I7UUFDbkJJLFVBQVVuRCxlQUFlO1lBQ3ZCb0QsZUFBZSxVQUFZLE1BQU1yRCxXQUFXO29CQUFFcUIsUUFBUVQ7Z0JBQWM7WUFDcEVzQixRQUFRdEIsY0FBY3VCLEVBQUUsQ0FBQ0MsYUFBYTtRQUN4QztJQUNGO0lBRUEsT0FBT2U7QUFDVCJ9