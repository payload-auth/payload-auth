'use server'

import { getPayload } from '../payload'

export async function signUp({
  email,
  password,
  role,
  name,
  image
  //   callbackURL,
}: {
  email: string
  password: string
  role: string
  name: string
  image?: string
  //   callbackURL: string;
}) {
  const payload = await getPayload()

  const resFoo = await payload.betterAuth.api.createUser({
    asResponse: true,
    body: {
      email,
      password,
      role: 'admin',
      name
    }
  })

  if (!resFoo.ok) {
    return new Response(resFoo.statusText, { status: resFoo.status })
  }
}

export async function addAdminRole(userId: string) {
  const payload = await getPayload()

  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      role: 'admin'
    }
  })
}
