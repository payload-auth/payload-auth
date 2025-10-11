import { getPayload } from '@/lib/payload'
import { betterAuthPlugins } from './options'
import { Session as PayloadSession, User } from '@/payload-types'

type PayloadWithBetterAuth = Awaited<ReturnType<typeof getPayload>>

export type Session = {
  session: Omit<PayloadSession, 'user' | 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'> & {
    id: string
    createdAt: string
    updatedAt: string
    expiresAt: string
  }
  user: (Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id: string; createdAt: string; updatedAt: string }) | null
}
export type ActiveOrganization = PayloadWithBetterAuth['betterAuth']['$Infer']['ActiveOrganization']
export type Invitation = PayloadWithBetterAuth['betterAuth']['$Infer']['Invitation']
export type Account = Awaited<ReturnType<PayloadWithBetterAuth['betterAuth']['api']['listUserAccounts']>>[number]
export type DeviceSession = Awaited<ReturnType<PayloadWithBetterAuth['betterAuth']['api']['listSessions']>>[number]
export type BetterAuthPlugins = typeof betterAuthPlugins
