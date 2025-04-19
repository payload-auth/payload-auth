import { createAuthMiddleware } from 'better-auth/api'
import { getPayload } from 'payload'
import { APIError } from 'better-auth/api'

import type { SanitizedBetterAuthOptions } from '@/better-auth/plugin/types'
import type { Config, Payload } from 'payload'

interface ConfigureAdminInviteHooksParams {
  sanitizedOptions: SanitizedBetterAuthOptions
  verificationCollectionSlug: string
  adminInviteCollectionSlug: string
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
}

/**
 * Configure hooks that handle the admin‑invite flow.
 *
 * This util will mutate the provided {@link sanitizedOptions} object and attach three independent pieces:
 *
 *   • STEP 1 (database hook) – When a verification doc is created we inspect the callbackURL
 *     and move any `adminInviteToken` query parameter into the verification document itself.
 *
 *   • STEP 2 (middleware) – During the BetterAuth callback we fetch the verification document
 *     ("state" query param is the identifier) and expose the `adminInviteToken` on
 *     `ctx.context.adminInviteTokens` so that subsequent database hooks can access it.
 *
 *   • STEP 3 (database hook) – Right before a user is created we read the token stored in
 *     `ctx.context.adminInviteTokens` and persist it on the user object so that the
 *     `before-create-user` hook can finalize the invitation.
 */
export function configureAdminInviteHooks({
  sanitizedOptions,
  verificationCollectionSlug,
  adminInviteCollectionSlug,
  payloadConfig
}: ConfigureAdminInviteHooksParams): void {
  /* ------------------------------------------------------------------------- */
  /* Helpers                                                                   */
  /* ------------------------------------------------------------------------- */

  sanitizedOptions.databaseHooks = sanitizedOptions.databaseHooks || {}
  sanitizedOptions.databaseHooks.user = sanitizedOptions.databaseHooks.user || {}
  sanitizedOptions.databaseHooks.user.create = sanitizedOptions.databaseHooks.user.create || {}
  sanitizedOptions.databaseHooks.verification = sanitizedOptions.databaseHooks.verification || {}
  sanitizedOptions.databaseHooks.verification.create = sanitizedOptions.databaseHooks.verification.create || {}

  sanitizedOptions.hooks = sanitizedOptions.hooks || {}
  sanitizedOptions.user = sanitizedOptions.user || {}
  sanitizedOptions.user.additionalFields = sanitizedOptions.user.additionalFields || {}
  sanitizedOptions.user.additionalFields.adminInviteToken = {
    type: "string",
    required: false,
    input: false,
    returned: false
  }

  /* ------------------------------------------------------------------------- */
  /* STEP 1 – Validate admin invite token (OAuth callback & email sign‑up)    */
  /* ------------------------------------------------------------------------- */

  const addAuthCallbackValidationMiddleware = () => {
    sanitizedOptions.hooks = sanitizedOptions.hooks || {}
    const hooks = sanitizedOptions.hooks
    const originalBefore = hooks.before

    hooks.before = createAuthMiddleware(async (ctx) => {
      let adminInviteToken: string | undefined

      const path = ctx.path
      const isSocialSignIn = path.startsWith('/sign-in/social')
      const isEmailSignUp = path.startsWith('/sign-up/email')

      if(!isSocialSignIn && !isEmailSignUp) {
        if (typeof originalBefore === 'function') return originalBefore(ctx)
        return
      }

      if(isSocialSignIn) {
        const url = new URL(ctx.body.callbackURL, ctx.context.options.baseURL || ctx.request?.url)
        adminInviteToken = url.searchParams.get('adminInviteToken') || undefined
      }

      if(isEmailSignUp) {
        adminInviteToken = ctx.body?.adminInviteToken as string | undefined
      }

      if(!adminInviteToken) {
        if (typeof originalBefore === 'function') return originalBefore(ctx)
        return
      }

      const config = await payloadConfig
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – getPayload accepts config in this shape at runtime
      const payload = await getPayload({ config })

      const { totalDocs } = await payload.count({
        collection: adminInviteCollectionSlug,
        where: { token: { equals: adminInviteToken } }
      })

      if (!totalDocs) throw new APIError(400, { message: 'Invalid admin invite token.' })

      if (typeof originalBefore === 'function') return originalBefore(ctx)
    })
  }

   /* ------------------------------------------------------------------------- */
  /* STEP 2 – Capture token when verification is created                       */
  /* ------------------------------------------------------------------------- */

  const addVerificationCreateHook = () => {
    /**
     * We should not need to send the adminInviteToken in the callbackURL. 
     * This is due to that ctx is undefined for verification.create hooks. When/if this PR get's merged:
     * https://github.com/better-auth/better-auth/pull/2363
     * We can switch to using the ctx parameter instead.
     */
    sanitizedOptions.databaseHooks!.verification!.create!.before = async (verification) => {
      if (!verification?.value) return

      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(verification.value)
      } catch (error) {
        console.error('Error parsing verification value:', verification.value)
        return
      }

      const raw = parsed.callbackURL
      if (typeof raw !== 'string') return

      const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)

      if (hasProtocol) {
        let url: URL
        try {
          url = new URL(raw)
        } catch {
          return
        }

        const token = url.searchParams.get('adminInviteToken')
        if (!token) return

        parsed.adminInviteToken = token
        url.searchParams.delete('adminInviteToken')
        parsed.callbackURL = `${url.origin}${url.pathname}${url.search}${url.hash}`

        verification.value = JSON.stringify(parsed)
        return
      }

      const [pathWithQuery, hash = ''] = raw.split('#')
      const [path, query = ''] = pathWithQuery.split('?')
      const params = new URLSearchParams(query)
      const token = params.get('adminInviteToken')
      if (!token) return

      parsed.adminInviteToken = token
      params.delete('adminInviteToken')
      const search = params.toString()
      parsed.callbackURL = `${path}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`

      verification.value = JSON.stringify(parsed)
    }
  }

  /* ------------------------------------------------------------------------- */
  /* STEP 3 – Attach token to request context during BetterAuth callback       */
  /* ------------------------------------------------------------------------- */

  const addAuthCallbackMiddleware = () => {
    sanitizedOptions.hooks = sanitizedOptions.hooks || {}
    const hooks = sanitizedOptions.hooks
    const originalBefore = hooks.before

    hooks.before = createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith('/callback/:id')) {
        if (typeof originalBefore === 'function') {
          return originalBefore(ctx)
        }
        return
      }

      const identifier = ctx?.query?.state as string | undefined
      if (!identifier) return

      const config = await payloadConfig
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – getPayload accepts config in this shape at runtime
      const payload = await getPayload({ config })

      const { docs: verifications } = await payload.find({
        collection: verificationCollectionSlug,
        where: { identifier: { equals: identifier } }
      })

      const verification = verifications.at(0)
      const value = JSON.parse(verification?.value || '{}')
      const adminInviteToken = value.adminInviteToken as string | undefined

      ctx.context.adminInviteTokens = {
        ...(ctx.context.adminInviteTokens || {}),
        [identifier]: adminInviteToken
      }

      if (typeof originalBefore === 'function') {
        return originalBefore(ctx)
      }
    })
  }

  /* ------------------------------------------------------------------------- */
  /* STEP 4 – Persist token onto the user being created                        */
  /* ------------------------------------------------------------------------- */

  const addUserCreateHook = () => {
    const existingBefore = sanitizedOptions.databaseHooks!.user!.create!.before ?? null

    sanitizedOptions.databaseHooks!.user!.create!.before = async (user: any, ctx) => {
      if (!ctx) {
        return typeof existingBefore === 'function' ? existingBefore(user, ctx) : void 0
      }

      const adminInviteToken = ctx.context?.adminInviteTokens?.[ctx.query?.state]
      if (adminInviteToken) {
        user.adminInviteToken = adminInviteToken
      } else if (ctx.body?.adminInviteToken) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const payload = await getPayload({ config: payloadConfig })
        const { totalDocs: existingAdminInvite } = await payload.count({
          collection: adminInviteCollectionSlug,
          where: { token: { equals: ctx.body.adminInviteToken } }
        })
        // Ensure the admin invite token is valid
        if (existingAdminInvite) {
          user.adminInviteToken = ctx.body.adminInviteToken
        }
      }

      if (typeof existingBefore === 'function') {
        return existingBefore(user, ctx)
      }
    }
  }

  /* ------------------------------------------------------------------------- */
  /* Execute configuration                                                      */
  /* ------------------------------------------------------------------------- */

  addVerificationCreateHook()
  addAuthCallbackMiddleware()
  addAuthCallbackValidationMiddleware()
  addUserCreateHook()
}  