import { addDataAndFileToRequest, type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../types";
import z from "zod";

const routeParamsSchema = z.object({
  token: z.string(),
  redirect: z.string().optional(),
});

const signupSchema = z.object({
  password: z.string(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  isUsingUsername: z.boolean().default(false),
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
      const { t } = req;

      try {
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

        let { email, password, username, isUsingUsername } = schema.data;

        if (isUsingUsername && !username) {
          return Response.json(
            { message: "Username is required" },
            { status: httpStatus.BAD_REQUEST }
          );
        }

        // If the username looks like an email, it might be using
        // the emailOrUsername field type, so we should set email accordingly
        if (username && !email && username.includes("@")) {
          email = username;
          isUsingUsername = false;
        }

        const authData = isUsingUsername
          ? {
              username,
              password,
            }
          : {
              email,
              password,
            };

        let result;
        const baseURL = betterAuthOptions.baseURL;
        const basePath = betterAuthOptions.basePath ?? "/api/auth";
        const authApiURL = `${baseURL}${basePath}`;

        if (isUsingUsername) {
          const url = authApiURL + "/sign-up/username";
          result = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: authData.username,
              password: authData.password,
            }),
          });
        } else {
          const url = authApiURL + "/sign-up/email";
          result = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: authData.email,
              password: authData.password,
            }),
          });
        }
        const ok = result.ok;

        if (!ok) {
          return Response.json(
            {
              message: result.statusText,
            },
            {
              status: httpStatus.INTERNAL_SERVER_ERROR,
            }
          );
        }

        const responseData = await result.json();
        console.log(responseData);

        await req.payload.update({
          collection: pluginOptions.users?.slug ?? "users",
          id: responseData.user.id,
          data: {
            role: inviteRole,
          },
          overrideAccess: true,
        });

        await req.payload.delete({
          collection:
            pluginOptions.adminInvitations?.slug ?? "admin-invitations",
          where: {
            token: { equals: routeParamsData.token },
          },
        });

        // Create the response with the appropriate data
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
        return response;
      } catch (error) {
        return Response.json(
          { message: "Failed to login" },
          { status: httpStatus.INTERNAL_SERVER_ERROR }
        );
      }
    },
  };

  return endpoint;
};
