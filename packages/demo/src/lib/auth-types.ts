
import { authClient } from "./auth-client";
import getPayload from "./getPayload";

const payload = await getPayload();

export type Session = typeof payload.betterAuth.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
