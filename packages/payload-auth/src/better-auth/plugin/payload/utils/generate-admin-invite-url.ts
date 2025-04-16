import type { Payload } from 'payload'
import type { GenerateAdminInviteUrlFn } from '@/better-auth/plugin/types'
import { adminRoutes } from '@/better-auth/plugin/constants'

export const generateAdminInviteUrl: GenerateAdminInviteUrlFn = ({ payload, token }: { payload: Payload; token: string }) => {
  const {
    routes: { admin: adminRoute },
    serverURL
  } = payload.config

  return `${serverURL}${adminRoute}${adminRoutes.adminSignup}?token=${token}`
}
