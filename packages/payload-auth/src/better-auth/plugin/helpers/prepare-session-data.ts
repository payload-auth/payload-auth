import { Session, User } from 'better-auth'
import type { Collection, CollectionConfig } from 'payload'
import { getFieldsToSign } from 'payload'

export async function prepareUser({
  user,
  userCollection
}: {
  user: User & Record<string, any>
  userCollection: CollectionConfig
}) {
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
  sessionCollection
}: {
  session: Session & Record<string, any>
  sessionCollection: CollectionConfig
}) {
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
  userCollection,
  sessionCollection
}: {
  sessionData: {
    session: Session & Record<string, any>
    user: User & Record<string, any>
  }
  userCollection: CollectionConfig
  sessionCollection: CollectionConfig
}) {
  if (!sessionData || !sessionData.user) return null

  const newUser = await prepareUser({ user: sessionData.user, userCollection })
  const newSession = await prepareSession({ session: sessionData.session, sessionCollection })

  const newSessionData = {
    session: newSession,
    user: newUser
  }

  return newSessionData
}
