import { status as httpStatus } from "http-status";
import { type Endpoint } from "payload";
import { z } from "zod";
import { adminEndpoints, baseSlugs } from "@/better-auth/plugin/constants";
import { PayloadAuthOptions } from "../../../../types";
import { getPayloadAuth } from "../../../get-payload-auth";

const setAdminRoleSchema = z.object({
  token: z.string(),
  redirect: z.string().optional()
});

export const getSetAdminRoleEndpoint = (
  pluginOptions: PayloadAuthOptions,
  userSlug: string
): Endpoint => {
  const endpoint: Endpoint = {
    path: adminEndpoints.setAdminRole,
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
        headers: req.headers
      });
      if (!session) {
        return Response.json(
          { message: "No session found" },
          { status: httpStatus.UNAUTHORIZED }
        );
      }
      const { token, redirect } = schema.data;
      const invitationSlug =
        pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations;

      // Atomically consume the token by deleting first, then checking if anything was deleted.
      // This prevents race conditions where two concurrent requests could both use the same token.
      const deleted = await req.payload.delete({
        collection: invitationSlug,
        where: {
          token: { equals: token }
        }
      });

      if (!deleted.docs || deleted.docs.length === 0) {
        return Response.json(
          { message: "Invalid token" },
          { status: httpStatus.UNAUTHORIZED }
        );
      }

      const role = deleted.docs[0].role as string;
      try {
        await req.payload.update({
          collection: userSlug,
          id: session.user.id,
          data: {
            role: [role]
          },
          overrideAccess: true
        });

        // Validate redirect is a relative path to prevent open redirect
        const safeRedirect =
          redirect && redirect.startsWith("/")
            ? redirect
            : config.routes.admin;

        const response = new Response(null, {
          status: 307,
          headers: {
            Location: safeRedirect
          }
        });
        return response;
      } catch (error) {
        return Response.json(
          { message: "Error updating user role" },
          { status: httpStatus.INTERNAL_SERVER_ERROR }
        );
      }
    }
  };

  return endpoint;
};
