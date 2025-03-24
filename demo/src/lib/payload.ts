"use server";

import configPromise from "@payload-config";
import { getPayloadWithAuth } from "@payload-auth/better-auth-plugin";
import { BetterAuthPlugins } from "@/payload/plugins";

export const getPayload = () => getPayloadWithAuth<BetterAuthPlugins>(configPromise);