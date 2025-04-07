import { type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import { headersWithCors } from "payload";
import { getRequestCollection } from "../../../../helpers/get-requst-collection";
import { SanitizedBetterAuthOptions } from "../../../../types";
import { checkUsernamePlugin } from "../../../../helpers/check-username-plugin";
import { isNumber } from "payload/shared";
import { setCookieCache, setSessionCookie } from "better-auth/cookies";
import { GenericEndpointContext } from "better-auth/types";

export const getLoginEndpoint = (
  betterAuthOptions: SanitizedBetterAuthOptions
): Endpoint => {
  const endpoint: Endpoint = {
    path: "/login",
    method: "post",
    handler: async (req) => {
      const { t } = req;

      // Parse form data if available, otherwise use req.body
      // Parse form data if available, otherwise use req.body
      const formData = req.formData ? await req.formData() : null;

      // Determine login credentials from form data or request body
      let email = "";
      let password = "";
      let username = "";
      let isUsingUsername = false;

      if (formData) {
        // Handle the case where formData has a _payload property with JSON string
        const formDataObject = formData.get("_payload");
        if (formDataObject && typeof formDataObject === "string") {
          try {
            const parsedPayload = JSON.parse(formDataObject);
            email = parsedPayload.email || "";
            password = parsedPayload.password || "";
            username = parsedPayload.username || "";
          } catch (error) {
            console.error("Error parsing formData", error);
          }
        }

        // If username is provided and email is not, we're logging in with username
        isUsingUsername = Boolean(username && !email);
      } else {
        return Response.json(
          {
            message: t("authentication:emailNotValid"),
          },
          { status: httpStatus.BAD_REQUEST }
        );
      }

      // If the form contains a username field that looks like an email, it might be using
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
        const url = authApiURL + "/sign-in/username";
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
        const url = authApiURL + "/sign-in/email";
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
          console.log("COOKIE", cookie);
          response.headers.append("Set-Cookie", cookie.trim());
        });
      }
      return response;
    },
  };

  return endpoint;
};
