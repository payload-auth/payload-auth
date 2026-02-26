import { status as httpStatus } from "http-status";
import { addDataAndFileToRequest, type Endpoint } from "payload";
import { adminEndpoints, baseSlugs, defaults } from "@/better-auth/plugin/constants";
import { getPayloadAuth } from "../../../get-payload-auth";
import { generateAdminInviteUrl } from "@/better-auth/plugin/payload/utils/generate-admin-invite-url";
import { PayloadAuthOptions } from "@/better-auth/plugin/types";
import { hasAdminRoles } from "../../utils/payload-access";

interface InviteEndpointProps {
  roles: { label: string; value: string }[];
  pluginOptions: PayloadAuthOptions;
}

export const getGenerateInviteUrlEndpoint = ({
  roles,
  pluginOptions
}: InviteEndpointProps): Endpoint => {
  const adminRoles = pluginOptions.users?.adminRoles ?? [defaults.adminRole];

  const endpoint: Endpoint = {
    path: adminEndpoints.generateInviteUrl,
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

      const body = req.data as { role: { label: string; value: string } };
      const generateAdminInviteUrlFn =
        pluginOptions?.adminInvitations?.generateInviteUrl ??
        generateAdminInviteUrl;

      if (!body) {
        return Response.json(
          { message: "No body provided" },
          { status: httpStatus.BAD_REQUEST }
        );
      }

      if (typeof body !== "object" || !("role" in body)) {
        return Response.json(
          { message: "Invalid body" },
          { status: httpStatus.BAD_REQUEST }
        );
      }

      if (!roles.some((role) => role.value === body.role.value)) {
        return Response.json(
          { message: "Invalid role" },
          { status: httpStatus.BAD_REQUEST }
        );
      }
      const token = crypto.randomUUID();
      const inviteLink = generateAdminInviteUrlFn({
        payload: req.payload,
        token
      });

      try {
        await req.payload.create({
          collection:
            pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
          data: {
            token,
            role: body.role.value,
            url: inviteLink
          }
        });
        const response = new Response(
          JSON.stringify({
            message: "Invite link generated successfully",
            inviteLink
          }),
          {
            status: 200
          }
        );
        return response;
      } catch (error) {
        console.error(error);
        return Response.json(
          { message: "Error generating invite link" },
          { status: httpStatus.INTERNAL_SERVER_ERROR }
        );
      }
    }
  };

  return endpoint;
};
