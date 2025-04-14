import {
  addDataAndFileToRequest,
  APIError,
  commitTransaction,
  Endpoint,
  headersWithCors,
  initTransaction,
  killTransaction,
} from "payload";
import { status as httpStatus } from "http-status";
import { getPayloadAuth } from "../../../get-payload-auth";
import { z } from "zod";

const requestSchema = z.object({
  token: z.string(),
  password: z.string(),
});

export const getResetPasswordEndpoint = (): Endpoint => {
  const endpoint: Endpoint = {
    path: "/reset-password",
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
      const { token, password } = body.data;

      try {
        const shouldCommit = await initTransaction(req);
        const payloadAuth = await getPayloadAuth(req.payload.config);
        const res = await payloadAuth.betterAuth.api.resetPassword({
          body: {
            token,
            newPassword: password,
          },
        });

        if (!res.status) {
          throw new APIError(
            "Failed to reset password",
            httpStatus.INTERNAL_SERVER_ERROR
          );
        }

        if (shouldCommit) {
          await commitTransaction(req);
        }

        return Response.json(
          {
            message: t("authentication:passwordResetSuccessfully"),
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
        return Response.json(
          { message: error },
          { status: httpStatus.INTERNAL_SERVER_ERROR }
        );
      }
    },
  };
  return endpoint;
};
