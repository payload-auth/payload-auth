import type { AuthStrategy } from "payload";
import { getPayloadAuth } from "../../../lib/get-payload-auth";

/**
 * Auth strategy for BetterAuth
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */
export function betterAuthStrategy(userSlug?: string): AuthStrategy {
  return {
    name: "better-auth",
    authenticate: async ({ payload, headers }) => {
      try {
        const payloadAuth = await getPayloadAuth(payload.config);
        const res = await payloadAuth.betterAuth.api.getSession({
          headers,
        });
        if (!res) {
          return { user: null };
        }
        const userId = res.session.userId;
        if (!userId) {
          return { user: null };
        }
        const user = await payloadAuth.findByID({
          collection: userSlug ?? "users",
          id: userId,
        });
        if (!user) {
          return { user: null };
        }
        return {
          user: {
            ...user,
            collection: userSlug ?? "users",
            _strategy: "better-auth",
          },
        };
      } catch {
        return { user: null };
      }
    },
  };
}
