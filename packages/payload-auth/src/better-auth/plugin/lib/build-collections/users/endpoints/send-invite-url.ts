import { status as httpStatus } from "http-status";
import {
  addDataAndFileToRequest,
  Endpoint,
  headersWithCors,
  killTransaction
} from "payload";
import { z } from "zod";
import { adminEndpoints, defaults } from "@/better-auth/plugin/constants";
import type { PayloadAuthOptions } from "@/better-auth/plugin/types";
import { getPayloadAuth } from "../../../get-payload-auth";
import { hasAdminRoles } from "../../utils/payload-access";

const requestSchema = z.object({
  email: z.email(),
  link: z.string()
});

export const getSendInviteUrlEndpoint = (
  pluginOptions: PayloadAuthOptions
): Endpoint => {
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole];

  const endpoint: Endpoint = {
    path: adminEndpoints.sendInvite,
    method: "post",
    handler: async (req) => {
      await addDataAndFileToRequest(req);

      if (!req.user) {
        return Response.json(
          { message: "Unauthorized" },
          { status: httpStatus.UNAUTHORIZED }
        );
      }
      if (!hasAdminRoles(adminRoles)({ req })) {
        return Response.json(
          { message: "Forbidden" },
          { status: httpStatus.FORBIDDEN }
        );
      }

      // Belt-and-suspenders: also validate the Better Auth session
      // to catch cases where a Payload JWT is stale but the BA session was revoked
      const payloadAuth = await getPayloadAuth(req.payload.config);
      const session = await payloadAuth.betterAuth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return Response.json(
          { message: "Unauthorized" },
          { status: httpStatus.UNAUTHORIZED }
        );
      }

      const { t } = req;
      const body = requestSchema.safeParse(req.data);
      if (!body.success) {
        return Response.json(
          { message: body.error.message },
          { status: httpStatus.BAD_REQUEST }
        );
      }

      const sendInviteEmailFn = pluginOptions.adminInvitations?.sendInviteEmail;

      if (!sendInviteEmailFn) {
        req.payload.logger.error(
          "Send admin invite email function not configured, please add the function to the betterAuthPlugin options."
        );
        return Response.json(
          { message: "Send invite email function not found" },
          { status: httpStatus.INTERNAL_SERVER_ERROR }
        );
      }

      try {
        const res = await sendInviteEmailFn({
          payload: req.payload,
          email: body.data.email,
          url: body.data.link
        });

        if (!res.success) {
          return Response.json(
            { message: res.message },
            { status: httpStatus.INTERNAL_SERVER_ERROR }
          );
        }

        return Response.json(
          {
            message: t("general:success")
          },
          {
            headers: headersWithCors({
              headers: new Headers(),
              req
            }),
            status: httpStatus.OK
          }
        );
      } catch (error) {
        await killTransaction(req);
        throw error;
      }
    }
  };
  return endpoint;
};
