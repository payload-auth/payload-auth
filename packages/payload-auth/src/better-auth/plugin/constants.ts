export const socialProviders = [
  "apple",
  "discord",
  "facebook",
  "github",
  "google",
  "linkedin",
  "microsoft",
  "spotify",
  "tiktok",
  "twitter",
  "twitch",
  "zoom",
  "gitlab",
  "roblox",
  "vk",
  "kick",
  "reddit"
] as const;

export const loginMethods = [
  "emailPassword",
  "magicLink",
  "emailOTP",
  "phonePassword",
  "phoneOTP",
  "phoneMagicLink",
  "passkey",
  ...socialProviders
] as const;

export const supportedBAPluginIds = {
  oneTimeToken: "one-time-token",
  oAuthProxy: "oauth-proxy",
  haveIBeenPwned: "haveIBeenPwned",
  captcha: "captcha",
  bearer: "bearer",
  genericOAuth: "generic-oauth",
  customSession: "custom-session",
  harmonyEmail: "harmony-email",
  harmonyPhoneNumber: "harmony-phone-number",
  twoFactor: "two-factor",
  username: "username",
  anonymous: "anonymous",
  phoneNumber: "phone-number",
  magicLink: "magic-link",
  emailOtp: "email-otp",
  passkey: "passkey",
  oneTap: "one-tap",
  admin: "admin",
  apiKey: "api-key",
  mcp: "mcp",
  organization: "organization",
  multiSession: "multi-session",
  openApi: "open-api",
  jwt: "jwt",
  nextCookies: "next-cookies",
  sso: "sso",
  oidc: "oidc",
  oauthProvider: "oauth-provider",
  expo: "expo",
  polar: "polar",
  stripe: "stripe",
  autumn: "autumn",
  dodopayments: "dodopayments",
  dubAnalytics: "dub-analytics",
  deviceAuthorization: "device-authorization",
  lastLoginMethod: "last-login-method",
  scim: "scim"
} as const;

export const baseSlugs = {
  users: "users",
  sessions: "sessions",
  accounts: "accounts",
  verifications: "verifications",
  adminInvitations: "admin-invitations"
} as const;

export const baPluginSlugs = {
  subscriptions: "subscriptions",
  apiKeys: "apiKeys",
  jwks: "jwks",
  twoFactors: "twoFactors",
  passkeys: "passkeys",
  oauthClients: "oauthClients",
  oauthAccessTokens: "oauthAccessTokens",
  oauthConsents: "oauthConsents",
  oauthResources: "oauthResources",
  oauthClientResources: "oauthClientResources",
  oauthRefreshTokens: "oauthRefreshTokens",
  oauthClientAssertions: "oauthClientAssertions",
  ssoProviders: "ssoProviders",
  organizations: "organizations",
  organizationRoles: "organizationRoles",
  invitations: "invitations",
  members: "members",
  teams: "teams",
  teamMembers: "teamMembers",
  scimConnectionBindings: "scimConnectionBindings",
  scimIdentityTombstones: "scimIdentityTombstones",
  scimSubjects: "scimSubjects",
  scimUsers: "scimUsers",
  scimProjectionGrants: "scimProjectionGrants",
  scimGroups: "scimGroups",
  scimGroupMembers: "scimGroupMembers",
  rateLimit: "rateLimit",
  deviceCode: "deviceCode"
} as const;

export const baModelKey = {
  user: "user",
  session: "session",
  account: "account",
  verification: "verification",
  twoFactor: "twoFactor",
  passkey: "passkey",
  oauthClient: "oauthClient",
  oauthAccessToken: "oauthAccessToken",
  oauthConsent: "oauthConsent",
  oauthResource: "oauthResource",
  oauthClientResource: "oauthClientResource",
  oauthRefreshToken: "oauthRefreshToken",
  oauthClientAssertion: "oauthClientAssertion",
  ssoProvider: "ssoProvider",
  organization: "organization",
  organizationRole: "organizationRole",
  invitation: "invitation",
  member: "member",
  team: "team",
  teamMember: "teamMember",
  subscription: "subscription",
  apikey: "apikey",
  jwks: "jwks",
  deviceCode: "deviceCode",
  rateLimit: "rateLimit",
  scimConnectionBinding: "scimConnectionBinding",
  scimIdentityTombstone: "scimIdentityTombstone",
  scimSubject: "scimSubject",
  scimUser: "scimUser",
  scimProjectionGrant: "scimProjectionGrant",
  scimGroup: "scimGroup",
  scimGroupMember: "scimGroupMember"
} as const;

export const baModelFieldKeysToFieldNames = {
  user: {
    role: "role"
  },
  account: {
    userId: "user"
  },
  session: {
    userId: "user"
  },
  member: {
    organizationId: "organization",
    userId: "user",
    teamId: "team"
  },
  invitation: {
    organizationId: "organization",
    inviterId: "inviter",
    teamId: "team"
  },
  team: {
    organizationId: "organization"
  },
  apikey: {},
  twoFactor: {
    userId: "user"
  },
  passkey: {
    userId: "user"
  },
  ssoProvider: {
    userId: "user"
  },
  oauthClient: {
    userId: "user"
  },
  oauthAccessToken: {
    userId: "user",
    clientId: "client"
  },
  oauthConsent: {
    userId: "user",
    clientId: "client"
  },
  oauthRefreshToken: {
    userId: "user",
    clientId: "client"
  },
  oauthClientResource: {
    clientId: "client",
    resourceId: "resource"
  }
} as const;

export const baModelFieldKeys = {
  organizationRole: {
    organizationId: "organizationId"
  },
  teamMember: {
    teamId: "teamId",
    userId: "userId"
  },
  account: {
    userId: "userId"
  },
  session: {
    userId: "userId",
    activeOrganizationId: "activeOrganizationId",
    impersonatedBy: "impersonatedBy",
    activeTeamId: "activeTeamId"
  },
  member: {
    organizationId: "organizationId",
    userId: "userId",
    teamId: "teamId"
  },
  invitation: {
    organizationId: "organizationId",
    inviterId: "inviterId",
    teamId: "teamId"
  },
  team: {
    organizationId: "organizationId"
  },
  apikey: {},
  twoFactor: {
    userId: "userId"
  },
  passkey: {
    userId: "userId"
  },
  ssoProvider: {
    userId: "userId"
  },
  oauthClient: {
    userId: "userId"
  },
  oauthAccessToken: {
    userId: "userId",
    clientId: "clientId"
  },
  oauthConsent: {
    userId: "userId",
    clientId: "clientId"
  },
  oauthRefreshToken: {
    userId: "userId",
    clientId: "clientId"
  },
  oauthClientResource: {
    clientId: "clientId",
    resourceId: "resourceId"
  }
} as const;

export const baModelKeyToSlug = {
  user: baseSlugs.users,
  session: baseSlugs.sessions,
  account: baseSlugs.accounts,
  verification: baseSlugs.verifications,
  twoFactor: baPluginSlugs.twoFactors,
  passkey: baPluginSlugs.passkeys,
  oauthClient: baPluginSlugs.oauthClients,
  oauthAccessToken: baPluginSlugs.oauthAccessTokens,
  oauthConsent: baPluginSlugs.oauthConsents,
  oauthResource: baPluginSlugs.oauthResources,
  oauthClientResource: baPluginSlugs.oauthClientResources,
  oauthRefreshToken: baPluginSlugs.oauthRefreshTokens,
  oauthClientAssertion: baPluginSlugs.oauthClientAssertions,
  ssoProvider: baPluginSlugs.ssoProviders,
  organization: baPluginSlugs.organizations,
  invitation: baPluginSlugs.invitations,
  member: baPluginSlugs.members,
  team: baPluginSlugs.teams,
  teamMember: baPluginSlugs.teamMembers,
  subscription: baPluginSlugs.subscriptions,
  apikey: baPluginSlugs.apiKeys,
  jwks: baPluginSlugs.jwks,
  scimConnectionBinding: baPluginSlugs.scimConnectionBindings,
  scimIdentityTombstone: baPluginSlugs.scimIdentityTombstones,
  scimSubject: baPluginSlugs.scimSubjects,
  scimUser: baPluginSlugs.scimUsers,
  scimProjectionGrant: baPluginSlugs.scimProjectionGrants,
  scimGroup: baPluginSlugs.scimGroups,
  scimGroupMember: baPluginSlugs.scimGroupMembers
} as const;

export const adminRoutes = {
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  adminSignup: "/signup",
  adminLogin: "/login",
  loginRedirect: "/login-redirect",
  twoFactorVerify: "/two-factor-verify"
} as const;

export const adminEndpoints = {
  refreshToken: "/refresh-token",
  sendInvite: "/send-invite",
  generateInviteUrl: "/generate-invite-url",
  signup: "/signup"
} as const;

export const defaults = {
  adminRole: "admin",
  userRole: "user"
} as const;
