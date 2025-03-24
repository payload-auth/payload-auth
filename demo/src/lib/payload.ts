"use server";

import configPromise from "@payload-config";
import { getPayloadWithAuth } from "@payload-auth/better-auth-plugin";
import type { BetterAuthPlugins } from "@/lib/auth/types";

export const getPayload = async () => getPayloadWithAuth<BetterAuthPlugins>(configPromise);
