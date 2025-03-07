import type { AuthStrategy } from 'payload'
import { betterAuth } from './better-auth.js'

const betterAuthStrategy = (): AuthStrategy => {
  return {
    name: 'better-auth',
    authenticate: async ({ payload, headers }) => {
      const auth = betterAuth(payload)
      const session = await auth.api.getSession({ headers })

      if (!session) {
        return { user: null }
      }

      const user = await payload.findByID({
        collection: 'users',
        id: session.session.userId,
      })

      return {
        // Send the user with the collection slug back to authenticate,
        // or send null if no user should be authenticated
        user: user
          ? {
              collection: 'users',
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
