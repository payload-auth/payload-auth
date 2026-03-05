import { BaseURLConfig } from "better-auth";

/**
 * Resolves the better auth base URL from BaseURLConfig type
 * @param baseURL - The base URL configuration which can be a string, dynamic config object, or undefined
 * @param request - Optional request object for dynamic URL resolution
 * @returns The resolved base URL as a string
 */
export function resolveBaseURL(
  baseURL?: BaseURLConfig,
  headers?: Headers
): string {
  if (!baseURL) {
    return "";
  }

  if (typeof baseURL === "string") {
    return baseURL;
  }

  // Handle dynamic base URL config
  if (typeof baseURL === "object" && "allowedHosts" in baseURL) {
    const { allowedHosts, fallback, protocol = "auto" } = baseURL;

    if (!headers) {
      return fallback || "";
    }

    // Get host from request
    const host = headers.get("host");
    if (!host) {
      return fallback || "";
    }

    // Check if host matches any allowed pattern
    const isAllowed = allowedHosts.some((pattern) => {
      if (pattern.includes("*")) {
        // Convert wildcard pattern to regex
        const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
        return new RegExp(`^${regexPattern}$`).test(host);
      }
      return pattern === host;
    });

    if (!isAllowed) {
      return fallback || "";
    }

    // Determine protocol
    let resolvedProtocol = "https";
    if (protocol === "http") {
      resolvedProtocol = "http";
    } else if (protocol === "auto") {
      const forwardedProto = headers.get("x-forwarded-proto");
      resolvedProtocol = forwardedProto === "http" ? "http" : "https";
    }

    return `${resolvedProtocol}://${host}`;
  }

  return "";
}
