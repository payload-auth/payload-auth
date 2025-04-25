import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { afterAll, beforeAll, describe, expect, it, test } from 'vitest'
import { payloadAdapter } from '../index'
import { runBaseCollectionsNumberIdTests, runBaseCollectionsTests } from './base-collections-tests'
import { getPayload } from './dev'
import { BasePayload } from 'payload'

describe('Handle Payload Adapter', async () => {
  it('should successfully add the Payload Adapter', async () => {
    const payload = await getPayload()

    const auth = betterAuth({
      database: payloadAdapter(payload, {
        idType: 'number'
      })
    })

    expect(auth).toBeDefined()
    expect(auth.options.database).toBeDefined()
    expect(auth.options.database({}).id).toEqual('payload-adapter')
  })
})

function deleteAll(payload: BasePayload) {
  beforeAll(async () => {
    await payload.delete({
      collection: 'users',
      where: {
        id: {
          exists: true
        }
      }
    })

    await payload.delete({
      collection: 'sessions',
      where: {
        id: {
          exists: true
        }
      }
    })

    await payload.delete({
      collection: 'accounts',
      where: {
        id: {
          exists: true
        }
      }
    })

    await payload.delete({
      collection: 'verifications',
      where: {
        id: {
          exists: true
        }
      }
    })
  })
  afterAll(async () => {
    await payload.delete({
      collection: 'sessions',
      where: {
        id: {
          exists: true
        }
      }
    })

    await payload.delete({
      collection: 'accounts',
      where: {
        id: {
          exists: true
        }
      }
    })
    await payload.delete({
      collection: 'users',
      where: {
        id: {
          exists: true
        }
      }
    })

    await payload.delete({
      collection: 'verifications',
      where: {
        id: {
          exists: true
        }
      }
    })
  })
}

describe('Run BetterAuth Base Collections Adapter tests', async () => {
  const payload = await getPayload()

  deleteAll(payload)

  const adapter = payloadAdapter(payload, {
    idType: 'number'
  })

  await runBaseCollectionsTests({
    getAdapter: async (
      customOptions = {
        ...payload.betterAuth.options
      }
    ) => {
      return adapter({ ...customOptions })
    },
    disableTests: {
      SHOULD_PREFER_GENERATE_ID_IF_PROVIDED: true
    }
  })
})

describe('Run BetterAuth Base Collections Adapter tests with number id', async () => {
  const payload = await getPayload()

  deleteAll(payload)

  const adapter = payloadAdapter(payload, {
    idType: 'number'
  })

  await runBaseCollectionsNumberIdTests(
    {
      getAdapter: async (
        customOptions = {
          ...payload.betterAuth.options,
          advanced: {
            database: {
              useNumberId: true
            }
          }
        }
      ) => {
        return adapter({ ...customOptions })
      },
      disableTests: {
        SHOULD_PREFER_GENERATE_ID_IF_PROVIDED: true
      }
    },
    {
      predefinedOptions: {
        ...payload.betterAuth.options,
        advanced: {
          database: {
            useNumberId: true
          }
        }
      }
    }
  )
})

describe('Authentication Flow Tests', async () => {
  const testUser = {
    email: 'test-email@email.com',
    password: 'password12345',
    name: 'Test Name'
  }
  const payload = await getPayload()

  deleteAll(payload)

  it('should successfully sign up a new user', async () => {
    const user = await payload.betterAuth.api.signUpEmail({
      body: {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      }
    })
    expect(user).toBeDefined()
  })

  it('should successfully sign in an existing user', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const user = await payload.betterAuth.api.signInEmail({
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    expect(user.user).toBeDefined()
  })
})
