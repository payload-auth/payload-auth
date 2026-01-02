import { z } from 'zod'
import { type Endpoint } from 'payload'
import { status as httpStatus } from 'http-status'
import { PayloadAuthOptions } from '../../../../types'
import { getPayloadAuth } from '../../../get-payload-auth'
import { adminEndpoints, baseSlugs } from '@/better-auth/plugin/constants'

const setAdminRoleSchema = z.object({
  token: z.string().optional(),
  redirect: z.string().optional()
})

export const getSetAdminRoleEndpoint = (pluginOptions: PayloadAuthOptions, userSlug: string): Endpoint => {
  const endpoint: Endpoint = {
    path: adminEndpoints.setAdminRole,
    method: 'get',
    handler: async (req) => {
      const { config } = req.payload
      const schema = setAdminRoleSchema.safeParse(req.query)
      if (!schema.success) {
        return Response.json({ message: schema.error.message }, { status: httpStatus.BAD_REQUEST })
      }
      const payloadAuth = await getPayloadAuth(config)
      const session = await payloadAuth.betterAuth.api.getSession({
        headers: req.headers
      })
      if (!session) {
        return Response.json({ message: 'No session found' }, { status: httpStatus.UNAUTHORIZED })
      }
      const { token, redirect } = schema.data
      const invite = await req.payload.find({
        collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
        where: {
          token: { equals: token }
        },
        limit: 1
      })
      if (invite.docs.length === 0) {
        return Response.json({ message: 'Invalid token' }, { status: httpStatus.UNAUTHORIZED })
      }
      const role = invite.docs[0].role as string
      try {
        const updatedUser = await req.payload.update({
          collection: userSlug,
          id: session.user.id,
          data: {
            role: [role]
          },
          overrideAccess: true
        })
        await req.payload.delete({
          collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
          where: {
            token: {
              equals: token
            }
          }
        })
        const response = new Response(null, {
          status: 307,
          headers: {
            Location: redirect ?? config.routes.admin
          }
        })
        return response
      } catch (error) {
        return Response.json({ message: 'Error updating user role' }, { status: httpStatus.INTERNAL_SERVER_ERROR })
      }
    }
  }

  return endpoint
}
