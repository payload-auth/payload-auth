import { addDataAndFileToRequest, type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import { SanitizedBetterAuthOptions } from "../../../../types";
import z from "zod";

const loginSchema = z.object({
  password: z.string(),
  email: z.string().email().optional(),
  username: z.string().optional(),
});

export const getLoginEndpoint = (
  betterAuthOptions: SanitizedBetterAuthOptions
): Endpoint => {
  const endpoint: Endpoint = {
    path: "/login",
    method: "post",
    handler: async (req) => {
      await addDataAndFileToRequest(req);
      const { t } = req;

      try {
        const schema = loginSchema.safeParse(req.data);

        if (!schema.success) {
          return Response.json(
            { message: schema.error.message },
            { status: httpStatus.BAD_REQUEST }
          );
        }

        let { email, password, username } = schema.data;

        // If the username looks like an email, it might be using
        // the emailOrUsername field type, so we should set email accordingly
        //TODO: CHECK IF THIS IS CORRECT, username could have an @??
        if (username && !email && username.includes("@")) {
          email = username;
          username = undefined;
        }

        let result;
        const baseURL = betterAuthOptions.baseURL;
        const basePath = betterAuthOptions.basePath ?? "/api/auth";
        const authApiURL = `${baseURL}${basePath}`;

        if (username) {
          const url = authApiURL + "/sign-in/username";
          result = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
          });
        } else {
          const url = authApiURL + "/sign-in/email";
          result = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
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
              status: httpStatus.UNAUTHORIZED,
            }
          );
        }

        const responseData = await result.json();

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
