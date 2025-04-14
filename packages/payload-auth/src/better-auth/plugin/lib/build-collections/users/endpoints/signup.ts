import {
  addDataAndFileToRequest,
  commitTransaction,
  initTransaction,
  killTransaction,
  type Endpoint,
} from "payload";
import { status as httpStatus } from "http-status";
import {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../../../types";
import z from "zod";
import { getPayloadAuth } from "../../../get-payload-auth";
import { getRequestCollection } from "../../../../helpers/get-requst-collection";

const routeParamsSchema = z.object({
  token: z.string(),
  redirect: z.string().optional(),
});

const signupSchema = z.object({
  password: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
});

export const getSignupEndpoint = (
  pluginOptions: BetterAuthPluginOptions,
  betterAuthOptions: SanitizedBetterAuthOptions
): Endpoint => {
  const endpoint: Endpoint = {
    path: "/signup",
    method: "post",
    handler: async (req) => {
      await addDataAndFileToRequest(req);
      const collection = getRequestCollection(req);
      const { t } = req;
      try {
        const shouldCommit = await initTransaction(req);
        const {
          success: routeParamsSuccess,
          data: routeParamsData,
          error: routeParamsError,
        } = routeParamsSchema.safeParse(req.query);
        if (!routeParamsSuccess) {
          return Response.json(
            { message: routeParamsError.message },
            { status: httpStatus.BAD_REQUEST }
          );
        }
        const invite = await req.payload.find({
          collection:
            pluginOptions.adminInvitations?.slug ?? "admin-invitations",
          where: {
            token: {
              equals: routeParamsData.token,
            },
          },
          limit: 1,
          req,
        });
        if (invite.docs.length === 0) {
          return Response.json(
            { message: "Invalid token" },
            { status: httpStatus.UNAUTHORIZED }
          );
        }
        const inviteRole = invite.docs[0].role as string;
        const schema = signupSchema.safeParse(req.data);
        if (!schema.success) {
          return Response.json(
            { message: schema.error.message },
            { status: httpStatus.BAD_REQUEST }
          );
        }
        const { email, password, username } = schema.data;
        const baseURL = betterAuthOptions.baseURL;
        const basePath = betterAuthOptions.basePath ?? "/api/auth";
        const authApiURL = `${baseURL}${basePath}`;
        const url = authApiURL + "/sign-up/email";
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            username: username,
          }),
        });
        const ok = result.ok;

        if (!ok) {
          throw new Error(result.statusText);
        }
        const responseData = await result.json();

        await req.payload.update({
          collection: pluginOptions.users?.slug ?? "users",
          id: responseData.user.id,
          data: {
            role: inviteRole,
          },
          overrideAccess: true,
          req,
        });
        await req.payload.delete({
          collection:
            pluginOptions.adminInvitations?.slug ?? "admin-invitations",
          where: {
            token: { equals: routeParamsData.token },
          },
          req,
        });

        const requireEmailVerification =
          (betterAuthOptions.emailAndPassword?.requireEmailVerification ||
            collection.config.auth.verify) &&
          !responseData.user.emailVerified;

        const sentEmailVerification =
          betterAuthOptions.emailVerification?.sendVerificationEmail !==
          undefined;

        if (requireEmailVerification) {
          if (shouldCommit) {
            await commitTransaction(req);
          }
          if (sentEmailVerification) {
            return new Response(
              JSON.stringify({
                message: t("authentication:verifyYourEmail"),
                sentEmailVerification,
                requireEmailVerification,
              }),
              { status: httpStatus.UNAUTHORIZED }
            );
          } else {
            return new Response(
              JSON.stringify({
                message: t("authentication:verifyYourEmail"),
                sentEmailVerification,
                requireEmailVerification,
              }),
              { status: httpStatus.UNAUTHORIZED }
            );
          }
        }
        const response = new Response(
          JSON.stringify({
            message: t("authentication:passed"),
            ...responseData,
          }),
          {
            status: 200,
          }
        );
        // Forward all Set-Cookie headers from the original response to our response
        const setCookieHeader = result.headers.get("set-cookie");
        if (setCookieHeader) {
          // Set-Cookie headers are typically returned as a single string with multiple cookies separated by commas
          const cookies = setCookieHeader.split(",");
          cookies.forEach((cookie) => {
            response.headers.append("Set-Cookie", cookie.trim());
          });
        }
        if (shouldCommit) {
          await commitTransaction(req);
        }
        return response;
      } catch (error: any) {
        await killTransaction(req);
        return Response.json(
          { message: error.message },
          { status: httpStatus.INTERNAL_SERVER_ERROR }
        );
      }
    },
  };

  return endpoint;
};
