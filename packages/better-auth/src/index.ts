export * from './adapter';
export * from './plugin';
export * from './types';
import { payloadAdapter } from './adapter';
import { payloadBetterAuth } from './plugin';

export { payloadAdapter, payloadBetterAuth as betterAuthPlugin };