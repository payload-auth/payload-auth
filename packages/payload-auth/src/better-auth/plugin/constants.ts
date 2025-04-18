export const supportedBetterAuthPluginIds = {
  harmonyEmail: 'harmony-email',
  harmonyPhoneNumber: 'harmony-phone-number',
  twoFactor: 'two-factor',
  username: 'username',
  anonymous: 'anonymous',
  phoneNumber: 'phone-number',
  magicLink: 'magic-link',
  emailOtp: 'email-otp',
  passkey: 'passkey',
  oneTap: 'one-tap',
  admin: 'admin',
  apiKey: 'api-key',
  organization: 'organization',
  multiSession: 'multi-session',
  openApi: 'open-api',
  jwt: 'jwt',
  nextCookies: 'next-cookies',
  sso: 'sso',
  oidc: 'oidc',
  expo: 'expo'
} as const

export const baseCollectionSlugs = {
  users: 'users',
  sessions: 'sessions',
  accounts: 'accounts',
  verifications: 'verifications',
  adminInvitations: 'admin-invitations'
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
  teams: 'teams'
} as const

export const adminRoutes = {
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  adminSignup: '/signup',
  adminLogin: '/login',
  loginRedirect: '/login-redirect'
} as const

export const adminEndpoints = {
  setAdminRole: '/set-admin-role',
  refreshToken: '/refresh-token',
  sendInvite: '/send-invite',
  generateInviteUrl: '/generate-invite-url',
  signup: '/signup'
} as const

export const defaults = {
  adminRole: 'admin'
} as const
