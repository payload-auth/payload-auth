import type { AuthStrategy } from 'payload'
import { getPayloadBetterAuth } from '../index.js'

const betterAuthStrategy = (): AuthStrategy => {
  return {
    name: 'better-auth',
    authenticate: async ({ payload, headers }) => {
      const config = payload.config
      const payloadAuth = await getPayloadBetterAuth(config)
      const session = await payloadAuth.betterAuth.api.getSession({ headers })

      if (!session) {
        return { user: null }
      }

      const user = await payload.findByID({
        collection: 'user',
        id: session.session.userId,
      })

      return {
        // Send the user with the collection slug back to authenticate,
        // or send null if no user should be authenticated
        user: user
          ? {
              collection: 'user',
              ...user,
            }
          : null,

        // Optionally, you can return headers
        // that you'd like Payload to set here when
        // it returns the response
        responseHeaders: new Headers({
          token: session.session.token,
        }),
      }
    },
  }
}

export default betterAuthStrategy
