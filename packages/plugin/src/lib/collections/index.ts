import type { CollectionConfig } from 'payload'

import Accounts from './accounts.js'
import Sessions from './sessions.js'
import Users from './users.js'
import VerificationTokens from './verification-tokens.js'

const collectionConfigs: CollectionConfig[] = [Users, Accounts, Sessions, VerificationTokens]

export default collectionConfigs
