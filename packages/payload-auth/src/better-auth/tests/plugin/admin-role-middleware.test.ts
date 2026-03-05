import { describe, expect, it, vi } from "vitest";
import { adminAfterRoleMiddleware } from "../../plugin/lib/sanitize-better-auth-options/utils/admin-after-role-middleware";
import { adminBeforeRoleMiddleware } from "../../plugin/lib/sanitize-better-auth-options/utils/admin-before-role-middleware";
import type { SanitizedBetterAuthOptions } from "../../plugin/types";

/**
 * Creates a minimal mock auth middleware context for testing role transformation.
 * Simulates what Better Auth passes to before/after hooks.
 */
function createMockCtx(path: string, role: string | string[] | undefined): any {
  return {
    path,
    context: {
      session: role !== undefined ? { user: { id: "user-1", role } } : null
    }
  };
}

/**
 * Extracts the middleware function from options.hooks.before or .after
 * by calling it with a mock context. We need to unwrap the createAuthMiddleware wrapper.
 *
 * Since createAuthMiddleware returns a function that takes (ctx) and calls the inner fn,
 * and we can't easily unwrap it, we test by applying the middleware to a mock context
 * and inspecting the mutation.
 */

describe("adminBeforeRoleMiddleware", () => {
  it("converts array role to comma-separated string for /admin paths", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminBeforeRoleMiddleware({ sanitizedOptions: options });

    // The middleware is now at options.hooks.before
    expect(options.hooks?.before).toBeDefined();

    // Simulate the middleware execution
    const ctx = createMockCtx("/admin/list-users", ["admin", "editor"]);
    // createAuthMiddleware wraps our function - call the hook directly
    const middleware = options.hooks!.before as any;
    // createAuthMiddleware returns a function; we need to call it like BA would
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // Role should be converted to comma-separated string
    expect(ctx.context.session.user.role).toBe("admin,editor");
  });

  it("does NOT modify role for non-admin paths", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminBeforeRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/sign-in/email", ["admin", "editor"]);
    const middleware = options.hooks!.before as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // Role should remain as array for non-admin paths
    expect(ctx.context.session.user.role).toEqual(["admin", "editor"]);
  });

  it("handles string role without crashing (idempotent)", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminBeforeRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", "admin");
    const middleware = options.hooks!.before as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // Should not crash - string role is already string, Array.isArray check should skip
    expect(ctx.context.session.user.role).toBe("admin");
  });

  it("handles null session gracefully", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminBeforeRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", undefined);
    const middleware = options.hooks!.before as any;

    // Should not throw
    await expect(
      Promise.resolve(
        typeof middleware === "function" ? middleware(ctx) : undefined
      )
    ).resolves.not.toThrow();
  });

  it("preserves existing before hook", async () => {
    const originalBefore = vi.fn();
    const options: SanitizedBetterAuthOptions = {
      hooks: { before: originalBefore }
    } as any;
    adminBeforeRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", ["admin"]);
    const middleware = options.hooks!.before as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // createAuthMiddleware wraps ctx with extra helper properties,
    // so we verify the original properties are present (not exact match)
    expect(originalBefore).toHaveBeenCalledWith(
      expect.objectContaining({
        path: ctx.path,
        context: ctx.context
      })
    );
  });
});

describe("adminAfterRoleMiddleware", () => {
  it("converts comma-separated string role back to array for /admin paths", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", "admin,editor");
    const middleware = options.hooks!.after as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    expect(ctx.context.session.user.role).toEqual(["admin", "editor"]);
  });

  it("handles array role without crashing (Issues #112, #128)", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    // When role is already an array (e.g., from Payload's hasMany select),
    // calling .split(",") on it crashes with "split is not a function"
    const ctx = createMockCtx("/admin/list-users", ["admin", "editor"]);
    const middleware = options.hooks!.after as any;

    // This should NOT crash — needs to handle array input gracefully
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // Should remain as array
    expect(Array.isArray(ctx.context.session.user.role)).toBe(true);
    expect(ctx.context.session.user.role).toEqual(["admin", "editor"]);
  });

  it("does NOT modify role for non-admin paths", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/sign-in/email", "admin,editor");
    const middleware = options.hooks!.after as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // Should remain as-is for non-admin paths
    expect(ctx.context.session.user.role).toBe("admin,editor");
  });

  it("handles single role string", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", "admin");
    const middleware = options.hooks!.after as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    expect(ctx.context.session.user.role).toEqual(["admin"]);
  });

  it("trims whitespace from role entries", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", "admin , editor , user");
    const middleware = options.hooks!.after as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    expect(ctx.context.session.user.role).toEqual(["admin", "editor", "user"]);
  });

  it("filters empty strings from split result", async () => {
    const options: SanitizedBetterAuthOptions = { hooks: {} } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", "admin,,editor,");
    const middleware = options.hooks!.after as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    expect(ctx.context.session.user.role).toEqual(["admin", "editor"]);
  });

  it("preserves existing after hook and awaits it (P2-9)", async () => {
    let hookCalled = false;
    const originalAfter = vi.fn(async () => {
      hookCalled = true;
    });
    const options: SanitizedBetterAuthOptions = {
      hooks: { after: originalAfter }
    } as any;
    adminAfterRoleMiddleware({ sanitizedOptions: options });

    const ctx = createMockCtx("/admin/list-users", "admin");
    const middleware = options.hooks!.after as any;
    if (typeof middleware === "function") {
      await middleware(ctx);
    }

    // createAuthMiddleware wraps ctx with extra helper properties
    expect(originalAfter).toHaveBeenCalledWith(
      expect.objectContaining({
        path: ctx.path,
        context: ctx.context
      })
    );
    // P2-9: originalAfter should be awaited, not fire-and-forget
    expect(hookCalled).toBe(true);
  });
});
