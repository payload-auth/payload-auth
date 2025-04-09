import { type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../../../types";
import { getPayloadAuth } from "../../../get-payload-auth";
import { redirect } from "next/dist/server/api-utils";

export const getSetFirstAdminEndpoint = (
  pluginOptions: BetterAuthPluginOptions
): Endpoint => {
  const endpoint: Endpoint = {
    path: "/set-first-admin",
    method: "get",
    handler: async (req) => {
      const { t, payload, user } = req;
      const { config } = payload;

      if (!user?.id) {
        return Response.json(
          { message: "No user in request" },
          { status: httpStatus.BAD_REQUEST }
        );
      }

      await payload.update({
        collection: config.admin.user,
        id: user.id,
        data: {
          role: pluginOptions.users?.adminRoles?.[0] ?? "admin",
        },
        overrideAccess: true,
      });

      // Create a 307 redirect response to the admin route
      const response = new Response(null, {
        status: 307,
        headers: {
          Location: config.routes.admin,
        },
      });

      return response;
    },
  };

  return endpoint;
};
