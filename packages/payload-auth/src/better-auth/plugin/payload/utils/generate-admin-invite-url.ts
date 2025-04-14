import type { Payload } from "payload";
import { getAdminRoutes } from "../../helpers/get-admin-routes";
import type { GenerateAdminInviteUrlFn } from "../../types";

export const generateAdminInviteUrl: GenerateAdminInviteUrlFn = ({
  payload,
  token,
}: {
  payload: Payload;
  token: string;
}) => {
  const {
    routes: { admin: adminRoute },
    serverURL,
    admin: { custom },
  } = payload.config;
  const adminRoutes = getAdminRoutes(custom);
  return `${serverURL}${adminRoute}${adminRoutes.adminInvite}?token=${token}`;
};
