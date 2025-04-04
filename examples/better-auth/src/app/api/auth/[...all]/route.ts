import { toNextJsHandler } from 'better-auth/next-js'
import { getPayload } from '@/lib/payload'

const payload = await getPayload()

export const { POST, GET } = toNextJsHandler(payload.betterAuth)
