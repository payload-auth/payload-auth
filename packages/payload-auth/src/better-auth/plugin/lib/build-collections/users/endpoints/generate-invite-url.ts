import { status as httpStatus } from 'http-status'
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types'
import { addDataAndFileToRequest } from 'payload'
import { generateAdminInviteUrl } from '@/better-auth/plugin/payload/utils/generate-admin-invite-url'

import { type Endpoint } from 'payload'
import { adminEndpoints, baseSlugs } from '@/better-auth/plugin/constants'

type InviteEndpointProps = {
  roles: { label: string; value: string }[]
  pluginOptions: BetterAuthPluginOptions
}

export const getGenerateInviteUrlEndpoint = ({ roles, pluginOptions }: InviteEndpointProps): Endpoint => {
  const endpoint: Endpoint = {
    path: adminEndpoints.generateInviteUrl,
    method: 'post',
    handler: async (req) => {
      await addDataAndFileToRequest(req)
      const body = req.data as { role: { label: string; value: string } | { label: string; value: string }[] }
      const generateAdminInviteUrlFn = pluginOptions?.adminInvitations?.generateInviteUrl ?? generateAdminInviteUrl

      if (!body) {
        return Response.json({ message: 'No body provided' }, { status: httpStatus.BAD_REQUEST })
      }

      if (typeof body !== 'object' || !('role' in body)) {
        return Response.json({ message: 'Invalid body' }, { status: httpStatus.BAD_REQUEST })
      }

      // Handle both single role and multi-role
      const selectedRoles = Array.isArray(body.role) ? body.role : [body.role]
      const roleValues = selectedRoles.map(r => r.value)
      
      // Validate all selected roles
      const invalidRoles = roleValues.filter(value => !roles.some((role) => role.value === value))
      if (invalidRoles.length > 0) {
        return Response.json({ message: `Invalid role(s): ${invalidRoles.join(', ')}` }, { status: httpStatus.BAD_REQUEST })
      }
      
      const token = crypto.randomUUID()
      const inviteLink = generateAdminInviteUrlFn({
        payload: req.payload,
        token
      })

      try {
        // Store as array if multi-role, otherwise as single value
        const roleData = pluginOptions.users?.multiRole ? roleValues : roleValues[0]
        
        await req.payload.create({
          collection: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
          data: {
            token,
            role: roleData,
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
