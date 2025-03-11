import type { BetterAuthInitServer } from "../../../plugin/src/lib/better-auth";
import { authClient } from "./auth-client";

export type Session = BetterAuthInitServer["$Infer"]["Session"];
export type ActiveOrganization =
  (typeof authClient)["$Infer"]["ActiveOrganization"];
export type Invitation = (typeof authClient)["$Infer"]["Invitation"];
