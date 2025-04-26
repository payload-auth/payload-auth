export const socialProviders = [
  'apple',
  'discord',
  'facebook',
  'github',
  'google',
  'linkedin',
  'microsoft',
  'spotify',
  'tiktok',
  'twitter',
  'twitch',
  'zoom',
  'gitlab',
  'roblox',
  'vk',
  'kick',
  'reddit'
] as const

export const loginMethods = [
  'emailPassword',
  'magicLink',
  'emailOTP',
  'phonePassword',
  'phoneOTP',
  'phoneMagicLink',
  'passkey',
  ...socialProviders
] as const

export const supportedBAPluginIds = {
  oneTimeToken: 'one-time-token',
  oAuthProxy: 'oauth-proxy',
  haveIBeenPwned: 'haveIBeenPwned',
  captcha: 'captcha',
  bearer: 'bearer',
  genericOAuth: 'generic-oauth',
  customSession: 'custom-session',
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
  expo: 'expo',
  polar: 'polar',
  stripe: 'stripe'
} as const

export const baseSlugs = {
  users: 'users',
  sessions: 'sessions',
  accounts: 'accounts',
  verifications: 'verifications',
  adminInvitations: 'adminInvitations'
} as const

export const baPluginSlugs = {
  subscriptions: 'subscriptions',
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

export const baModelKey = {
  user: 'user',
  session: 'session',
  account: 'account',
  verification: 'verification',
  twoFactor: 'twoFactor',
  passkey: 'passkey',
  oauthApplication: 'oauthApplication',
  oauthAccessToken: 'oauthAccessToken',
  oauthConsent: 'oauthConsent',
  ssoProvider: 'ssoProvider',
  organization: 'organization',
  invitation: 'invitation',
  member: 'member',
  team: 'team',
  subscription: 'subscription',
  apikey: 'apikey',
  jwks: 'jwks'
} as const

export const baModelFieldKeys = {
  account: {
    userId: 'userId'
  },
  session: {
    userId: 'userId',
    activeOrganizationId: 'activeOrganizationId',
    impersonatedBy: 'impersonatedBy'
  },
  member: {
    organizationId: 'organizationId',
    userId: 'userId',
    teamId: 'teamId'
  },
  invitation: {
    organizationId: 'organizationId',
    inviterId: 'inviterId',
    teamId: 'teamId'
  },
  team: {
    organizationId: 'organizationId'
  },
  apikey: {
    userId: 'userId'
  },
  twoFactor: {
    userId: 'userId'
  },
  passkey: {
    userId: 'userId'
  },
  ssoProvider: {
    userId: 'userId'
  },
  oauthApplication: {
    userId: 'userId'
  },
  oauthAccessToken: {
    userId: 'userId',
    clientId: 'clientId'
  },
  oauthConsent: {
    userId: 'userId',
    clientId: 'clientId'
  }
} as const

export const baModelKeyToSlug = {
  user: baseSlugs.users,
  session: baseSlugs.sessions,
  account: baseSlugs.accounts,
  verification: baseSlugs.verifications,
  twoFactor: baPluginSlugs.twoFactors,
  passkey: baPluginSlugs.passkeys,
  oauthApplication: baPluginSlugs.oauthApplications,
  oauthAccessToken: baPluginSlugs.oauthAccessTokens,
  oauthConsent: baPluginSlugs.oauthConsents,
  ssoProvider: baPluginSlugs.ssoProviders,
  organization: baPluginSlugs.organizations,
  invitation: baPluginSlugs.invitations,
  member: baPluginSlugs.members,
  team: baPluginSlugs.teams,
  subscription: baPluginSlugs.subscriptions,
  apikey: baPluginSlugs.apiKeys,
  jwks: baPluginSlugs.jwks
} as const

export const adminRoutes = {
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  adminSignup: '/signup',
  adminLogin: '/login',
  loginRedirect: '/login-redirect',
  twoFactorVerify: '/two-factor-verify'
} as const

export const adminEndpoints = {
  setAdminRole: '/set-admin-role',
  refreshToken: '/refresh-token',
  sendInvite: '/send-invite',
  generateInviteUrl: '/generate-invite-url',
  signup: '/signup'
} as const

export const defaults = {
  adminRole: 'admin',
  userRole: 'user'
} as const
