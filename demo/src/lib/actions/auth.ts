import { headers } from 'next/headers'
import { getPayload } from '@/lib/payload'

export const getSession = async () => {
  const payload = await getPayload()
  type Infer = (typeof payload.betterAuth.$Infer)['Session']
  const session = (await payload.betterAuth.api.getSession({
    headers: await headers()
  })) as Infer
  return session
}

const createUser = async () => {
  const payload = await getPayload()
  const user = await payload.create({
    collection: 'users',
    data: {
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User',
      role: ['user']
    }
  })
}
