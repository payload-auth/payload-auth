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
    // due to hooks, endpoints, useAsTitle, etc should rely on resolvedBetterAuthSchemas to get slugs
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
            adapterConfig: {
                enableDebugLogs: false,
                idType: payloadConfig.db.defaultIDType
            }
        })
    };
    return optionsWithAdapter;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJ2JldHRlci1hdXRoL3R5cGVzJ1xuaW1wb3J0IHsgZ2V0UGF5bG9hZCwgU2FuaXRpemVkQ29uZmlnLCB0eXBlIENvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBwYXlsb2FkQWRhcHRlciB9IGZyb20gJ3BheWxvYWQtYXV0aC9iZXR0ZXItYXV0aC9hZGFwdGVyJ1xuaW1wb3J0IHsgZ2V0RGVmYXVsdEJldHRlckF1dGhTY2hlbWEgfSBmcm9tICcuL2hlbHBlcnMvZ2V0LWJldHRlci1hdXRoLXNjaGVtYSdcbmltcG9ydCB7IHN5bmNSZXNvbHZlZFNjaGVtYVdpdGhDb2xsZWN0aW9uTWFwIH0gZnJvbSAnLi9oZWxwZXJzL3N5bmMtcmVzb2x2ZWQtc2NoZW1hLXdpdGgtY29sbGVjdGlvbi1tYXAnXG5pbXBvcnQgeyBhcHBseURpc2FibGVkRGVmYXVsdEF1dGhDb25maWcgfSBmcm9tICcuL2xpYi9hcHBseS1kaXNhYmxlZC1kZWZhdWx0LWF1dGgtY29uZmlnJ1xuaW1wb3J0IHsgYnVpbGRDb2xsZWN0aW9ucyB9IGZyb20gJy4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2luZGV4J1xuaW1wb3J0IHsgaW5pdEJldHRlckF1dGggfSBmcm9tICcuL2xpYi9pbml0LWJldHRlci1hdXRoJ1xuaW1wb3J0IHsgc2FuaXRpemVCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJy4vbGliL3Nhbml0aXplLWJldHRlci1hdXRoLW9wdGlvbnMvaW5kZXgnXG5pbXBvcnQgeyBzZXRMb2dpbk1ldGhvZHMgfSBmcm9tICcuL2xpYi9zZXQtbG9naW4tbWV0aG9kcydcbmltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgc2V0IH0gZnJvbSAnLi91dGlscy9zZXQnXG5cbmV4cG9ydCAqIGZyb20gJy4vaGVscGVycy9pbmRleCdcbmV4cG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnLi9saWIvZ2V0LXBheWxvYWQtYXV0aCdcbmV4cG9ydCB7IHNhbml0aXplQmV0dGVyQXV0aE9wdGlvbnMgfSBmcm9tICcuL2xpYi9zYW5pdGl6ZS1iZXR0ZXItYXV0aC1vcHRpb25zL2luZGV4J1xuZXhwb3J0ICogZnJvbSAnLi90eXBlcydcblxuZnVuY3Rpb24gYnVpbGRCZXR0ZXJBdXRoRGF0YSh7IHBheWxvYWRDb25maWcsIHBsdWdpbk9wdGlvbnMgfTogeyBwYXlsb2FkQ29uZmlnOiBTYW5pdGl6ZWRDb25maWc7IHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zIH0pIHtcbiAgcGx1Z2luT3B0aW9ucyA9IHNldExvZ2luTWV0aG9kcyh7IHBsdWdpbk9wdGlvbnMgfSlcblxuICBjb25zdCBkZWZhdWx0QmV0dGVyQXV0aFNjaGVtYXMgPSBnZXREZWZhdWx0QmV0dGVyQXV0aFNjaGVtYShwbHVnaW5PcHRpb25zKVxuXG4gIGxldCBjb2xsZWN0aW9uTWFwID0gYnVpbGRDb2xsZWN0aW9ucyh7XG4gICAgcmVzb2x2ZWRTY2hlbWFzOiBkZWZhdWx0QmV0dGVyQXV0aFNjaGVtYXMsXG4gICAgaW5jb21pbmdDb2xsZWN0aW9uczogcGF5bG9hZENvbmZpZy5jb2xsZWN0aW9ucyA/PyBbXSxcbiAgICBwbHVnaW5PcHRpb25zXG4gIH0pXG5cbiAgY29uc3QgcmVzb2x2ZWRCZXR0ZXJBdXRoU2NoZW1hcyA9IHN5bmNSZXNvbHZlZFNjaGVtYVdpdGhDb2xsZWN0aW9uTWFwKGRlZmF1bHRCZXR0ZXJBdXRoU2NoZW1hcywgY29sbGVjdGlvbk1hcClcblxuICAvLyBXZSBuZWVkIHRvIGJ1aWxkIHRoZSBjb2xsZWN0aW9ucyBhIHNlY29uZCB0aW1lIHdpdGggdGhlIHJlc29sdmVkIHNjaGVtYXNcbiAgLy8gZHVlIHRvIGhvb2tzLCBlbmRwb2ludHMsIHVzZUFzVGl0bGUsIGV0YyBzaG91bGQgcmVseSBvbiByZXNvbHZlZEJldHRlckF1dGhTY2hlbWFzIHRvIGdldCBzbHVnc1xuICAvLyBpZiB0aGV5IGFyZSByZWZlcmVuY2luZyB0byBvdGhlciBjb2xsZWN0aW9ucyB0aGVuIGl0IHNlbGYuXG4gIGNvbGxlY3Rpb25NYXAgPSBidWlsZENvbGxlY3Rpb25zKHtcbiAgICByZXNvbHZlZFNjaGVtYXM6IHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXMsXG4gICAgaW5jb21pbmdDb2xsZWN0aW9uczogcGF5bG9hZENvbmZpZy5jb2xsZWN0aW9ucyA/PyBbXSxcbiAgICBwbHVnaW5PcHRpb25zXG4gIH0pXG5cbiAgY29uc3Qgc2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnMgPSBzYW5pdGl6ZUJldHRlckF1dGhPcHRpb25zKHtcbiAgICBjb25maWc6IHBheWxvYWRDb25maWcsXG4gICAgcGx1Z2luT3B0aW9ucyxcbiAgICByZXNvbHZlZFNjaGVtYXM6IHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXNcbiAgfSlcblxuICBwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID0gc2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnNcblxuICByZXR1cm4ge1xuICAgIHBsdWdpbk9wdGlvbnMsXG4gICAgY29sbGVjdGlvbk1hcCxcbiAgICByZXNvbHZlZEJldHRlckF1dGhTY2hlbWFzLFxuICAgIHNhbml0aXplZEJldHRlckF1dGhPcHRpb25zXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHRlckF1dGhQbHVnaW4ocGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMpIHtcbiAgcmV0dXJuIChjb25maWc6IENvbmZpZyk6IENvbmZpZyA9PiB7XG4gICAgaWYgKHBsdWdpbk9wdGlvbnMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiBjb25maWdcbiAgICB9XG5cbiAgICBjb25maWcuY3VzdG9tID0ge1xuICAgICAgLi4uY29uZmlnLmN1c3RvbSxcbiAgICAgIGhhc0JldHRlckF1dGhQbHVnaW46IHRydWVcbiAgICB9XG5cbiAgICBjb25zdCB7IGNvbGxlY3Rpb25NYXAsIHJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXMsIHNhbml0aXplZEJldHRlckF1dGhPcHRpb25zIH0gPSBidWlsZEJldHRlckF1dGhEYXRhKHtcbiAgICAgIHBheWxvYWRDb25maWc6IGNvbmZpZyBhcyBTYW5pdGl6ZWRDb25maWcsXG4gICAgICBwbHVnaW5PcHRpb25zXG4gICAgfSlcblxuICAgIHNldChjb25maWcsICdjdXN0b20uYmV0dGVyQXV0aC5jb25maWcnLCBzYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucylcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRmluYWxpemUgY29uZmlnIC0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKHBsdWdpbk9wdGlvbnMuZGlzYWJsZURlZmF1bHRQYXlsb2FkQXV0aCkge1xuICAgICAgYXBwbHlEaXNhYmxlZERlZmF1bHRBdXRoQ29uZmlnKHtcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBwbHVnaW5PcHRpb25zLFxuICAgICAgICBjb2xsZWN0aW9uTWFwLFxuICAgICAgICByZXNvbHZlZEJldHRlckF1dGhTY2hlbWFzXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbmZpZy5jb2xsZWN0aW9ucyA9IGNvbmZpZy5jb2xsZWN0aW9ucyA/PyBbXVxuICAgIGNvbmZpZy5jb2xsZWN0aW9ucyA9IE9iamVjdC52YWx1ZXMoY29sbGVjdGlvbk1hcClcblxuICAgIGNvbnN0IGluY29taW5nT25Jbml0ID0gY29uZmlnLm9uSW5pdFxuXG4gICAgY29uZmlnLm9uSW5pdCA9IGFzeW5jIChwYXlsb2FkKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBFeGVjdXRlIGFueSBleGlzdGluZyBvbkluaXQgZnVuY3Rpb25zIGZpcnN0XG4gICAgICAgIGlmIChpbmNvbWluZ09uSW5pdCkge1xuICAgICAgICAgIGF3YWl0IGluY29taW5nT25Jbml0KHBheWxvYWQpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbml0aWFsaXplIGFuZCBzZXQgdGhlIGJldHRlckF1dGggaW5zdGFuY2VcbiAgICAgICAgY29uc3QgYXV0aCA9IGluaXRCZXR0ZXJBdXRoPHR5cGVvZiBwbHVnaW5PcHRpb25zPih7XG4gICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICBpZFR5cGU6IHBheWxvYWQuZGIuZGVmYXVsdElEVHlwZSxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAuLi5zYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyxcbiAgICAgICAgICAgIGVuYWJsZURlYnVnTG9nczogcGx1Z2luT3B0aW9ucy5kZWJ1Zz8uZW5hYmxlRGVidWdMb2dzID8/IGZhbHNlLFxuICAgICAgICAgICAgcGx1Z2luczogWy4uLihzYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucy5wbHVnaW5zID8/IFtdKV1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gVHlwZS1zYWZlIGV4dGVuc2lvbiBvZiBwYXlsb2FkIHdpdGggYmV0dGVyQXV0aFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGF5bG9hZCwgJ2JldHRlckF1dGgnLCB7XG4gICAgICAgICAgdmFsdWU6IGF1dGgsXG4gICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIEJldHRlckF1dGg6JywgZXJyb3IpXG4gICAgICAgIHRocm93IGVycm9yXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb25maWdcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aFBheWxvYWRBdXRoKHsgcGF5bG9hZENvbmZpZyB9OiB7IHBheWxvYWRDb25maWc6IFNhbml0aXplZENvbmZpZyB9KTogQmV0dGVyQXV0aE9wdGlvbnMge1xuICBjb25zdCBiZXR0ZXJBdXRoQ29uZmlnID0gcGF5bG9hZENvbmZpZy5jdXN0b20uYmV0dGVyQXV0aC5jb25maWcgYXMgQmV0dGVyQXV0aE9wdGlvbnNcblxuICBpZiAoIWJldHRlckF1dGhDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JldHRlckF1dGggY29uZmlnIG5vdCBmb3VuZC4gTm90IHNldCBwYXlsb2FkQ29uZmlnLmN1c3RvbS5iZXR0ZXJBdXRoLmNvbmZpZycpXG4gIH1cblxuICBjb25zdCBvcHRpb25zV2l0aEFkYXB0ZXI6IEJldHRlckF1dGhPcHRpb25zID0ge1xuICAgIC4uLmJldHRlckF1dGhDb25maWcsXG4gICAgZGF0YWJhc2U6IHBheWxvYWRBZGFwdGVyKHtcbiAgICAgIHBheWxvYWRDbGllbnQ6IGFzeW5jICgpID0+IGF3YWl0IGdldFBheWxvYWQoeyBjb25maWc6IHBheWxvYWRDb25maWcgfSksXG4gICAgICBhZGFwdGVyQ29uZmlnOiB7XG4gICAgICAgIGVuYWJsZURlYnVnTG9nczogZmFsc2UsXG4gICAgICAgIGlkVHlwZTogcGF5bG9hZENvbmZpZy5kYi5kZWZhdWx0SURUeXBlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBvcHRpb25zV2l0aEFkYXB0ZXJcbn1cbiJdLCJuYW1lcyI6WyJnZXRQYXlsb2FkIiwicGF5bG9hZEFkYXB0ZXIiLCJnZXREZWZhdWx0QmV0dGVyQXV0aFNjaGVtYSIsInN5bmNSZXNvbHZlZFNjaGVtYVdpdGhDb2xsZWN0aW9uTWFwIiwiYXBwbHlEaXNhYmxlZERlZmF1bHRBdXRoQ29uZmlnIiwiYnVpbGRDb2xsZWN0aW9ucyIsImluaXRCZXR0ZXJBdXRoIiwic2FuaXRpemVCZXR0ZXJBdXRoT3B0aW9ucyIsInNldExvZ2luTWV0aG9kcyIsInNldCIsImdldFBheWxvYWRBdXRoIiwiYnVpbGRCZXR0ZXJBdXRoRGF0YSIsInBheWxvYWRDb25maWciLCJwbHVnaW5PcHRpb25zIiwiZGVmYXVsdEJldHRlckF1dGhTY2hlbWFzIiwiY29sbGVjdGlvbk1hcCIsInJlc29sdmVkU2NoZW1hcyIsImluY29taW5nQ29sbGVjdGlvbnMiLCJjb2xsZWN0aW9ucyIsInJlc29sdmVkQmV0dGVyQXV0aFNjaGVtYXMiLCJzYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyIsImNvbmZpZyIsImJldHRlckF1dGhPcHRpb25zIiwiYmV0dGVyQXV0aFBsdWdpbiIsImRpc2FibGVkIiwiY3VzdG9tIiwiaGFzQmV0dGVyQXV0aFBsdWdpbiIsImRpc2FibGVEZWZhdWx0UGF5bG9hZEF1dGgiLCJPYmplY3QiLCJ2YWx1ZXMiLCJpbmNvbWluZ09uSW5pdCIsIm9uSW5pdCIsInBheWxvYWQiLCJhdXRoIiwiaWRUeXBlIiwiZGIiLCJkZWZhdWx0SURUeXBlIiwib3B0aW9ucyIsImVuYWJsZURlYnVnTG9ncyIsImRlYnVnIiwicGx1Z2lucyIsImRlZmluZVByb3BlcnR5IiwidmFsdWUiLCJ3cml0YWJsZSIsImNvbmZpZ3VyYWJsZSIsImVycm9yIiwiY29uc29sZSIsIndpdGhQYXlsb2FkQXV0aCIsImJldHRlckF1dGhDb25maWciLCJiZXR0ZXJBdXRoIiwiRXJyb3IiLCJvcHRpb25zV2l0aEFkYXB0ZXIiLCJkYXRhYmFzZSIsInBheWxvYWRDbGllbnQiLCJhZGFwdGVyQ29uZmlnIl0sIm1hcHBpbmdzIjoiQUFDQSxTQUFTQSxVQUFVLFFBQXNDLFVBQVM7QUFDbEUsU0FBU0MsY0FBYyxRQUFRLG1DQUFrQztBQUNqRSxTQUFTQywwQkFBMEIsUUFBUSxtQ0FBa0M7QUFDN0UsU0FBU0MsbUNBQW1DLFFBQVEscURBQW9EO0FBQ3hHLFNBQVNDLDhCQUE4QixRQUFRLDJDQUEwQztBQUN6RixTQUFTQyxnQkFBZ0IsUUFBUSxnQ0FBK0I7QUFDaEUsU0FBU0MsY0FBYyxRQUFRLHlCQUF3QjtBQUN2RCxTQUFTQyx5QkFBeUIsUUFBUSwyQ0FBMEM7QUFDcEYsU0FBU0MsZUFBZSxRQUFRLDBCQUF5QjtBQUV6RCxTQUFTQyxHQUFH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