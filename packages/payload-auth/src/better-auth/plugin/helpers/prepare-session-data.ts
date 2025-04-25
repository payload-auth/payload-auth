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
  })

  return newUser as User & Record<string, any>
}

export async function prepareSession({
  user,
  session,
  payloadConfig,
  collectionSlugs
}: {
  user: User & Record<string, any>
  session: Session & Record<string, any>
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  const awaitedPayloadConfig = await payloadConfig
  const { sessionCollectionSlug, userCollectionSlug } = collectionSlugs
  const sessionCollection = awaitedPayloadConfig?.collections?.find((c) => c.slug === sessionCollectionSlug)

  if (!sessionCollection) return session

  const filteredSession = getFieldsToSign({
    collectionConfig: sessionCollection,
    email: user.email,
    user: {
      ...session,
      collection: sessionCollectionSlug
    }
  })

  delete filteredSession.email
  delete filteredSession.collection
  Object.assign(filteredSession, {
    userId: session.userId
  })

  return filteredSession as Session & Record<string, any>
}

/**
 * Prepares session data for cookie cache by filtering user and session objects
 * based on the payload configuration's 'saveToJwt' property
 */
export async function prepareSessionData({
  sessionData,
  payloadConfig,
  collectionSlugs
}: {
  sessionData: {
    session: Session & Record<string, any>
    user: User & Record<string, any>
  }
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  if (!sessionData || !sessionData.user) return null

  const newUser = await prepareUser({ user: sessionData.user, payloadConfig, collectionSlugs })
  const newSession = await prepareSession({ user: sessionData.user, session: sessionData.session, payloadConfig, collectionSlugs })

  const newSessionData = {
    session: newSession,
    user: newUser
  }

  return newSessionData
}
