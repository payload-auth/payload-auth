import type { BasePayload, SanitizedConfig } from "payload";
import { getPayload } from "payload";
import type { BetterAuthReturn, PayloadAuthOptions } from "../types";

export async function getPayloadAuth<O extends PayloadAuthOptions>(
  config: Promise<SanitizedConfig> | SanitizedConfig
): Promise<BasePayload & { betterAuth: BetterAuthReturn<O> }> {
  const payload = (await getPayload({ config })) as BasePayload & {
    betterAuth: BetterAuthReturn<O>;
  };
  return payload;
}
