'use server'

import { getPayload } from '@/lib/payload'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout({ redirectTo }: { redirectTo: string }) {
  const cookieStore = await cookies()
  const payload = await getPayload()
  const betterAuthCtx = await payload.betterAuth.$context
  cookieStore.delete('payload-token')
  cookieStore.delete(betterAuthCtx.authCookies.sessionToken.name)
  cookieStore.delete(betterAuthCtx.authCookies.sessionData.name)
  cookieStore.delete(betterAuthCtx.authCookies.dontRememberToken.name)
  redirect(redirectTo)
}
