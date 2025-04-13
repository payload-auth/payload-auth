import { type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import { BetterAuthPluginOptions } from "../../types";
import { addDataAndFileToRequest } from "payload";
import { generateAdminInviteUrl } from "../utils/generate-admin-invite-url";

type InviteEndpointProps = {
  roles: { label: string; value: string }[];
  baseUrl: string;
  pluginOptions: BetterAuthPluginOptions;
};

export const getGenerateInviteUrlEndpoint = ({
  roles,
  baseUrl,
  pluginOptions,
}: InviteEndpointProps): Endpoint => {
  const endpoint: Endpoint = {
    path: "/generate-invite-url",
    method: "post",
    handler: async (req) => {
      await addDataAndFileToRequest(req);
      const body = req.data as { role: { label: string; value: string }; };
      const generateAdminInviteUrlFn = pluginOptions?.adminInvitations?.generateInviteUrl ?? generateAdminInviteUrl;

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
        token,
      });

      try {
        await req.payload.create({
          collection:
            pluginOptions.adminInvitations?.slug ?? "admin-invitations",
          data: {
            token,
            role: body.role.value,
            url: inviteLink,
          },
        });
        const response = new Response(
          JSON.stringify({
            message: "Invite link generated successfully",
            inviteLink,
          }),
          {
            status: 200,
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
    },
  };

  return endpoint;
};
