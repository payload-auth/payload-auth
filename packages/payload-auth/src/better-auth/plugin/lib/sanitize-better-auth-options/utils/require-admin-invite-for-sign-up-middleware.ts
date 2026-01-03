import type { Where } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { z } from "zod";
import { baseSlugs } from "@/better-auth/plugin/constants";
import type { SanitizedBetterAuthOptions } from "@/better-auth/plugin/types";
import { PayloadAuthOptions } from "@/better-auth/types";

const throwUnauthorizedError = () => {
  throw new APIError("UNAUTHORIZED", {
    message: "signup disabled" // mimic: https://github.com/better-auth/better-auth/blob/171fab5273cf38f46cf207b0d99c8ccdda64c2fb/packages/better-auth/src/oauth2/link-account.ts#L108
  });
};

/**
 * Mofies options object and adds a middleware to check for admin invite for sign up
 */
export const requireAdminInviteForSignUpMiddleware = async ({
  options,
  pluginOptions
}: {
  options: SanitizedBetterAuthOptions;
  pluginOptions: PayloadAuthOptions;
}) => {
  options.hooks = options.hooks || {};
  const originalBefore = options.hooks.before;
  options.hooks.before = createAuthMiddleware(async (ctx) => {
    if (
      ctx.path !== "/sign-up/email" && // not an email sign-up request
      !(ctx.path === "/sign-in/social" && ctx.body?.requestSignUp) // not a social sign-in request with sign-up intent
    )
      return;
    const adminInviteToken =
      ctx?.query?.adminInviteToken ?? ctx.body.adminInviteToken;
    if (
      !!pluginOptions.requireAdminInviteForSignUp &&
      !z.string().uuid().safeParse(adminInviteToken).success
    ) {
      throwUnauthorizedError();
      return;
    }
    const query: Where = {
      field: "token",
      value: adminInviteToken,
      operator: "eq"
    };
    const isValidAdminInvitation = await ctx.context.adapter.count({
      model: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
      where: [query]
    });
    if (isValidAdminInvitation) {
      if (originalBefore) return originalBefore(ctx);
      return ctx;
    }
    throwUnauthorizedError();
  });
};
