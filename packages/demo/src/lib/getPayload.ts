"use server";

import configPromise from "@payload-config";
import { getPayloadWithAuth } from "@payload-auth/better-auth-plugin";
import { BetterAuthPlugins } from "@/payload/plugins";

const getPayload = () => getPayloadWithAuth<BetterAuthPlugins>(configPromise);

export default getPayload;
