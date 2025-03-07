import { toNextJsHandler } from 'better-auth/next-js'
import config from 'payload.config.js'
import { getPayload } from 'payload'
import { betterAuth } from '../../../../../src/lib/better-auth.js'

const payload = await getPayload({ config })
const auth = betterAuth(payload)

export const { POST, GET } = toNextJsHandler(auth)
