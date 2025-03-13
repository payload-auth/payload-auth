"use server";

import configPromise from "@payload-config";
import { getPayloadBetterAuth } from "@payload-auth/better-auth-plugin";
import { BetterAuthPlugins } from "@/payload/plugins";

const getPayload = () => getPayloadBetterAuth<BetterAuthPlugins>(configPromise);

export default getPayload;
