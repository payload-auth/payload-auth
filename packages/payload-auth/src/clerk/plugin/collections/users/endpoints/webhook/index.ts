import { APIError, Endpoint } from 'payload'
import { ClerkPluginOptions } from '../../../../../types'
import { validateWebhook } from '../../../../../utils/svix'
import { handleUserCreated, handleUserDeleted, handleUserUpdated } from './handlers'

interface ClerkWebhookEndpointOptions {
  userSlug: string
  options: ClerkPluginOptions
}

/**
 * Creates a webhook endpoint for handling Clerk events
 */
export const clerkWebhookEndpoint = ({ userSlug, options }: ClerkWebhookEndpointOptions): Endpoint => {
  const mappingFunction = options.users?.clerkToPayloadMapping // This is forced to be set by the plugin.ts

  if (!mappingFunction) {
    // This should never happen. Just to make TS happy.
    throw new Error('Clerk to Payload mapping function is not set')
  }

  return {
    path: '/clerk-webhook',
    method: 'post',
    handler: async (req) => {
      try {
        const { payload } = req

        if (!req.text) {
          throw new APIError('Invalid request body', 400)
        }

        // Validate the webhook before reading the body
        if (
          !(await validateWebhook({
            request: req,
            secret: options.webhook?.svixSecret
          }))
        ) {
          throw new APIError('Invalid webhook signature', 401)
        }

        // Now we can read the body safely
        const rawBody = await req.text()

        const webhookData = parseWebhookData(rawBody)
        const { type, data } = webhookData

        if (options.enableDebugLogs) {
          console.log(`Processing Clerk webhook: ${type}`)
        }

        switch (type) {
          case 'user.created':
            await handleUserCreated({
              data,
              payload,
              userSlug,
              mappingFunction,
              options
            })
            break

          case 'user.updated':
            await handleUserUpdated({
              data,
              payload,
              userSlug,
              mappingFunction: mappingFunction as any, // @TODO: Type this properly
              options
            })
            break

          case 'user.deleted':
            await handleUserDeleted({
              data,
              payload,
              userSlug,
              options
            })
            break

          default:
            if (options.enableDebugLogs) {
              console.log(`Unhandled Clerk webhook type: ${type}`)
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      } catch (error) {
        console.error('Error processing Clerk webhook:', error)
        throw new APIError('Internal server error', 500)
      }
    }
  }
}

function parseWebhookData(rawBody: any): { type: string; data: any } {
  return typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
}
