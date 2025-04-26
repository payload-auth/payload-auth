import { Session, User } from 'better-auth'
import { getFieldsToSign } from 'payload'
import type { CollectionConfig } from 'payload'
import { getMappedCollection } from './get-collection'
import { baseSlugs } from '../constants'

export async function prepareUser({
  user,
  collectionMap
}: {
  user: User & Record<string, any>
  collectionMap: Record<string, CollectionConfig>
}) {
  const userCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baseSlugs.users })

  const newUser = getFieldsToSign({
    collectionConfig: userCollection,
    email: user.email,
    user: {
      ...user,
      collection: userCollection.slug
    }
  })

  return newUser as User & Record<string, any>
}

export async function prepareSession({
  session,
  collectionMap
}: {
  session: Session & Record<string, any>
  collectionMap: Record<string, CollectionConfig>
}) {
  const sessionCollection = getMappedCollection({ collectionMap, betterAuthModelKey: baseSlugs.sessions })

  const filteredSession = getFieldsToSign({
    collectionConfig: sessionCollection,
    email: '',
    user: {
      ...session,
      collection: sessionCollection.slug
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
  collectionMap
}: {
  sessionData: {
    session: Session & Record<string, any>
    user: User & Record<string, any>
  }
  collectionMap: Record<string, CollectionConfig>
}) {
  if (!sessionData || !sessionData.user) return null

  const newUser = await prepareUser({ user: sessionData.user, collectionMap })
  const newSession = await prepareSession({ session: sessionData.session, collectionMap })

  const newSessionData = {
    session: newSession,
    user: newUser
  }

  return newSessionData
}
