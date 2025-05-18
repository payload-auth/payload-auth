import { baModelKey } from '@/better-auth/plugin/constants'
import { getCollectionByModelKey } from '@/better-auth/plugin/helpers/get-collection'
import { getPayloadAuth } from '@/better-auth/plugin/lib/get-payload-auth'
import { cookies } from 'next/headers'
import type { CollectionAfterLogoutHook, PayloadRequest } from 'payload'

export function getAfterLogoutHook() {
  const hook: CollectionAfterLogoutHook = async ({ req }) => {
    const store = await cookies()
    const payload = await getPayloadAuth(req.payload.config)

    const { sessionToken, sessionData, dontRememberToken } = (await payload.betterAuth.$context).authCookies

    const sessionsSlug = getCollectionByModelKey(req.payload.collections, baModelKey.session).slug

    await deleteSessionFromDb(payload, sessionsSlug, store.get(sessionToken.name)?.value, req)

    const baseNames = [
      sessionToken.name,
      sessionData.name,
      dontRememberToken.name,
      //This is a hacky wat to delete the admin session cookie (BETTER AUTH HARDCODED THIS)
      // see https://github.com/better-auth/better-auth/blob/25e82669eed83ba6da063c167e8ae5b7da84ef9f/packages/better-auth/src/plugins/admin/admin.ts#L917C7-L917C23
      'admin_session'
    ]

    const multiBase = `${sessionToken.name}_multi`
    const multiCandidates = store
      .getAll()
      .filter((c) => c.name.startsWith(multiBase) || c.name.startsWith(`__Secure-${multiBase}`))
      .map((c) => c.name)

    const allNames = [
      ...baseNames.flatMap((n) => {
        const clean = n.replace(/^__Secure-/, '')
        return [clean, `__Secure-${clean}`]
      }),
      ...multiCandidates
    ]

    allNames.forEach((n) => deleteCookie(store, n))
  }

  return hook
}

async function deleteSessionFromDb(
  payload: Awaited<ReturnType<typeof getPayloadAuth>>,
  slug: string,
  rawCookieValue: string | undefined,
  req: PayloadRequest
) {
  if (!rawCookieValue) return
  const [token] = rawCookieValue.split('.')
  const { docs } = await payload.find({
    collection: slug,
    where: { token: { equals: token } },
    limit: 1,
    req
  })
  const session = docs.at(0)
  if (!session) return
  try {
    await payload.delete({
      collection: slug,
      where: { id: { equals: session.id } },
      req
    })
  } catch {}
}

/**
 * Deleting __Secure-* cookies need to set options.secure = true
 */
function deleteCookie(store: Awaited<ReturnType<typeof cookies>>, name: string) {
  const cookie = store.get(name)
  if (!cookie) return

  const isSecure = name.startsWith('__Secure-') || name.startsWith('__Host-')

  const options: Record<string, unknown> = {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax'
  }

  if (isSecure) options.secure = true

  store.set(name, '', options)
}
