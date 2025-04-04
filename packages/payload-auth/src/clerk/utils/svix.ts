import type { PayloadRequest } from 'payload'
import { Webhook } from 'svix'

/**
 * Validates a webhook request using Svix
 */
export async function validateWebhook({
  request,
  secret,
}: {
  request: PayloadRequest
  secret?: string
}): Promise<boolean> {
  // Verify we have the needed methods on the request
  if (!request.clone || typeof request.clone !== 'function') {
    console.error('Svix validation error: request.clone method not available')
    return false
  }

  const webhookSecret = secret || 
    process.env.CLERK_WEBHOOK_SECRET || 
    process.env.SVIX_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.warn('Clerk webhook called without Svix validation - not recommended for production')
    return process.env.NODE_ENV !== 'production'
  }

  try {
    const headers = request.headers

    const svixId = headers.get('svix-id')
    const svixTimestamp = headers.get('svix-timestamp')
    const svixSignature = headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return false
    }

    const webhook = new Webhook(webhookSecret)

    const svixHeaders = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }

    // Clone the request to avoid consuming the body
    const clonedRequest = request.clone()
    const body = await clonedRequest.text()
    
    await webhook.verify(body, svixHeaders)
    return true
  } catch (error) {
    console.error('Svix webhook verification failed:', error)
    return false
  }
} 