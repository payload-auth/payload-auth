import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import type { SanitizedBetterAuthOptions } from "@/better-auth/plugin/types";

/**
 * Sets up a middleware that converts session.user.role from an a single string seperated by commas back to an array only for /admin routes
 */
export function adminAfterRoleMiddleware({
  sanitizedOptions
}: {
  sanitizedOptions: SanitizedBetterAuthOptions;
}) {
  if (typeof sanitizedOptions.hooks !== "object") sanitizedOptions.hooks = {};
  const originalAfter = sanitizedOptions.hooks.after;
  sanitizedOptions.hooks.after = createAuthMiddleware(async (ctx) => {
    if (ctx.path.startsWith("/admin")) {
      await getSessionFromCtx(ctx);
      if (
        ctx.context.session &&
        ctx.context.session.user &&
        typeof ctx.context.session.user.role === "string"
      ) {
        ctx.context.session!.user.role = ctx.context.session.user.role
          .split(",")
          .map((r: string) => r.trim())
          .filter(Boolean);
      }
    }
    if (typeof originalAfter === "function") {
      originalAfter(ctx);
    }
  });
}
