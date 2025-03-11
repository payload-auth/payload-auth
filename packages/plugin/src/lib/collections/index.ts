import type { CollectionConfig } from 'payload'

import User from './user.js'
import Session from './session.js'
import Account from './account.js'
import VerificationToken from './verification-token.js'
import Organization from './organization.js'
import Member from './member.js'
import Invitation from './invitation.js'
import TwoFactor from './two-factor.js'
import Passkey from './passkey.js'
import OauthApplication from './oauth-application.js'
import OauthAccessToken from './oauth-access-token.js'
import OauthConsent from './oauth-consent.js'

const collectionConfigs: CollectionConfig[] = [
  User,
  Session,
  Account,
  VerificationToken,
  Organization,
  Member,
  Invitation,
  TwoFactor,
  Passkey,
  OauthApplication,
  OauthAccessToken,
  OauthConsent,
]

export default collectionConfigs
