// Auto-generated types. Do not edit.

export type BaseUserFields = {
  name: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
  role?: string
}

export type UserPluginFields = {
  "username": {
    username?: string
    displayUsername?: string
  }
  "admin": {
    banned?: boolean
    banReason?: string
    banExpires?: Date
  }
  "harmony-email": {
    normalizedEmail?: string
  }
  "phone-number": {
    phoneNumber?: string
    phoneNumberVerified?: boolean
  }
  "anonymous": {
    isAnonymous?: boolean
  }
  "two-factor": {
    twoFactorEnabled?: boolean
  }
  "last-login-method": {
    lastLoginMethod?: string
  }
  "stripe": {
    stripeCustomerId?: string
  }
}

export type User = BaseUserFields & UserPluginFields["username"] & UserPluginFields["admin"] & UserPluginFields["harmony-email"] & UserPluginFields["phone-number"] & UserPluginFields["anonymous"] & UserPluginFields["two-factor"] & UserPluginFields["last-login-method"] & UserPluginFields["stripe"]

export type BaseSessionFields = {
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
  userId: string
}

export type SessionPluginFields = {
  "admin": {
    impersonatedBy?: string
  }
  "organization": {
    activeOrganizationId?: string
    activeTeamId?: string
  }
}

export type Session = BaseSessionFields & SessionPluginFields["admin"] & SessionPluginFields["organization"]

export type BaseAccountFields = {
  accountId: string
  providerId: string
  userId: string
  accessToken?: string
  refreshToken?: string
  idToken?: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  scope?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

export type Account = BaseAccountFields

export type BaseVerificationFields = {
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export type Verification = BaseVerificationFields

export type BaseRateLimitFields = {
  key: string
  count: number
  lastRequest: number
}

export type RateLimit = BaseRateLimitFields

export type ApikeyFields = {
  configId: string
  name?: string
  start?: string
  referenceId: string
  prefix?: string
  key: string
  refillInterval?: number
  refillAmount?: number
  lastRefillAt?: Date
  enabled?: boolean
  rateLimitEnabled?: boolean
  rateLimitTimeWindow?: number
  rateLimitMax?: number
  requestCount?: number
  remaining?: number
  lastRequest?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  permissions?: string
  metadata?: string
}

export type Apikey = ApikeyFields

export type PasskeyFields = {
  name?: string
  publicKey: string
  userId: string
  credentialID: string
  counter: number
  deviceType: string
  backedUp: boolean
  transports?: string
  createdAt?: Date
  aaguid?: string
}

export type Passkey = PasskeyFields

export type OauthClientFields = {
  clientId: string
  clientSecret?: string
  clientDiscoveryId?: string
  disabled?: boolean
  skipConsent?: boolean
  enableEndSession?: boolean
  subjectType?: string
  scopes?: string[]
  clientCredentialsScopes?: string[]
  userId?: string
  createdAt?: Date
  updatedAt?: Date
  name?: string
  uri?: string
  icon?: string
  contacts?: string[]
  tos?: string
  policy?: string
  softwareId?: string
  softwareVersion?: string
  softwareStatement?: string
  redirectUris: string[]
  postLogoutRedirectUris?: string[]
  backchannelLogoutUri?: string
  backchannelLogoutSessionRequired?: boolean
  tokenEndpointAuthMethod?: string
  applicationType?: string
  jwks?: string
  jwksUri?: string
  grantTypes?: string[]
  responseTypes?: string[]
  requirePKCE?: boolean
  dpopBoundAccessTokens?: boolean
  referenceId?: string
  metadata?: unknown
}

export type OauthClient = OauthClientFields

export type OauthResourceFields = {
  identifier: string
  name: string
  accessTokenTtl?: number
  refreshTokenTtl?: number
  signingAlgorithm?: string
  signingKeyId?: string
  allowedScopes?: string[]
  customClaims?: unknown
  dpopBoundAccessTokensRequired?: boolean
  disabled?: boolean
  createdAt?: Date
  updatedAt?: Date
  policyVersion?: number
  metadata?: unknown
}

export type OauthResource = OauthResourceFields

export type OauthClientResourceFields = {
  clientId: string
  resourceId: string
  metadata?: unknown
  createdAt?: Date
}

export type OauthClientResource = OauthClientResourceFields

export type OauthRefreshTokenFields = {
  token: string
  clientId: string
  sessionId?: string
  userId: string
  referenceId?: string
  authorizationCodeId?: string
  resources?: string[]
  requestedUserInfoClaims?: string[]
  expiresAt?: Date
  createdAt?: Date
  revoked?: Date
  rotatedAt?: Date
  rotationReplayResponse?: string
  rotationReplayExpiresAt?: Date
  authTime?: Date
  confirmation?: unknown
  scopes: string[]
}

export type OauthRefreshToken = OauthRefreshTokenFields

export type OauthAccessTokenFields = {
  token?: string
  clientId: string
  sessionId?: string
  userId?: string
  referenceId?: string
  authorizationCodeId?: string
  resources?: string[]
  requestedUserInfoClaims?: string[]
  refreshId?: string
  expiresAt?: Date
  createdAt?: Date
  revoked?: Date
  confirmation?: unknown
  scopes: string[]
}

export type OauthAccessToken = OauthAccessTokenFields

export type OauthConsentFields = {
  clientId: string
  userId?: string
  referenceId?: string
  resources?: string[]
  requestedUserInfoClaims?: string[]
  scopes: string[]
  createdAt?: Date
  updatedAt?: Date
}

export type OauthConsent = OauthConsentFields

export type OauthClientAssertionFields = {
  expiresAt: Date
}

export type OauthClientAssertion = OauthClientAssertionFields

export type SsoProviderFields = {
  issuer: string
  oidcConfig?: string
  samlConfig?: string
  userId?: string
  providerId: string
  organizationId?: string
  domain: string
}

export type SsoProvider = SsoProviderFields

export type OrganizationFields = {
  name: string
  slug: string
  logo?: string
  createdAt: Date
  metadata?: string
}

export type Organization = OrganizationFields

export type OrganizationRoleFields = {
  organizationId: string
  role: string
  permission: string
  createdAt: Date
  updatedAt?: Date
}

export type OrganizationRole = OrganizationRoleFields

export type TeamFields = {
  name: string
  memberCount: number
  organizationId: string
  createdAt: Date
  updatedAt?: Date
}

export type Team = TeamFields

export type TeamMemberFields = {
  teamId: string
  userId: string
  membershipKey?: string
  createdAt?: Date
}

export type TeamMember = TeamMemberFields

export type MemberFields = {
  organizationId: string
  userId: string
  role: string
  createdAt: Date
}

export type Member = MemberFields

export type InvitationFields = {
  organizationId: string
  email: string
  role?: string
  teamId?: string
  status: string
  expiresAt: Date
  createdAt: Date
  inviterId: string
}

export type Invitation = InvitationFields

export type JwksFields = {
  publicKey: string
  privateKey: string
  createdAt: Date
  expiresAt?: Date
  alg?: string
  crv?: string
}

export type Jwks = JwksFields

export type TwoFactorFields = {
  secret: string
  backupCodes: string
  userId: string
  verified?: boolean
  failedVerificationCount?: number
  lockedUntil?: Date
}

export type TwoFactor = TwoFactorFields

export type ScimConnectionBindingFields = {
  connectionId: string
  connectionKey: string
  provisioningDomainId: string
  createdAt: Date
  decommissionedAt?: Date
  decommissionStatus: string
  decommissionCursorUserId?: string
  decommissionReconciledUserCount: number
  decommissionBatchCount: number
  decommissionRevision: number
  decommissionCompletedAt?: Date
  decommissionLeaseId?: string
  decommissionLeaseExpiresAt?: Date
}

export type ScimConnectionBinding = ScimConnectionBindingFields

export type ScimIdentityTombstoneFields = {
  connectionId: string
  provisioningDomainId: string
  externalId: string
  externalIdKey: string
  userId: string
  profile: string
  deletedAt: Date
}

export type ScimIdentityTombstone = ScimIdentityTombstoneFields

export type ScimSubjectFields = {
  userId: string
  profileSourceId?: string
  revision: number
  createdAt: Date
  updatedAt: Date
}

export type ScimSubject = ScimSubjectFields

export type ScimUserFields = {
  connectionId: string
  provisioningDomainId: string
  userId: string
  connectionUserKey: string
  userName: string
  userNameKey: string
  primaryEmail: string
  workEmailValueIndex: string
  emailValueIndex: string
  displayName: string
  formattedName: string
  givenName?: string
  familyName?: string
  serializedEmails: string
  serializedAttributes?: string
  externalId?: string
  externalIdKey?: string
  active: boolean
  orderKey: string
  createdAt: Date
  updatedAt: Date
}

export type ScimUser = ScimUserFields

export type ScimProjectionGrantFields = {
  connectionId: string
  provisioningDomainId: string
  scimUserId: string
  userId: string
  sourceKind: string
  sourceId: string
  sourceValue?: string
  role: string
  grantKey: string
  createdAt: Date
  updatedAt: Date
}

export type ScimProjectionGrant = ScimProjectionGrantFields

export type ScimGroupFields = {
  connectionId: string
  provisioningDomainId: string
  revision: number
  displayName: string
  displayNameKey: string
  externalId?: string
  externalIdKey?: string
  orderKey: string
  createdAt: Date
  updatedAt: Date
}

export type ScimGroup = ScimGroupFields

export type ScimGroupMemberFields = {
  connectionId: string
  groupId: string
  scimUserId: string
  membershipKey: string
  createdAt: Date
}

export type ScimGroupMember = ScimGroupMemberFields

export type DeviceCodeFields = {
  deviceCode: string
  userCode: string
  userId?: string
  expiresAt: Date
  status: string
  lastPolledAt?: Date
  pollingInterval?: number
  clientId?: string
  scope?: string
}

export type DeviceCode = DeviceCodeFields

export type SubscriptionFields = {
  plan: string
  referenceId: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  status?: string
  periodStart?: Date
  periodEnd?: Date
  trialStart?: Date
  trialEnd?: Date
  cancelAtPeriodEnd?: boolean
  cancelAt?: Date
  canceledAt?: Date
  endedAt?: Date
  seats?: number
  billingInterval?: string
  stripeScheduleId?: string
}

export type Subscription = SubscriptionFields

export type PluginId = "username" | "admin" | "api-key" | "passkey" | "harmony-email" | "harmony-phone-number" | "bearer" | "email-otp" | "magic-link" | "phone-number" | "one-tap" | "anonymous" | "multi-session" | "one-time-token" | "oauth-provider" | "sso" | "generic-oauth" | "open-api" | "organization" | "jwt" | "two-factor" | "next-cookies" | "custom-session" | "scim" | "device-authorization" | "last-login-method" | "stripe"

export type BetterAuthFullSchema = {
  "user": User
  "session": Session
  "account": Account
  "verification": Verification
  "rateLimit": RateLimit
  "apikey": Apikey
  "passkey": Passkey
  "oauthClient": OauthClient
  "oauthResource": OauthResource
  "oauthClientResource": OauthClientResource
  "oauthRefreshToken": OauthRefreshToken
  "oauthAccessToken": OauthAccessToken
  "oauthConsent": OauthConsent
  "oauthClientAssertion": OauthClientAssertion
  "ssoProvider": SsoProvider
  "organization": Organization
  "organizationRole": OrganizationRole
  "team": Team
  "teamMember": TeamMember
  "member": Member
  "invitation": Invitation
  "jwks": Jwks
  "twoFactor": TwoFactor
  "scimConnectionBinding": ScimConnectionBinding
  "scimIdentityTombstone": ScimIdentityTombstone
  "scimSubject": ScimSubject
  "scimUser": ScimUser
  "scimProjectionGrant": ScimProjectionGrant
  "scimGroup": ScimGroup
  "scimGroupMember": ScimGroupMember
  "deviceCode": DeviceCode
  "subscription": Subscription
}

export type ModelKey = keyof BetterAuthFullSchema