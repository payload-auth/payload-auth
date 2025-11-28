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
];
export const loginMethods = [
    'emailPassword',
    'magicLink',
    'emailOTP',
    'phonePassword',
    'phoneOTP',
    'phoneMagicLink',
    'passkey',
    ...socialProviders
];
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
    mcp: 'mcp',
    organization: 'organization',
    multiSession: 'multi-session',
    openApi: 'open-api',
    jwt: 'jwt',
    nextCookies: 'next-cookies',
    sso: 'sso',
    oidc: 'oidc',
    expo: 'expo',
    polar: 'polar',
    stripe: 'stripe',
    autumn: 'autumn',
    dodopayments: 'dodopayments',
    dubAnalytics: 'dub-analytics',
    deviceAuthorization: 'device-authorization',
    lastLoginMethod: 'last-login-method'
};
export const baseSlugs = {
    users: 'users',
    sessions: 'sessions',
    accounts: 'accounts',
    verifications: 'verifications',
    adminInvitations: 'admin-invitations'
};
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
    teams: 'teams',
    teamMembers: 'teamMembers'
};
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
    teamMember: 'teamMember',
    subscription: 'subscription',
    apikey: 'apikey',
    jwks: 'jwks',
    deviceCode: 'deviceCode'
};
export const baModelFieldKeysToFieldNames = {
    user: {
        role: 'role'
    },
    account: {
        userId: 'user'
    },
    session: {
        userId: 'user'
    },
    member: {
        organizationId: 'organization',
        userId: 'user',
        teamId: 'team'
    },
    invitation: {
        organizationId: 'organization',
        inviterId: 'inviter',
        teamId: 'team'
    },
    team: {
        organizationId: 'organization'
    },
    apikey: {
        userId: 'user'
    },
    twoFactor: {
        userId: 'user'
    },
    passkey: {
        userId: 'user'
    },
    ssoProvider: {
        userId: 'user'
    },
    oauthApplication: {
        userId: 'user'
    },
    oauthAccessToken: {
        userId: 'user',
        clientId: 'client'
    },
    oauthConsent: {
        userId: 'user',
        clientId: 'client'
    }
};
export const baModelFieldKeys = {
    teamMember: {
        teamId: 'teamId',
        userId: 'userId'
    },
    account: {
        userId: 'userId'
    },
    session: {
        userId: 'userId',
        activeOrganizationId: 'activeOrganizationId',
        impersonatedBy: 'impersonatedBy',
        activeTeamId: 'activeTeamId'
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
};
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
    teamMember: baPluginSlugs.teamMembers,
    subscription: baPluginSlugs.subscriptions,
    apikey: baPluginSlugs.apiKeys,
    jwks: baPluginSlugs.jwks
};
export const adminRoutes = {
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    adminSignup: '/signup',
    adminLogin: '/login',
    loginRedirect: '/login-redirect',
    twoFactorVerify: '/two-factor-verify'
};
export const adminEndpoints = {
    setAdminRole: '/set-admin-role',
    refreshToken: '/refresh-token',
    sendInvite: '/send-invite',
    generateInviteUrl: '/generate-invite-url',
    signup: '/signup'
};
export const defaults = {
    adminRole: 'admin',
    userRole: 'user'
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBzb2NpYWxQcm92aWRlcnMgPSBbXG4gICdhcHBsZScsXG4gICdkaXNjb3JkJyxcbiAgJ2ZhY2Vib29rJyxcbiAgJ2dpdGh1YicsXG4gICdnb29nbGUnLFxuICAnbGlua2VkaW4nLFxuICAnbWljcm9zb2Z0JyxcbiAgJ3Nwb3RpZnknLFxuICAndGlrdG9rJyxcbiAgJ3R3aXR0ZXInLFxuICAndHdpdGNoJyxcbiAgJ3pvb20nLFxuICAnZ2l0bGFiJyxcbiAgJ3JvYmxveCcsXG4gICd2aycsXG4gICdraWNrJyxcbiAgJ3JlZGRpdCdcbl0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGxvZ2luTWV0aG9kcyA9IFtcbiAgJ2VtYWlsUGFzc3dvcmQnLFxuICAnbWFnaWNMaW5rJyxcbiAgJ2VtYWlsT1RQJyxcbiAgJ3Bob25lUGFzc3dvcmQnLFxuICAncGhvbmVPVFAnLFxuICAncGhvbmVNYWdpY0xpbmsnLFxuICAncGFzc2tleScsXG4gIC4uLnNvY2lhbFByb3ZpZGVyc1xuXSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3Qgc3VwcG9ydGVkQkFQbHVnaW5JZHMgPSB7XG4gIG9uZVRpbWVUb2tlbjogJ29uZS10aW1lLXRva2VuJyxcbiAgb0F1dGhQcm94eTogJ29hdXRoLXByb3h5JyxcbiAgaGF2ZUlCZWVuUHduZWQ6ICdoYXZlSUJlZW5Qd25lZCcsXG4gIGNhcHRjaGE6ICdjYXB0Y2hhJyxcbiAgYmVhcmVyOiAnYmVhcmVyJyxcbiAgZ2VuZXJpY09BdXRoOiAnZ2VuZXJpYy1vYXV0aCcsXG4gIGN1c3RvbVNlc3Npb246ICdjdXN0b20tc2Vzc2lvbicsXG4gIGhhcm1vbnlFbWFpbDogJ2hhcm1vbnktZW1haWwnLFxuICBoYXJtb255UGhvbmVOdW1iZXI6ICdoYXJtb255LXBob25lLW51bWJlcicsXG4gIHR3b0ZhY3RvcjogJ3R3by1mYWN0b3InLFxuICB1c2VybmFtZTogJ3VzZXJuYW1lJyxcbiAgYW5vbnltb3VzOiAnYW5vbnltb3VzJyxcbiAgcGhvbmVOdW1iZXI6ICdwaG9uZS1udW1iZXInLFxuICBtYWdpY0xpbms6ICdtYWdpYy1saW5rJyxcbiAgZW1haWxPdHA6ICdlbWFpbC1vdHAnLFxuICBwYXNza2V5OiAncGFzc2tleScsXG4gIG9uZVRhcDogJ29uZS10YXAnLFxuICBhZG1pbjogJ2FkbWluJyxcbiAgYXBpS2V5OiAnYXBpLWtleScsXG4gIG1jcDogJ21jcCcsXG4gIG9yZ2FuaXphdGlvbjogJ29yZ2FuaXphdGlvbicsXG4gIG11bHRpU2Vzc2lvbjogJ211bHRpLXNlc3Npb24nLFxuICBvcGVuQXBpOiAnb3Blbi1hcGknLFxuICBqd3Q6ICdqd3QnLFxuICBuZXh0Q29va2llczogJ25leHQtY29va2llcycsXG4gIHNzbzogJ3NzbycsXG4gIG9pZGM6ICdvaWRjJyxcbiAgZXhwbzogJ2V4cG8nLFxuICBwb2xhcjogJ3BvbGFyJyxcbiAgc3RyaXBlOiAnc3RyaXBlJyxcbiAgYXV0dW1uOiAnYXV0dW1uJyxcbiAgZG9kb3BheW1lbnRzOiAnZG9kb3BheW1lbnRzJyxcbiAgZHViQW5hbHl0aWNzOiAnZHViLWFuYWx5dGljcycsXG4gIGRldmljZUF1dGhvcml6YXRpb246ICdkZXZpY2UtYXV0aG9yaXphdGlvbicsXG4gIGxhc3RMb2dpbk1ldGhvZDogJ2xhc3QtbG9naW4tbWV0aG9kJ1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYmFzZVNsdWdzID0ge1xuICB1c2VyczogJ3VzZXJzJyxcbiAgc2Vzc2lvbnM6ICdzZXNzaW9ucycsXG4gIGFjY291bnRzOiAnYWNjb3VudHMnLFxuICB2ZXJpZmljYXRpb25zOiAndmVyaWZpY2F0aW9ucycsXG4gIGFkbWluSW52aXRhdGlvbnM6ICdhZG1pbi1pbnZpdGF0aW9ucydcbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGJhUGx1Z2luU2x1Z3MgPSB7XG4gIHN1YnNjcmlwdGlvbnM6ICdzdWJzY3JpcHRpb25zJyxcbiAgYXBpS2V5czogJ2FwaUtleXMnLFxuICBqd2tzOiAnandrcycsXG4gIHR3b0ZhY3RvcnM6ICd0d29GYWN0b3JzJyxcbiAgcGFzc2tleXM6ICdwYXNza2V5cycsXG4gIG9hdXRoQXBwbGljYXRpb25zOiAnb2F1dGhBcHBsaWNhdGlvbnMnLFxuICBvYXV0aEFjY2Vzc1Rva2VuczogJ29hdXRoQWNjZXNzVG9rZW5zJyxcbiAgb2F1dGhDb25zZW50czogJ29hdXRoQ29uc2VudHMnLFxuICBzc29Qcm92aWRlcnM6ICdzc29Qcm92aWRlcnMnLFxuICBvcmdhbml6YXRpb25zOiAnb3JnYW5pemF0aW9ucycsXG4gIGludml0YXRpb25zOiAnaW52aXRhdGlvbnMnLFxuICBtZW1iZXJzOiAnbWVtYmVycycsXG4gIHRlYW1zOiAndGVhbXMnLFxuICB0ZWFtTWVtYmVyczogJ3RlYW1NZW1iZXJzJ1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYmFNb2RlbEtleSA9IHtcbiAgdXNlcjogJ3VzZXInLFxuICBzZXNzaW9uOiAnc2Vzc2lvbicsXG4gIGFjY291bnQ6ICdhY2NvdW50JyxcbiAgdmVyaWZpY2F0aW9uOiAndmVyaWZpY2F0aW9uJyxcbiAgdHdvRmFjdG9yOiAndHdvRmFjdG9yJyxcbiAgcGFzc2tleTogJ3Bhc3NrZXknLFxuICBvYXV0aEFwcGxpY2F0aW9uOiAnb2F1dGhBcHBsaWNhdGlvbicsXG4gIG9hdXRoQWNjZXNzVG9rZW46ICdvYXV0aEFjY2Vzc1Rva2VuJyxcbiAgb2F1dGhDb25zZW50OiAnb2F1dGhDb25zZW50JyxcbiAgc3NvUHJvdmlkZXI6ICdzc29Qcm92aWRlcicsXG4gIG9yZ2FuaXphdGlvbjogJ29yZ2FuaXphdGlvbicsXG4gIGludml0YXRpb246ICdpbnZpdGF0aW9uJyxcbiAgbWVtYmVyOiAnbWVtYmVyJyxcbiAgdGVhbTogJ3RlYW0nLFxuICB0ZWFtTWVtYmVyOiAndGVhbU1lbWJlcicsXG4gIHN1YnNjcmlwdGlvbjogJ3N1YnNjcmlwdGlvbicsXG4gIGFwaWtleTogJ2FwaWtleScsXG4gIGp3a3M6ICdqd2tzJyxcbiAgZGV2aWNlQ29kZTogJ2RldmljZUNvZGUnXG59IGFzIGNvbnN0XG5cbmV4cG9ydCBjb25zdCBiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzID0ge1xuICB1c2VyOiB7XG4gICAgcm9sZTogJ3JvbGUnXG4gIH0sXG4gIGFjY291bnQ6IHtcbiAgICB1c2VySWQ6ICd1c2VyJ1xuICB9LFxuICBzZXNzaW9uOiB7XG4gICAgdXNlcklkOiAndXNlcicsXG4gIH0sXG4gIG1lbWJlcjoge1xuICAgIG9yZ2FuaXphdGlvbklkOiAnb3JnYW5pemF0aW9uJyxcbiAgICB1c2VySWQ6ICd1c2VyJyxcbiAgICB0ZWFtSWQ6ICd0ZWFtJ1xuICB9LFxuICBpbnZpdGF0aW9uOiB7XG4gICAgb3JnYW5pemF0aW9uSWQ6ICdvcmdhbml6YXRpb24nLFxuICAgIGludml0ZXJJZDogJ2ludml0ZXInLFxuICAgIHRlYW1JZDogJ3RlYW0nXG4gIH0sXG4gIHRlYW06IHtcbiAgICBvcmdhbml6YXRpb25JZDogJ29yZ2FuaXphdGlvbidcbiAgfSxcbiAgYXBpa2V5OiB7XG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgdHdvRmFjdG9yOiB7XG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgcGFzc2tleToge1xuICAgIHVzZXJJZDogJ3VzZXInXG4gIH0sXG4gIHNzb1Byb3ZpZGVyOiB7XG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgb2F1dGhBcHBsaWNhdGlvbjoge1xuICAgIHVzZXJJZDogJ3VzZXInXG4gIH0sXG4gIG9hdXRoQWNjZXNzVG9rZW46IHtcbiAgICB1c2VySWQ6ICd1c2VyJyxcbiAgICBjbGllbnRJZDogJ2NsaWVudCdcbiAgfSxcbiAgb2F1dGhDb25zZW50OiB7XG4gICAgdXNlcklkOiAndXNlcicsXG4gICAgY2xpZW50SWQ6ICdjbGllbnQnXG4gIH1cbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGJhTW9kZWxGaWVsZEtleXMgPSB7XG4gIHRlYW1NZW1iZXI6IHtcbiAgICB0ZWFtSWQ6ICd0ZWFtSWQnLFxuICAgIHVzZXJJZDogJ3VzZXJJZCdcbiAgfSxcbiAgYWNjb3VudDoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCdcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCcsXG4gICAgYWN0aXZlT3JnYW5pemF0aW9uSWQ6ICdhY3RpdmVPcmdhbml6YXRpb25JZCcsXG4gICAgaW1wZXJzb25hdGVkQnk6ICdpbXBlcnNvbmF0ZWRCeScsXG4gICAgYWN0aXZlVGVhbUlkOiAnYWN0aXZlVGVhbUlkJ1xuICB9LFxuICBtZW1iZXI6IHtcbiAgICBvcmdhbml6YXRpb25JZDogJ29yZ2FuaXphdGlvbklkJyxcbiAgICB1c2VySWQ6ICd1c2VySWQnLFxuICAgIHRlYW1JZDogJ3RlYW1JZCdcbiAgfSxcbiAgaW52aXRhdGlvbjoge1xuICAgIG9yZ2FuaXphdGlvbklkOiAnb3JnYW5pemF0aW9uSWQnLFxuICAgIGludml0ZXJJZDogJ2ludml0ZXJJZCcsXG4gICAgdGVhbUlkOiAndGVhbUlkJ1xuICB9LFxuICB0ZWFtOiB7XG4gICAgb3JnYW5pemF0aW9uSWQ6ICdvcmdhbml6YXRpb25JZCdcbiAgfSxcbiAgYXBpa2V5OiB7XG4gICAgdXNlcklkOiAndXNlcklkJ1xuICB9LFxuICB0d29GYWN0b3I6IHtcbiAgICB1c2VySWQ6ICd1c2VySWQnXG4gIH0sXG4gIHBhc3NrZXk6IHtcbiAgICB1c2VySWQ6ICd1c2VySWQnXG4gIH0sXG4gIHNzb1Byb3ZpZGVyOiB7XG4gICAgdXNlcklkOiAndXNlcklkJ1xuICB9LFxuICBvYXV0aEFwcGxpY2F0aW9uOiB7XG4gICAgdXNlcklkOiAndXNlcklkJ1xuICB9LFxuICBvYXV0aEFjY2Vzc1Rva2VuOiB7XG4gICAgdXNlcklkOiAndXNlcklkJyxcbiAgICBjbGllbnRJZDogJ2NsaWVudElkJ1xuICB9LFxuICBvYXV0aENvbnNlbnQ6IHtcbiAgICB1c2VySWQ6ICd1c2VySWQnLFxuICAgIGNsaWVudElkOiAnY2xpZW50SWQnXG4gIH1cbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGJhTW9kZWxLZXlUb1NsdWcgPSB7XG4gIHVzZXI6IGJhc2VTbHVncy51c2VycyxcbiAgc2Vzc2lvbjogYmFzZVNsdWdzLnNlc3Npb25zLFxuICBhY2NvdW50OiBiYXNlU2x1Z3MuYWNjb3VudHMsXG4gIHZlcmlmaWNhdGlvbjogYmFzZVNsdWdzLnZlcmlmaWNhdGlvbnMsXG4gIHR3b0ZhY3RvcjogYmFQbHVnaW5TbHVncy50d29GYWN0b3JzLFxuICBwYXNza2V5OiBiYVBsdWdpblNsdWdzLnBhc3NrZXlzLFxuICBvYXV0aEFwcGxpY2F0aW9uOiBiYVBsdWdpblNsdWdzLm9hdXRoQXBwbGljYXRpb25zLFxuICBvYXV0aEFjY2Vzc1Rva2VuOiBiYVBsdWdpblNsdWdzLm9hdXRoQWNjZXNzVG9rZW5zLFxuICBvYXV0aENvbnNlbnQ6IGJhUGx1Z2luU2x1Z3Mub2F1dGhDb25zZW50cyxcbiAgc3NvUHJvdmlkZXI6IGJhUGx1Z2luU2x1Z3Muc3NvUHJvdmlkZXJzLFxuICBvcmdhbml6YXRpb246IGJhUGx1Z2luU2x1Z3Mub3JnYW5pemF0aW9ucyxcbiAgaW52aXRhdGlvbjogYmFQbHVnaW5TbHVncy5pbnZpdGF0aW9ucyxcbiAgbWVtYmVyOiBiYVBsdWdpblNsdWdzLm1lbWJlcnMsXG4gIHRlYW06IGJhUGx1Z2luU2x1Z3MudGVhbXMsXG4gIHRlYW1NZW1iZXI6IGJhUGx1Z2luU2x1Z3MudGVhbU1lbWJlcnMsXG4gIHN1YnNjcmlwdGlvbjogYmFQbHVnaW5TbHVncy5zdWJzY3JpcHRpb25zLFxuICBhcGlrZXk6IGJhUGx1Z2luU2x1Z3MuYXBpS2V5cyxcbiAgandrczogYmFQbHVnaW5TbHVncy5qd2tzXG59IGFzIGNvbnN0XG5cbmV4cG9ydCBjb25zdCBhZG1pblJvdXRlcyA9IHtcbiAgZm9yZ290UGFzc3dvcmQ6ICcvZm9yZ290LXBhc3N3b3JkJyxcbiAgcmVzZXRQYXNzd29yZDogJy9yZXNldC1wYXNzd29yZCcsXG4gIGFkbWluU2lnbnVwOiAnL3NpZ251cCcsXG4gIGFkbWluTG9naW46ICcvbG9naW4nLFxuICBsb2dpblJlZGlyZWN0OiAnL2xvZ2luLXJlZGlyZWN0JyxcbiAgdHdvRmFjdG9yVmVyaWZ5OiAnL3R3by1mYWN0b3ItdmVyaWZ5J1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYWRtaW5FbmRwb2ludHMgPSB7XG4gIHNldEFkbWluUm9sZTogJy9zZXQtYWRtaW4tcm9sZScsXG4gIHJlZnJlc2hUb2tlbjogJy9yZWZyZXNoLXRva2VuJyxcbiAgc2VuZEludml0ZTogJy9zZW5kLWludml0ZScsXG4gIGdlbmVyYXRlSW52aXRlVXJsOiAnL2dlbmVyYXRlLWludml0ZS11cmwnLFxuICBzaWdudXA6ICcvc2lnbnVwJ1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgZGVmYXVsdHMgPSB7XG4gIGFkbWluUm9sZTogJ2FkbWluJyxcbiAgdXNlclJvbGU6ICd1c2VyJ1xufSBhcyBjb25zdFxuIl0sIm5hbWVzIjpbInNvY2lhbFByb3ZpZGVycyIsImxvZ2luTWV0aG9kcyIsInN1cHBvcnRlZEJBUGx1Z2luSWRzIiwib25lVGltZVRva2VuIiwib0F1dGhQcm94eSIsImhhdmVJQmVlblB3bmVkIiwiY2FwdGNoYSIsImJlYXJlciIsImdlbmVyaWNPQXV0aCIsImN1c3RvbVNlc3Npb24iLCJoYXJtb255RW1haWwiLCJoYXJtb255UGhvbmVOdW1iZXIiLCJ0d29GYWN0b3IiLCJ1c2VybmFtZSIsImFub255bW91cyIsInBob25lTnVtYmVyIiwibWFnaWNMaW5rIiwiZW1haWxPdHAiLCJwYXNza2V5Iiwib25lVGFwIiwiYWRtaW4iLCJhcGlLZXkiLCJtY3AiLCJvcmdhbml6YXRpb24iLCJtdWx0aVNlc3Npb24iLCJvcGVuQXBpIiwiand0IiwibmV4dENvb2tpZXMiLCJzc28iLCJvaWRjIiwiZXhwbyIsInBvbGFyIiwic3RyaXBlIiwiYXV0dW1uIiwiZG9kb3BheW1lbnRzIiwiZHViQW5hbHl0aWNzIiwiZGV2aWNlQXV0aG9yaXphdGlvbiIsImxhc3RMb2dpbk1ldGhvZCIsImJhc2VTbHVncyIsInVzZXJzIiwic2Vzc2lvbnMiLCJhY2NvdW50cyIsInZlcmlmaWNhdGlvbnMiLCJhZG1pbkludml0YXRpb25zIiwiYmFQbHVnaW5TbHVncyIsInN1YnNjcmlwdGlvbnMiLCJhcGlLZXlzIiwiandrcyIsInR3b0ZhY3RvcnMiLCJwYXNza2V5cyIsIm9hdXRoQXBwbGljYXRpb25zIiwib2F1dGhBY2Nlc3NUb2tlbnMiLCJvYXV0aENvbnNlbnRzIiwic3NvUHJvdmlkZXJzIiwib3JnYW5pemF0aW9ucyIsImludml0YXRpb25zIiwibWVtYmVycyIsInRlYW1zIiwidGVhbU1lbWJlcnMiLCJiYU1vZGVsS2V5IiwidXNlciIsInNlc3Npb24iLCJhY2NvdW50IiwidmVyaWZpY2F0aW9uIiwib2F1dGhBcHBsaWNhdGlvbiIsIm9hdXRoQWNjZXNzVG9rZW4iLCJvYXV0aENvbnNlbnQiLCJzc29Qcm92aWRlciIsImludml0YXRpb24iLCJtZW1iZXIiLCJ0ZWFtIiwidGVhbU1lbWJlciIsInN1YnNjcmlwdGlvbiIsImFwaWtleSIsImRldmljZUNvZGUiLCJiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzIiwicm9sZSIsInVzZXJJZCIsIm9yZ2FuaXphdGlvbklkIiwidGVhbUlkIiwiaW52aXRlcklkIiwiY2xpZW50SWQiLCJiYU1vZGVsRmllbGRLZXlzIiwiYWN0aXZlT3JnYW5pemF0aW9uSWQiLCJpbXBlcnNvbmF0ZWRCeSIsImFjdGl2ZVRlYW1JZCIsImJhTW9kZWxLZXlUb1NsdWciLCJhZG1pblJvdXRlcyIsImZvcmdvdFBhc3N3b3JkIiwicmVzZXRQYXNzd29yZCIsImFkbWluU2lnbnVwIiwiYWRtaW5Mb2dpbiIsImxvZ2luUmVkaXJlY3QiLCJ0d29GYWN0b3JWZXJpZnkiLCJhZG1pbkVuZHBvaW50cyIsInNldEFkbWluUm9sZSIsInJlZnJlc2hUb2tlbiIsInNlbmRJbnZpdGUiLCJnZW5lcmF0ZUludml0ZVVy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