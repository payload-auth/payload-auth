import { createAuthMiddleware, getOAuthState } from "better-auth/api";
import type { SanitizedBetterAuthOptions } from "@/better-auth/plugin/types";

/**
 * Modifies options object and adds an after-hook middleware that assigns the
 * invited admin role to newly created users — for both email sign-ups and
 * social/OAuth sign-ups.
 *
 * Email sign-up: token is read from the `x-admin-invite-token` request header
 * (preferred), or falls back to ctx.query / ctx.body / ctx.body.additionalData.
 * OAuth callback: token is read from the OAuth state (passed via additionalData).
 */
export const useAdminInviteAfterSignUpMiddleware = async ({
  options,
  adminInvitationCollectionSlug,
  userCollectionSlug
}: {
  options: SanitizedBetterAuthOptions;
  adminInvitationCollectionSlug: string;
  userCollectionSlug: string;
}) => {
  options.hooks = options.hooks || {};
  const originalAfter = options.hooks.after;
  options.hooks.after = createAuthMiddleware(async (ctx) => {
    const adapter = ctx.context.adapter;
    const internalAdapter = ctx.context.internalAdapter;

    const isEmailSignUp = ctx.path === "/sign-up/email";
    const isOAuthCallback = ctx.path.startsWith("/callback/");

    if (!isEmailSignUp && !isOAuthCallback) {
      if (typeof originalAfter === "function") await originalAfter(ctx);
      return;
    }

    // Extract the invite token from the appropriate source.
    // Headers are the most reliable transport for server-side API calls because
    // BA's endpoint body schemas strip unknown fields and query params require
    // the endpoint to declare a query schema.
    let adminInviteToken: string | undefined;
    if (isEmailSignUp) {
      adminInviteToken =
        ctx.headers?.get("x-admin-invite-token") ??
        ctx?.query?.adminInviteToken ??
        ctx.body?.adminInviteToken ??
        ctx.body?.additionalData?.adminInviteToken;
    } else if (isOAuthCallback) {
      const oauthState = await getOAuthState();
      adminInviteToken = oauthState?.adminInviteToken;
    }

    if (!adminInviteToken) {
      if (typeof originalAfter === "function") await originalAfter(ctx);
      return;
    }

    // Look up the invitation by token
    const adminInvitation = (await adapter.findOne({
      model: adminInvitationCollectionSlug,
      where: [
        {
          field: "token",
          value: adminInviteToken,
          operator: "eq"
        }
      ]
    })) as any;

    if (!adminInvitation || !adminInvitation?.role) {
      if (typeof originalAfter === "function") await originalAfter(ctx);
      return;
    }

    // Immediately consume (delete) the token to prevent reuse.
    await adapter.delete({
      model: adminInvitationCollectionSlug,
      where: [
        {
          field: "id",
          value: adminInvitation.id,
          operator: "eq"
        }
      ]
    });

    // Find the user to assign the role to
    let userId: string | undefined;

    if (isEmailSignUp) {
      const email = ctx.body?.email;
      if (email) {
        const newlyCreatedUser = await internalAdapter.findUserByEmail(email);
        userId = newlyCreatedUser?.user?.id;
      }
    } else if (isOAuthCallback) {
      const session = (ctx.context as any).newSession ?? (ctx.context as any).session;
      userId = session?.user?.id;
    }

    if (!userId) {
      if (typeof originalAfter === "function") await originalAfter(ctx);
      return;
    }

    await adapter.update({
      model: userCollectionSlug,
      where: [
        {
          field: "id",
          value: userId,
          operator: "eq"
        }
      ],
      update: {
        role: adminInvitation.role
      }
    });
    if (typeof originalAfter === "function") await originalAfter(ctx);
  });
};
