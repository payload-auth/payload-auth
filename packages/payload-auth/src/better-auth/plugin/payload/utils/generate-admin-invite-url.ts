import type { Payload } from "payload";

export function generateAdminInviteUrl({
  payload,
  token,
}: {
  payload: Payload;
  token: string;
}) {
  const { routes: { admin: adminRoute }, serverURL } = payload.config;
  return `${serverURL}${adminRoute}/invite?token=${token}`;
}