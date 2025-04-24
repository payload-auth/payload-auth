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
  user: any
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  if (!user) return null

  const awaitedPayloadConfig = await payloadConfig
  const { userCollectionSlug } = collectionSlugs
  const userCollection = awaitedPayloadConfig?.collections?.find(
    (c) => c.slug === userCollectionSlug
  )

  if (!userCollection) throw new Error(`User collection with slug '${userCollectionSlug}' not found`)

  return getFieldsToSign({
    collectionConfig: userCollection,
    email: user.email,
    user
  })
}

export async function prepareSession({
  user,
  session,
  payloadConfig,
  collectionSlugs
}: {
  user: any;
  session: any;
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  if (!session) return null

  const awaitedPayloadConfig = await payloadConfig
  const { sessionCollectionSlug } = collectionSlugs
  const sessionCollection = awaitedPayloadConfig?.collections?.find(
    (c) => c.slug === sessionCollectionSlug
  )

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
  newSession,
  payloadConfig,
  collectionSlugs
}: {
  newSession: {
    user: any
    session: any
  }
  payloadConfig: Payload['config'] | Config | Promise<Payload['config'] | Config>
  collectionSlugs: CollectionSlugs
}) {
  if (!newSession || !newSession.user) return null

  const user = await prepareUser({ user: newSession.user, payloadConfig, collectionSlugs })
 // const session = await prepareSession({ user: newSession.user, session: newSession.session, payloadConfig, collectionSlugs })

  return {
    ...newSession,
    user,
    //session
  }
}
