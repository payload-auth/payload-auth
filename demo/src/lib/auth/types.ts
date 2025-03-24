import { auth, betterAuthPlugins } from "./";
import { authClient } from "./client";
import { User } from "payload";

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
export type BetterAuthPlugins = typeof betterAuthPlugins;
export type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];
export type DeviceSession = Awaited<ReturnType<typeof auth.api.listDeviceSessions>>[number];