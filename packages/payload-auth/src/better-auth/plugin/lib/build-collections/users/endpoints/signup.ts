import { adminEndpoints, baseSlugs, supportedBAPluginIds } from '@/better-auth/plugin/constants'
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { status as httpStatus } from 'http-status'
import { addDataAndFileToRequest, commitTransaction, initTransaction, killTransaction, type Endpoint } from 'payload'
import { z } from 'zod'
import { getRequestCollection } from '../../../../helpers/get-requst-collection'
import { createSignupSchema } from '@/shared/form/validation'
import { checkPluginExists } from '@/better-auth/plugin/helpers/check-plugin-exists'

const sendJSON = (data: unknown, status: number): Response =>
  new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status
  })

const forwardCookies = (from: Response, to: Response): void => {
  const setCookieHeader = from.headers.get('set-cookie')
  if (!setCookieHeader) return
  setCookieHeader.split(',').forEach((c) => to.headers.append('Set-Cookie', c.trim()))
}

const routeParamsSchema = z.object({
  token: z.string(),
  redirect: z.string().optional()
})

export const getSignupEndpoint = (pluginOptions: BetterAuthPluginOptions): Endpoint => {
  const { betterAuthOptions = {}, adminInvitations, users } = pluginOptions
  const { baseURL = '', basePath = '/api/auth', emailVerification, emailAndPassword } = betterAuthOptions

  if (!baseURL) {
    throw new Error('betterAuthOptions.baseURL is required for server‑side authentication calls')
  }

  const adminInvitationsSlug = adminInvitations?.slug ?? baseSlugs.adminInvitations
  const usersSlug = users?.slug ?? baseSlugs.users

  const endpoint: Endpoint = {
    path: adminEndpoints.signup,
    method: 'post',
    handler: async (req) => {
      await addDataAndFileToRequest(req)
      const collection = getRequestCollection(req)
      const { t } = req

      const shouldCommit = await initTransaction(req)

      try {
        const { success: routeParamsSuccess, data: routeParamsData, error: routeParamsError } = routeParamsSchema.safeParse(req.query)

        if (!routeParamsSuccess) {
          await killTransaction(req)
          return sendJSON({ error: 'INVALID_PARAMS', message: routeParamsError.message }, httpStatus.BAD_REQUEST)
        }

        const inviteResult = await req.payload.find({
          collection: adminInvitationsSlug,
          where: { token: { equals: routeParamsData.token } },
          limit: 1,
          req
        })

        const inviteDoc = inviteResult.docs.at(0)

        if (!inviteDoc) {
          await killTransaction(req)
          return sendJSON({ error: 'INVALID_TOKEN', message: 'Invalid token' }, httpStatus.UNAUTHORIZED)
        }

        const hasUsernamePlugin = checkPluginExists(betterAuthOptions, supportedBAPluginIds.username)
        const supportsLoginWithUsername = hasUsernamePlugin && collection.config?.auth?.loginWithUsername
        const requireUsername =
          hasUsernamePlugin &&
          typeof collection.config?.auth?.loginWithUsername === 'object' &&
          !!collection.config?.auth?.loginWithUsername?.requireUsername

        const signupSchema = createSignupSchema({ t, requireUsername, requireConfirmPassword: false })
        const parsedBody = signupSchema.safeParse(req.data)

        if (!parsedBody.success) {
          await killTransaction(req)
          const messages = parsedBody.error.issues.map((issue) => issue.message)
          return sendJSON({ error: { message: messages } }, httpStatus.BAD_REQUEST)
        }

        const { name, email, password, username } = parsedBody.data

        const authApiURL = `${baseURL}${basePath}`
        const url = new URL(`${authApiURL}/sign-up/email`)
        url.searchParams.set('callbackURL', routeParamsData.redirect ?? `${baseURL}${req.payload.config.routes.admin}`)
        if (routeParamsData.token) {
          url.searchParams.set('adminInviteToken', routeParamsData.token)
        }

        const apiResponse = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            ...(supportsLoginWithUsername && username && { username })
          })
        })

        if (!apiResponse.ok) {
          throw new Error(apiResponse.statusText)
        }

        const responseData = await apiResponse.json()

        await req.payload.update({
          collection: usersSlug,
          id: responseData.user.id,
          data: { role: inviteDoc.role },
          overrideAccess: true,
          req
        })

        await req.payload.delete({
          collection: adminInvitationsSlug,
          where: { token: { equals: inviteDoc.token } },
          req
        })

        const requireEmailVerification =
          (emailAndPassword?.requireEmailVerification || collection.config.auth.verify) && !responseData.user.emailVerified

        const sentEmailVerification = emailVerification?.sendVerificationEmail !== undefined

        if (requireEmailVerification) {
          const res = sendJSON(
            {
              message: t('authentication:verifyYourEmail'),
              sentEmailVerification,
              requireEmailVerification
            },
            httpStatus.UNAUTHORIZED
          )
          forwardCookies(apiResponse, res)
          if (shouldCommit) await commitTransaction(req)
          return res
        }

        const successRes = sendJSON({ message: t('authentication:passed'), ...responseData }, httpStatus.OK)
        forwardCookies(apiResponse, successRes)
        if (shouldCommit) await commitTransaction(req)
        return successRes
      } catch (error: any) {
        await killTransaction(req)
        return sendJSON({ message: error.message }, httpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  return endpoint
}
