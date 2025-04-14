import {
  addDataAndFileToRequest,
  Endpoint,
  headersWithCors,
  killTransaction,
} from "payload";
import { status as httpStatus } from "http-status";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  username: z.string().optional(),
});

export const getSendInviteUrlEndpoint = (): Endpoint => {
  const endpoint: Endpoint = {
    path: "/invite/send",
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

      try {
        return Response.json(
          {
            message: t("general:success"),
          },
          {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: httpStatus.OK,
          }
        );
      } catch (error) {
        await killTransaction(req);
        throw error;
      }
    },
  };
  return endpoint;
};
