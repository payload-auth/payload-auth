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
    jwks: 'jwks'
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
        userId: 'user'
    },
    teamMember: {
        teamId: 'team',
        userId: 'user'
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
        userId: 'userId'
    },
    teamMember: {
        teamId: 'teamId',
        userId: 'userId'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBzb2NpYWxQcm92aWRlcnMgPSBbXG4gICdhcHBsZScsXG4gICdkaXNjb3JkJyxcbiAgJ2ZhY2Vib29rJyxcbiAgJ2dpdGh1YicsXG4gICdnb29nbGUnLFxuICAnbGlua2VkaW4nLFxuICAnbWljcm9zb2Z0JyxcbiAgJ3Nwb3RpZnknLFxuICAndGlrdG9rJyxcbiAgJ3R3aXR0ZXInLFxuICAndHdpdGNoJyxcbiAgJ3pvb20nLFxuICAnZ2l0bGFiJyxcbiAgJ3JvYmxveCcsXG4gICd2aycsXG4gICdraWNrJyxcbiAgJ3JlZGRpdCdcbl0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGxvZ2luTWV0aG9kcyA9IFtcbiAgJ2VtYWlsUGFzc3dvcmQnLFxuICAnbWFnaWNMaW5rJyxcbiAgJ2VtYWlsT1RQJyxcbiAgJ3Bob25lUGFzc3dvcmQnLFxuICAncGhvbmVPVFAnLFxuICAncGhvbmVNYWdpY0xpbmsnLFxuICAncGFzc2tleScsXG4gIC4uLnNvY2lhbFByb3ZpZGVyc1xuXSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3Qgc3VwcG9ydGVkQkFQbHVnaW5JZHMgPSB7XG4gIG9uZVRpbWVUb2tlbjogJ29uZS10aW1lLXRva2VuJyxcbiAgb0F1dGhQcm94eTogJ29hdXRoLXByb3h5JyxcbiAgaGF2ZUlCZWVuUHduZWQ6ICdoYXZlSUJlZW5Qd25lZCcsXG4gIGNhcHRjaGE6ICdjYXB0Y2hhJyxcbiAgYmVhcmVyOiAnYmVhcmVyJyxcbiAgZ2VuZXJpY09BdXRoOiAnZ2VuZXJpYy1vYXV0aCcsXG4gIGN1c3RvbVNlc3Npb246ICdjdXN0b20tc2Vzc2lvbicsXG4gIGhhcm1vbnlFbWFpbDogJ2hhcm1vbnktZW1haWwnLFxuICBoYXJtb255UGhvbmVOdW1iZXI6ICdoYXJtb255LXBob25lLW51bWJlcicsXG4gIHR3b0ZhY3RvcjogJ3R3by1mYWN0b3InLFxuICB1c2VybmFtZTogJ3VzZXJuYW1lJyxcbiAgYW5vbnltb3VzOiAnYW5vbnltb3VzJyxcbiAgcGhvbmVOdW1iZXI6ICdwaG9uZS1udW1iZXInLFxuICBtYWdpY0xpbms6ICdtYWdpYy1saW5rJyxcbiAgZW1haWxPdHA6ICdlbWFpbC1vdHAnLFxuICBwYXNza2V5OiAncGFzc2tleScsXG4gIG9uZVRhcDogJ29uZS10YXAnLFxuICBhZG1pbjogJ2FkbWluJyxcbiAgYXBpS2V5OiAnYXBpLWtleScsXG4gIG9yZ2FuaXphdGlvbjogJ29yZ2FuaXphdGlvbicsXG4gIG11bHRpU2Vzc2lvbjogJ211bHRpLXNlc3Npb24nLFxuICBvcGVuQXBpOiAnb3Blbi1hcGknLFxuICBqd3Q6ICdqd3QnLFxuICBuZXh0Q29va2llczogJ25leHQtY29va2llcycsXG4gIHNzbzogJ3NzbycsXG4gIG9pZGM6ICdvaWRjJyxcbiAgZXhwbzogJ2V4cG8nLFxuICBwb2xhcjogJ3BvbGFyJyxcbiAgc3RyaXBlOiAnc3RyaXBlJ1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYmFzZVNsdWdzID0ge1xuICB1c2VyczogJ3VzZXJzJyxcbiAgc2Vzc2lvbnM6ICdzZXNzaW9ucycsXG4gIGFjY291bnRzOiAnYWNjb3VudHMnLFxuICB2ZXJpZmljYXRpb25zOiAndmVyaWZpY2F0aW9ucycsXG4gIGFkbWluSW52aXRhdGlvbnM6ICdhZG1pbi1pbnZpdGF0aW9ucydcbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGJhUGx1Z2luU2x1Z3MgPSB7XG4gIHN1YnNjcmlwdGlvbnM6ICdzdWJzY3JpcHRpb25zJyxcbiAgYXBpS2V5czogJ2FwaUtleXMnLFxuICBqd2tzOiAnandrcycsXG4gIHR3b0ZhY3RvcnM6ICd0d29GYWN0b3JzJyxcbiAgcGFzc2tleXM6ICdwYXNza2V5cycsXG4gIG9hdXRoQXBwbGljYXRpb25zOiAnb2F1dGhBcHBsaWNhdGlvbnMnLFxuICBvYXV0aEFjY2Vzc1Rva2VuczogJ29hdXRoQWNjZXNzVG9rZW5zJyxcbiAgb2F1dGhDb25zZW50czogJ29hdXRoQ29uc2VudHMnLFxuICBzc29Qcm92aWRlcnM6ICdzc29Qcm92aWRlcnMnLFxuICBvcmdhbml6YXRpb25zOiAnb3JnYW5pemF0aW9ucycsXG4gIGludml0YXRpb25zOiAnaW52aXRhdGlvbnMnLFxuICBtZW1iZXJzOiAnbWVtYmVycycsXG4gIHRlYW1zOiAndGVhbXMnLFxuICB0ZWFtTWVtYmVyczogJ3RlYW1NZW1iZXJzJ1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYmFNb2RlbEtleSA9IHtcbiAgdXNlcjogJ3VzZXInLFxuICBzZXNzaW9uOiAnc2Vzc2lvbicsXG4gIGFjY291bnQ6ICdhY2NvdW50JyxcbiAgdmVyaWZpY2F0aW9uOiAndmVyaWZpY2F0aW9uJyxcbiAgdHdvRmFjdG9yOiAndHdvRmFjdG9yJyxcbiAgcGFzc2tleTogJ3Bhc3NrZXknLFxuICBvYXV0aEFwcGxpY2F0aW9uOiAnb2F1dGhBcHBsaWNhdGlvbicsXG4gIG9hdXRoQWNjZXNzVG9rZW46ICdvYXV0aEFjY2Vzc1Rva2VuJyxcbiAgb2F1dGhDb25zZW50OiAnb2F1dGhDb25zZW50JyxcbiAgc3NvUHJvdmlkZXI6ICdzc29Qcm92aWRlcicsXG4gIG9yZ2FuaXphdGlvbjogJ29yZ2FuaXphdGlvbicsXG4gIGludml0YXRpb246ICdpbnZpdGF0aW9uJyxcbiAgbWVtYmVyOiAnbWVtYmVyJyxcbiAgdGVhbTogJ3RlYW0nLFxuICB0ZWFtTWVtYmVyOiAndGVhbU1lbWJlcicsXG4gIHN1YnNjcmlwdGlvbjogJ3N1YnNjcmlwdGlvbicsXG4gIGFwaWtleTogJ2FwaWtleScsXG4gIGp3a3M6ICdqd2tzJ1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYmFNb2RlbEZpZWxkS2V5c1RvRmllbGROYW1lcyA9IHtcbiAgdXNlcjoge1xuICAgIHJvbGU6ICdyb2xlJ1xuICB9LFxuICBhY2NvdW50OiB7XG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHVzZXJJZDogJ3VzZXInLFxuICB9LFxuICBtZW1iZXI6IHtcbiAgICBvcmdhbml6YXRpb25JZDogJ29yZ2FuaXphdGlvbicsXG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgdGVhbU1lbWJlcjoge1xuICAgIHRlYW1JZDogJ3RlYW0nLFxuICAgIHVzZXJJZDogJ3VzZXInXG4gIH0sXG4gIGludml0YXRpb246IHtcbiAgICBvcmdhbml6YXRpb25JZDogJ29yZ2FuaXphdGlvbicsXG4gICAgaW52aXRlcklkOiAnaW52aXRlcicsXG4gICAgdGVhbUlkOiAndGVhbSdcbiAgfSxcbiAgdGVhbToge1xuICAgIG9yZ2FuaXphdGlvbklkOiAnb3JnYW5pemF0aW9uJ1xuICB9LFxuICBhcGlrZXk6IHtcbiAgICB1c2VySWQ6ICd1c2VyJ1xuICB9LFxuICB0d29GYWN0b3I6IHtcbiAgICB1c2VySWQ6ICd1c2VyJ1xuICB9LFxuICBwYXNza2V5OiB7XG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgc3NvUHJvdmlkZXI6IHtcbiAgICB1c2VySWQ6ICd1c2VyJ1xuICB9LFxuICBvYXV0aEFwcGxpY2F0aW9uOiB7XG4gICAgdXNlcklkOiAndXNlcidcbiAgfSxcbiAgb2F1dGhBY2Nlc3NUb2tlbjoge1xuICAgIHVzZXJJZDogJ3VzZXInLFxuICAgIGNsaWVudElkOiAnY2xpZW50J1xuICB9LFxuICBvYXV0aENvbnNlbnQ6IHtcbiAgICB1c2VySWQ6ICd1c2VyJyxcbiAgICBjbGllbnRJZDogJ2NsaWVudCdcbiAgfVxufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYmFNb2RlbEZpZWxkS2V5cyA9IHtcbiAgYWNjb3VudDoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCdcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCcsXG4gICAgYWN0aXZlT3JnYW5pemF0aW9uSWQ6ICdhY3RpdmVPcmdhbml6YXRpb25JZCcsXG4gICAgaW1wZXJzb25hdGVkQnk6ICdpbXBlcnNvbmF0ZWRCeSdcbiAgfSxcbiAgbWVtYmVyOiB7XG4gICAgb3JnYW5pemF0aW9uSWQ6ICdvcmdhbml6YXRpb25JZCcsXG4gICAgdXNlcklkOiAndXNlcklkJ1xuICB9LFxuICB0ZWFtTWVtYmVyOiB7XG4gICAgdGVhbUlkOiAndGVhbUlkJyxcbiAgICB1c2VySWQ6ICd1c2VySWQnXG4gIH0sXG4gIGludml0YXRpb246IHtcbiAgICBvcmdhbml6YXRpb25JZDogJ29yZ2FuaXphdGlvbklkJyxcbiAgICBpbnZpdGVySWQ6ICdpbnZpdGVySWQnLFxuICAgIHRlYW1JZDogJ3RlYW1JZCdcbiAgfSxcbiAgdGVhbToge1xuICAgIG9yZ2FuaXphdGlvbklkOiAnb3JnYW5pemF0aW9uSWQnXG4gIH0sXG4gIGFwaWtleToge1xuICAgIHVzZXJJZDogJ3VzZXJJZCdcbiAgfSxcbiAgdHdvRmFjdG9yOiB7XG4gICAgdXNlcklkOiAndXNlcklkJ1xuICB9LFxuICBwYXNza2V5OiB7XG4gICAgdXNlcklkOiAndXNlcklkJ1xuICB9LFxuICBzc29Qcm92aWRlcjoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCdcbiAgfSxcbiAgb2F1dGhBcHBsaWNhdGlvbjoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCdcbiAgfSxcbiAgb2F1dGhBY2Nlc3NUb2tlbjoge1xuICAgIHVzZXJJZDogJ3VzZXJJZCcsXG4gICAgY2xpZW50SWQ6ICdjbGllbnRJZCdcbiAgfSxcbiAgb2F1dGhDb25zZW50OiB7XG4gICAgdXNlcklkOiAndXNlcklkJyxcbiAgICBjbGllbnRJZDogJ2NsaWVudElkJ1xuICB9XG59IGFzIGNvbnN0XG5cbmV4cG9ydCBjb25zdCBiYU1vZGVsS2V5VG9TbHVnID0ge1xuICB1c2VyOiBiYXNlU2x1Z3MudXNlcnMsXG4gIHNlc3Npb246IGJhc2VTbHVncy5zZXNzaW9ucyxcbiAgYWNjb3VudDogYmFzZVNsdWdzLmFjY291bnRzLFxuICB2ZXJpZmljYXRpb246IGJhc2VTbHVncy52ZXJpZmljYXRpb25zLFxuICB0d29GYWN0b3I6IGJhUGx1Z2luU2x1Z3MudHdvRmFjdG9ycyxcbiAgcGFzc2tleTogYmFQbHVnaW5TbHVncy5wYXNza2V5cyxcbiAgb2F1dGhBcHBsaWNhdGlvbjogYmFQbHVnaW5TbHVncy5vYXV0aEFwcGxpY2F0aW9ucyxcbiAgb2F1dGhBY2Nlc3NUb2tlbjogYmFQbHVnaW5TbHVncy5vYXV0aEFjY2Vzc1Rva2VucyxcbiAgb2F1dGhDb25zZW50OiBiYVBsdWdpblNsdWdzLm9hdXRoQ29uc2VudHMsXG4gIHNzb1Byb3ZpZGVyOiBiYVBsdWdpblNsdWdzLnNzb1Byb3ZpZGVycyxcbiAgb3JnYW5pemF0aW9uOiBiYVBsdWdpblNsdWdzLm9yZ2FuaXphdGlvbnMsXG4gIGludml0YXRpb246IGJhUGx1Z2luU2x1Z3MuaW52aXRhdGlvbnMsXG4gIG1lbWJlcjogYmFQbHVnaW5TbHVncy5tZW1iZXJzLFxuICB0ZWFtOiBiYVBsdWdpblNsdWdzLnRlYW1zLFxuICB0ZWFtTWVtYmVyOiBiYVBsdWdpblNsdWdzLnRlYW1NZW1iZXJzLFxuICBzdWJzY3JpcHRpb246IGJhUGx1Z2luU2x1Z3Muc3Vic2NyaXB0aW9ucyxcbiAgYXBpa2V5OiBiYVBsdWdpblNsdWdzLmFwaUtleXMsXG4gIGp3a3M6IGJhUGx1Z2luU2x1Z3Muandrc1xufSBhcyBjb25zdFxuXG5leHBvcnQgY29uc3QgYWRtaW5Sb3V0ZXMgPSB7XG4gIGZvcmdvdFBhc3N3b3JkOiAnL2ZvcmdvdC1wYXNzd29yZCcsXG4gIHJlc2V0UGFzc3dvcmQ6ICcvcmVzZXQtcGFzc3dvcmQnLFxuICBhZG1pblNpZ251cDogJy9zaWdudXAnLFxuICBhZG1pbkxvZ2luOiAnL2xvZ2luJyxcbiAgbG9naW5SZWRpcmVjdDogJy9sb2dpbi1yZWRpcmVjdCcsXG4gIHR3b0ZhY3RvclZlcmlmeTogJy90d28tZmFjdG9yLXZlcmlmeSdcbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGFkbWluRW5kcG9pbnRzID0ge1xuICBzZXRBZG1pblJvbGU6ICcvc2V0LWFkbWluLXJvbGUnLFxuICByZWZyZXNoVG9rZW46ICcvcmVmcmVzaC10b2tlbicsXG4gIHNlbmRJbnZpdGU6ICcvc2VuZC1pbnZpdGUnLFxuICBnZW5lcmF0ZUludml0ZVVybDogJy9nZW5lcmF0ZS1pbnZpdGUtdXJsJyxcbiAgc2lnbnVwOiAnL3NpZ251cCdcbn0gYXMgY29uc3RcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRzID0ge1xuICBhZG1pblJvbGU6ICdhZG1pbicsXG4gIHVzZXJSb2xlOiAndXNlcidcbn0gYXMgY29uc3RcbiJdLCJuYW1lcyI6WyJzb2NpYWxQcm92aWRlcnMiLCJsb2dpbk1ldGhvZHMiLCJzdXBwb3J0ZWRCQVBsdWdpbklkcyIsIm9uZVRpbWVUb2tlbiIsIm9BdXRoUHJveHkiLCJoYXZlSUJlZW5Qd25lZCIsImNhcHRjaGEiLCJiZWFyZXIiLCJnZW5lcmljT0F1dGgiLCJjdXN0b21TZXNzaW9uIiwiaGFybW9ueUVtYWlsIiwiaGFybW9ueVBob25lTnVtYmVyIiwidHdvRmFjdG9yIiwidXNlcm5hbWUiLCJhbm9ueW1vdXMiLCJwaG9uZU51bWJlciIsIm1hZ2ljTGluayIsImVtYWlsT3RwIiwicGFzc2tleSIsIm9uZVRhcCIsImFkbWluIiwiYXBpS2V5Iiwib3JnYW5pemF0aW9uIiwibXVsdGlTZXNzaW9uIiwib3BlbkFwaSIsImp3dCIsIm5leHRDb29raWVzIiwic3NvIiwib2lkYyIsImV4cG8iLCJwb2xhciIsInN0cmlwZSIsImJhc2VTbHVncyIsInVzZXJzIiwic2Vzc2lvbnMiLCJhY2NvdW50cyIsInZlcmlmaWNhdGlvbnMiLCJhZG1pbkludml0YXRpb25zIiwiYmFQbHVnaW5TbHVncyIsInN1YnNjcmlwdGlvbnMiLCJhcGlLZXlzIiwiandrcyIsInR3b0ZhY3RvcnMiLCJwYXNza2V5cyIsIm9hdXRoQXBwbGljYXRpb25zIiwib2F1dGhBY2Nlc3NUb2tlbnMiLCJvYXV0aENvbnNlbnRzIiwic3NvUHJvdmlkZXJzIiwib3JnYW5pemF0aW9ucyIsImludml0YXRpb25zIiwibWVtYmVycyIsInRlYW1zIiwidGVhbU1lbWJlcnMiLCJiYU1vZGVsS2V5IiwidXNlciIsInNlc3Npb24iLCJhY2NvdW50IiwidmVyaWZpY2F0aW9uIiwib2F1dGhBcHBsaWNhdGlvbiIsIm9hdXRoQWNjZXNzVG9rZW4iLCJvYXV0aENvbnNlbnQiLCJzc29Qcm92aWRlciIsImludml0YXRpb24iLCJtZW1iZXIiLCJ0ZWFtIiwidGVhbU1lbWJlciIsInN1YnNjcmlwdGlvbiIsImFwaWtleSIsImJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMiLCJyb2xlIiwidXNlcklkIiwib3JnYW5pemF0aW9uSWQiLCJ0ZWFtSWQiLCJpbnZpdGVySWQiLCJjbGllbnRJZCIsImJhTW9kZWxGaWVsZEtleXMiLCJhY3RpdmVPcmdhbml6YXRpb25JZCIsImltcGVyc29uYXRlZEJ5IiwiYmFNb2RlbEtleVRvU2x1ZyIsImFkbWluUm91dGVzIiwiZm9yZ290UGFzc3dvcmQiLCJyZXNldFBhc3N3b3JkIiwiYWRtaW5TaWdudXAiLCJhZG1pbkxvZ2luIiwibG9naW5SZWRpcmVjdCIsInR3b0ZhY3RvclZlcmlmeSIsImFkbWluRW5kcG9pbnRzIiwic2V0QWRtaW5Sb2xlIiwicmVmcmVzaFRva2VuIiwic2VuZEludml0ZSIsImdlbmVyYXRlSW52aXRlVXJsIiwic2lnbnVwIiwiZGVmYXVsdHMiLCJhZG1pblJvbGUiLCJ1c2VyUm9sZSJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNQSxrQkFBa0I7SUFDN0I7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNELENBQVM7QUFFVixPQUFPLE1BQU1DLGVBQWU7SUFDMUI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7T0FDR0Q7Q0FDSixDQUFTO0FBRVYsT0FBTyxNQUFNRSx1QkFBdUI7SUFDbENDLGNBQWM7SUFDZEMsWUFBWTtJQUNaQyxnQkFBZ0I7SUFDaEJDLFNBQVM7SUFDVEMsUUFBUTtJQUNSQyxjQUFjO0lBQ2RDLGVBQWU7SUFDZkMsY0FBYztJQUNkQyxvQkFBb0I7SUFDcEJDLFdBQVc7SUFDWEMsVUFBVTtJQUNWQyxXQUFXO0lBQ1hDLGFBQWE7SUFDYkMsV0FBVztJQUNYQyxVQUFVO0lBQ1ZDLFNBQVM7SUFDVEMsUUFBUTtJQUNSQyxPQUFPO0lBQ1BDLFFBQVE7SUFDUkMsY0FBYztJQUNkQyxjQUFjO0lBQ2RDLFNBQVM7SUFDVEMsS0FBSztJQUNMQyxhQUFhO0lBQ2JDLEtBQUs7SUFDTEMsTUFBTTtJQUNOQyxNQUFNO0lBQ05DLE9BQU87SUFDUEMsUUFBUTtBQUNWLEVBQVU7QUFFVixPQUFPLE1BQU1DLFlBQVk7SUFDdkJDLE9BQU87SUFDUEMsVUFBVTtJQUNWQyxVQUFVO0lBQ1ZDLGVBQWU7SUFDZkMsa0JBQWtCO0FBQ3BCLEVBQVU7QUFFVixPQUFPLE1BQU1DLGdCQUFnQjtJQUMzQkMsZUFBZTtJQUNmQyxTQUFTO0lBQ1RDLE1BQU07SUFDTkMsWUFBWTtJQUNaQyxVQUFVO0lBQ1ZDLG1CQUFtQjtJQUNuQkMsbUJBQW1CO0lBQ25CQyxlQUFlO0lBQ2ZDLGNBQWM7SUFDZEMsZUFBZTtJQUNmQyxhQUFhO0lBQ2JDLFNBQVM7SUFDVEMsT0FBTztJQUNQQyxhQUFhO0FBQ2YsRUFBVTtBQUVWLE9BQU8sTUFBTUMsYUFBYTtJQUN4QkMsTUFBTTtJQUNOQyxTQUFTO0lBQ1RDLFNBQVM7SUFDVEMsY0FBYztJQUNkN0MsV0FBVztJQUNYTSxTQUFTO0lBQ1R3QyxrQkFBa0I7SUFDbEJDLGtCQUFrQjtJQUNsQkMsY0FBYztJQUNkQyxhQUFhO0lBQ2J2QyxjQUFjO0lBQ2R3QyxZQUFZO0lBQ1pDLFFBQVE7SUFDUkMsTUFBTTtJQUNOQyxZQUFZO0lBQ1pDLGNBQWM7SUFDZEMsUUFBUTtJQUNSMUIsTUFBTTtBQUNSLEVBQVU7QUFFVixPQUFPLE1BQU0yQiwrQkFBK0I7SUFDMUNkLE1BQU07UUFDSmUsTUFBTTtJQUNSO0lBQ0FiLFNBQVM7UUFDUGMsUUFBUTtJQUNWO0lBQ0FmLFNBQVM7UUFDUGUsUUFBUTtJQUNWO0lBQ0FQLFFBQVE7UUFDTlEsZ0JBQWdCO1FBQ2hCRCxRQUFRO0lBQ1Y7SUFDQUwsWUFBWTtRQUNWTyxRQUFRO1FBQ1JGLFFBQVE7SUFDVjtJQUNBUixZQUFZO1FBQ1ZTLGdCQUFnQjtRQUNoQkUsV0FBVztRQUNYRCxRQUFRO0lBQ1Y7SUFDQVIsTUFBTTtRQUNKTyxnQkFBZ0I7SUFDbEI7SUFDQUosUUFBUTtRQUNORyxRQUFRO0lBQ1Y7SUFDQTFELFdBQVc7UUFDVDBELFFBQVE7SUFDVjtJQUNBcEQsU0FBUztRQUNQb0QsUUFBUTtJQUNWO0lBQ0FULGFBQWE7UUFDWFMsUUFBUTtJQUNWO0lBQ0FaLGtCQUFrQjtRQUNoQlksUUFBUTtJQUNWO0lBQ0FYLGtCQUFrQjtRQUNoQlcsUUFBUTtRQUNSSSxVQUFVO0lBQ1o7SUFDQWQsY0FBYztRQUNaVSxRQUFRO1FBQ1JJLFVBQVU7SUFDWjtBQUNGLEVBQVU7QUFFVixPQUFPLE1BQU1DLG1CQUFtQjtJQUM5Qm5CLFNBQVM7UUFDUGMsUUFBUTtJQUNWO0lBQ0FmLFNBQVM7UUFDUGUsUUFBUTtRQUNSTSxzQkFBc0I7UUFDdEJDLGdCQUFnQjtJQUNsQjtJQUNBZCxRQUFRO1FBQ05RLGdCQUFnQjtRQUNoQkQsUUFBUTtJQUNWO0lBQ0FMLFlBQVk7UUFDVk8sUUFBUTtRQUNSRixRQUFRO0lBQ1Y7SUFDQVIsWUFBWTtRQUNWUyxnQkFBZ0I7UUFDaEJFLFdBQVc7UUFDWEQsUUFBUTtJQUNWO0lBQ0FSLE1BQU07UUFDSk8sZ0JBQWdCO0lBQ2xCO0lBQ0FKLFFBQVE7UUFDTkcsUUFBUTtJQUNWO0lBQ0ExRCxXQUFXO1FBQ1QwRCxRQUFRO0lBQ1Y7SUFDQXBELFNBQVM7UUFDUG9ELFFBQVE7SUFDVjtJQUNBVCxhQUFhO1FBQ1hTLFFBQVE7SUFDVjtJQUNBWixrQkFBa0I7UUFDaEJZLFFBQVE7SUFDVjtJQUNBWCxrQkFBa0I7UUFDaEJXLFFBQVE7UUFDUkksVUFBVTtJQUNaO0lBQ0FkLGNBQWM7UUFDWlUsUUFBUTtRQUNSSSxVQUFVO0lBQ1o7QUFDRixFQUFVO0FBRVYsT0FBTyxNQUFNSSxtQkFBbUI7SUFDOUJ4QixNQUFNdEIsVUFBVUMsS0FBSztJQUNyQnNCLFNBQVN2QixVQUFVRSxRQUFRO0lBQzNCc0IsU0FBU3hCLFVBQVVHLFFBQVE7SUFDM0JzQixjQUFjekIsVUFBVUksYUFBYTtJQUNyQ3hCLFdBQVcwQixjQUFjSSxVQUFVO0lBQ25DeEIsU0FBU29CLGNBQWNLLFFBQVE7SUFDL0JlLGtCQUFrQnBCLGNBQWNNLGlCQUFpQjtJQUNqRGUsa0JBQWtCckIsY0FBY08saUJBQWlCO0lBQ2pEZSxjQUFjdEIsY0FBY1EsYUFBYTtJQUN6Q2UsYUFBYXZCLGNBQWNTLFlBQVk7SUFDdkN6QixjQUFjZ0IsY0FBY1UsYUFBYTtJQUN6Q2MsWUFBWXhCLGNBQWNXLFdBQVc7SUFDckNjLFFBQVF6QixjQUFjWSxPQUFPO0lBQzdCYyxNQUFNMUIsY0FBY2EsS0FBSztJQUN6QmMsWUFBWTNCLGNBQWNjLFdBQVc7SUFDckNjLGNBQWM1QixjQUFjQyxhQUFhO0lBQ3pDNEIsUUFBUTdCLGNBQWNFLE9BQU87SUFDN0JDLE1BQU1ILGNBQWNHLElBQUk7QUFDMUIsRUFBVTtBQUVWLE9BQU8sTUFBTXNDLGNBQWM7SUFDekJDLGdCQUFnQjtJQUNoQkMsZUFBZTtJQUNmQyxhQUFhO0lBQ2JDLFlBQVk7SUFDWkMsZUFBZTtJQUNmQyxpQkFBaUI7QUFDbkIsRUFBVTtBQUVWLE9BQU8sTUFBTUMsaUJBQWlCO0lBQzVCQyxjQUFjO0lBQ2RDLGNBQWM7SUFDZEMsWUFBWTtJQUNaQyxtQkFBbUI7SUFDbkJDLFFBQVE7QUFDVixFQUFVO0FBRVYsT0FBTyxNQUFNQyxXQUFXO0lBQ3RCQyxXQUFXO0lBQ1hDLFVBQVU7QUFDWixFQUFVIn0=