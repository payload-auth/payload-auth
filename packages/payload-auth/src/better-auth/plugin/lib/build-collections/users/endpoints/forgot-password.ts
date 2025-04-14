import {
  addDataAndFileToRequest,
  APIError,
  commitTransaction,
  Endpoint,
  headersWithCors,
  initTransaction,
  killTransaction,
  Where,
} from "payload";
import {
  BetterAuthPluginOptions,
  ConfigAdminCustom,
  SanitizedBetterAuthOptions,
} from "../../../../types";
import { status as httpStatus } from "http-status";
import { getPayloadAuth } from "../../../get-payload-auth";
import { z } from "zod";
import { getRequestCollection } from "../../../../helpers/get-requst-collection";
import { getLoginOptions } from "payload/shared";
import { getAdminRoutes } from "../../../../helpers/get-admin-routes";
const requestSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
});

export const getForgotPasswordEndpoint = (): Endpoint => {
  const endpoint: Endpoint = {
    path: "/forgot-password",
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
      const adminRoutes = getAdminRoutes(req.payload.config.admin.custom);
      const redirectUrl = `${req.payload.config.routes?.admin || "/admin"}${adminRoutes.resetPassword}`;
      const { email, username } = body.data;
      const collection = getRequestCollection(req);
      const loginWithUsername = collection.config.auth?.loginWithUsername;
      const { canLoginWithEmail, canLoginWithUsername } =
        getLoginOptions(loginWithUsername);
      const sanitizedEmail =
        (canLoginWithEmail && (email || "").toLowerCase().trim()) || null;
      const sanitizedUsername = username?.toLowerCase().trim() || null;
      if (!sanitizedEmail && !sanitizedUsername) {
        throw new APIError(
          `Missing ${loginWithUsername ? "username" : "email"}.`,
          httpStatus.BAD_REQUEST
        );
      }

      try {
        await initTransaction(req);
        let whereConstraint: Where = {};
        if (canLoginWithEmail && sanitizedEmail) {
          whereConstraint = {
            email: {
              equals: sanitizedEmail,
            },
          };
        } else if (canLoginWithUsername && sanitizedUsername) {
          whereConstraint = {
            username: {
              equals: sanitizedUsername,
            },
          };
        }
        const res = await req.payload.find({
          collection: collection.config.slug,
          req,
          where: whereConstraint,
        });
        // We don't want to indicate specifically that an email was not found,
        // as doing so could lead to the exposure of registered emails.
        // Therefore, we prefer to fail silently.
        if (res.docs.length === 0) {
          await commitTransaction(req);
          return Response.json(
            {
              message: t("general:success"),
            },
            { status: httpStatus.OK }
          );
        }
        const user = res.docs[0];
        const payloadAuth = await getPayloadAuth(req.payload.config);
        await payloadAuth.betterAuth.api.forgetPassword({
          body: {
            email: user.email,
            redirectTo: redirectUrl,
          },
        });
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
