import { auth, betterAuthPlugins } from "./";
import { authClient } from "./client";

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
export type BetterAuthPlugins = typeof betterAuthPlugins;