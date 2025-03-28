import { betterAuth } from "better-auth";
import type { BetterAuthReturn } from "@payload-auth/better-auth";
import { sanitizeBetterAuthOptions } from "@payload-auth/better-auth";
import type { BetterAuthPlugins } from './types';
import { payloadBetterAuthOptions } from './options';
import { payloadAdapter } from '@payload-auth/better-auth';
import { getPayload } from '@/lib/payload';

const options = {
  ...payloadBetterAuthOptions,
  betterAuthOptions: {
    ...payloadBetterAuthOptions.betterAuthOptions,
    database: payloadAdapter(() => getPayload()),
  },
};

export const auth = betterAuth(sanitizeBetterAuthOptions(options)) as BetterAuthReturn<BetterAuthPlugins>;