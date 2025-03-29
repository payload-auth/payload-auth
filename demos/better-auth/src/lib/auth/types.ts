import { getPayload } from '@/lib/payload'

const payload = await getPayload()

export type Session = typeof payload.betterAuth.$Infer.Session
export type ActiveOrganization = typeof payload.betterAuth.$Infer.ActiveOrganization
export type Invitation = typeof payload.betterAuth.$Infer.Invitation
export type Account = Awaited<ReturnType<typeof payload.betterAuth.api.listUserAccounts>>[number]
export type DeviceSession = Awaited<ReturnType<typeof payload.betterAuth.api.listDeviceSessions>>[number]
