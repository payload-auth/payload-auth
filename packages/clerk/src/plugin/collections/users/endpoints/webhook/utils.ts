import { ClerkPluginOptions } from '../../../../../types';

export function parseWebhookData(rawBody: any): { type: string; data: any } {
  return typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
}

export function logWebhookEvent(type: string, options: ClerkPluginOptions): void {
  if (options.enableDebugLogs) {
    console.log(`Processing Clerk webhook: ${type}`)
  }
} 