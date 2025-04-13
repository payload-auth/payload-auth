import { type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../types";
import z from "zod";
import { getPayloadAuth } from "../../lib/get-payload-auth";

const setAdminRoleSchema = z.object({
  token: z.string().optional(),
  redirect: z.string().optional(),
});

export const getSetAdminRoleEndpoint = (
  pluginOptions: BetterAuthPluginOptions,
  userSlug: string
): Endpoint => {
  const endpoint: Endpoint = {
    path: "/set-admin-role",
    method: "get",
    handler: async (req) => {
      const { config } = req.payload;
      const schema = setAdminRoleSchema.safeParse(req.query);
      if (!schema.success) {
        return Response.json(
          { message: schema.error.message },
          { status: httpStatus.BAD_REQUEST }
        );
      }
      const payloadAuth = await getPayloadAuth(config);
      const session = await payloadAuth.betterAuth.api.getSession({
        headers: req.headers,
      });
      if (!session) {
        return Response.json(
          { message: "No session found" },
          { status: httpStatus.UNAUTHORIZED }
        );
      }
      console.log("session", session);
      const { token, redirect } = schema.data;
      const invite = await req.payload.find({
        collection: pluginOptions.adminInvitations?.slug ?? "admin-invitations",
        where: {
          token: { equals: token },
        },
        limit: 1,
      });
      if (invite.docs.length === 0) {
        return Response.json(
          { message: "Invalid token" },
          { status: httpStatus.UNAUTHORIZED }
        );
      }
      const role = invite.docs[0].role as string;
      console.log("role", role);
      const updatedUser = await req.payload.update({
        collection: userSlug,
        id: session.user.id,
        data: {
          role: role,
        },
        overrideAccess: true,
      });
      console.log("updated user", updatedUser.docs);

      await req.payload.delete({
        collection: pluginOptions.adminInvitations?.slug ?? "admin-invitations",
        where: {
          token: {
            equals: token,
          },
        },
      });
      // Create a 307 redirect response to the admin route
      const response = new Response(null, {
        status: 307,
        headers: {
          Location: redirect ?? config.routes.admin,
        },
      });

      return response;
    },
  };

  return endpoint;
};
