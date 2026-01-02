import { status as httpStatus } from 'http-status'
import { PayloadAuthOptions } from '@/better-auth/plugin/types'
import { addDataAndFileToRequest } from 'payload'
import { generateAdminInviteUrl } from '@/better-auth/plugin/payload/utils/generate-admin-invite-url'

import { type Endpoint } from 'payload'
import { adminEndpoints, baseSlugs } from '@/better-auth/plugin/constants'

type InviteEndpointProps = {
  roles: { label: string; value: string }[]
  pluginOptions: PayloadAuthOptions
}

export const getGenerateInviteUrlEndpoint = ({ roles, pluginOptions }: InviteEndpointProps): Endpoint => {
  const endpoint: Endpoint = {
    path: adminEndpoints.generateInviteUrl,
    method: 'post',
    handler: async (req) => {
      await addDataAndFileToRequest(req)
      const body = req.data as { role: { label: string; value: string } }
      const generateAdminInviteUrlFn = pluginOptions?.adminInvitations?.generateInviteUrl ?? generateAdminInviteUrl

      if (!body) {
        return Response.json({ message: 'No body provided' }, { status: httpStatus.BAD_REQUEST })
      }

      if (typeof body !== 'object' || !('role' in body)) {
        return Response.json({ message: 'Invalid body' }, { status: httpStatus.BAD_REQUEST })
      }

      if (!roles.some((role) => role.value === body.role.value)) {
        return Response.json({ message: 'Invalid role' }, { status: httpStatus.BAD_REQUEST })
      }
      const token = crypto.randomUUID()
      const inviteLink = generateAdminInviteUrlFn({
        payload: req.payload,
        token
      })

      try {
        await req.payload.create({
          collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
          data: {
            token,
            role: body.role.value,
            url: inviteLink
          }
        })
        const response = new Response(
          JSON.stringify({
            message: 'Invite link generated successfully',
            inviteLink
          }),
          {
            status: 200
          }
        )
        return response
      } catch (error) {
        console.error(error)
        return Response.json({ message: 'Error generating invite link' }, { status: httpStatus.INTERNAL_SERVER_ERROR })
      }
    }
  }

  return endpoint
}
