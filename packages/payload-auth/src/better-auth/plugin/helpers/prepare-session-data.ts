import { Session, User } from 'better-auth'
import { getFieldsToSign } from 'payload'
import type { Config, Payload } from 'payload'

type CollectionSlugs = {
  userCollectionSlug: string
  sessionCollectionSlug: string
}

export async function prepareUser({
  user,
  payloadConfig,
  collectionSlugs
}: {
  user: User & Record<string, any>
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  const awaitedPayloadConfig = await payloadConfig
  const { userCollectionSlug } = collectionSlugs
  const userCollection = awaitedPayloadConfig?.collections?.find((c) => c.slug === userCollectionSlug)

  if (!userCollection) throw new Error(`User collection with slug '${userCollectionSlug}' not found`)

  const newUser = getFieldsToSign({
    collectionConfig: userCollection,
    email: user.email,
    user: {
      ...user,
      collection: userCollectionSlug
    }
  }) as User & Record<string, any>

  return newUser
}

export async function prepareSession({
  user,
  session,
  payloadConfig,
  collectionSlugs
}: {
  user: any
  session: any
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  if (!session) return null

  const awaitedPayloadConfig = await payloadConfig
  const { sessionCollectionSlug } = collectionSlugs
  const sessionCollection = awaitedPayloadConfig?.collections?.find((c) => c.slug === sessionCollectionSlug)

  if (!sessionCollection) return session

  const filteredSession = getFieldsToSign({
    collectionConfig: sessionCollection,
    email: user.email,
    user: session
  }) as typeof session

  delete filteredSession.email
  delete filteredSession.collection

  if (session.impersonatedBy) {
    filteredSession.impersonatedBy = session.impersonatedBy
  }

  return filteredSession
}

/**
 * Prepares session data for cookie cache by filtering user and session objects
 * based on the payload configuration's 'saveToJwt' property
 */
export async function prepareSessionData({
  session,
  payloadConfig,
  collectionSlugs
}: {
  session: {
    session: Session & Record<string, any>
    user: User & Record<string, any>
  }
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  if (!session || !session.user) return null

  const user = await prepareUser({ user: session.user, payloadConfig, collectionSlugs })
  // const session = await prepareSession({ user: newSession.user, session: newSession.session, payloadConfig, collectionSlugs })

  const newSession = {
    session: session.session,
    user: user
  }

  return newSession
}
