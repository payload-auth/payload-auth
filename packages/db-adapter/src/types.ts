import type { BasePayload } from "payload";
import type { AdapterInstance } from "better-auth";
export type PayloadAdapterOptions = {
	enable_debug_logs?: boolean;
};

export type PayloadAdapter = (
	payloadClient: BasePayload,
	config?: PayloadAdapterOptions,
) => AdapterInstance;
