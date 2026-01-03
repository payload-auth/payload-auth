import { status as httpStatus } from "http-status";
import {
  addDataAndFileToRequest,
  Endpoint,
  headersWithCors,
  killTransaction
} from "payload";
import { z } from "zod";
import { adminEndpoints } from "@/better-auth/plugin/constants";
import type { PayloadAuthOptions } from "@/better-auth/plugin/types";

const requestSchema = z.object({
  email: z.email(),
  link: z.string()
});

export const getSendInviteUrlEndpoint = (
  pluginOptions: PayloadAuthOptions
): Endpoint => {
  const endpoint: Endpoint = {
    path: adminEndpoints.sendInvite,
    method: "post",
    handler: async (req) => {
      await addDataAndFileToRequest(req);
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
