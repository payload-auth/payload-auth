export const supportedBetterAuthPluginIds = [
  'harmony-email',
  'harmony-phone-number',
  'two-factor',
  'username',
  'anonymous',
  'phone-number',
  'magic-link',
  'email-otp',
  'passkey',
  'one-tap',
  'admin',
  'api-key',
  'organization',
  'multi-session',
  'open-api',
  'jwt',
  'next-cookies',
  // 'sso', // NOT YET FULLY SUPPORTED
  // 'oidc', // NOT YET FULLY SUPPORTED
] as const

export const baseCollectionSlugs = {
  users: 'users',
  sessions: 'sessions',
  accounts: 'accounts',
  verifications: 'verifications',
} as const

export const betterAuthPluginSlugs = {
  apiKeys: 'apiKeys',
  jwks: 'jwks',
  twoFactors: 'twoFactors',
  passkeys: 'passkeys',
  oauthApplications: 'oauthApplications',
  oauthAccessTokens: 'oauthAccessTokens',
  oauthConsents: 'oauthConsents',
  ssoProviders: 'ssoProviders',
  organizations: 'organizations',
  invitations: 'invitations',
  members: 'members',
  teams: 'teams',
} as const
