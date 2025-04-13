import { type Endpoint } from "payload";
import { status as httpStatus } from "http-status";
import { BetterAuthPluginOptions } from "../../types";
import { addDataAndFileToRequest } from "payload";

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
      const {
        payload: { config },
      } = req;

      const {
        routes: { admin: adminRoute },
      } = config;

      const body = req.data as {
        role: { label: string; value: string };
      };

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
      const inviteLink = `${baseUrl}${adminRoute}/invite?token=${token}`;

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
