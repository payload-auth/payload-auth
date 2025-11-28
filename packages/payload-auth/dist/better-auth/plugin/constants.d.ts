export declare const socialProviders: readonly ["apple", "discord", "facebook", "github", "google", "linkedin", "microsoft", "spotify", "tiktok", "twitter", "twitch", "zoom", "gitlab", "roblox", "vk", "kick", "reddit"];
export declare const loginMethods: readonly ["emailPassword", "magicLink", "emailOTP", "phonePassword", "phoneOTP", "phoneMagicLink", "passkey", "apple", "discord", "facebook", "github", "google", "linkedin", "microsoft", "spotify", "tiktok", "twitter", "twitch", "zoom", "gitlab", "roblox", "vk", "kick", "reddit"];
export declare const supportedBAPluginIds: {
    readonly oneTimeToken: "one-time-token";
    readonly oAuthProxy: "oauth-proxy";
    readonly haveIBeenPwned: "haveIBeenPwned";
    readonly captcha: "captcha";
    readonly bearer: "bearer";
    readonly genericOAuth: "generic-oauth";
    readonly customSession: "custom-session";
    readonly harmonyEmail: "harmony-email";
    readonly harmonyPhoneNumber: "harmony-phone-number";
    readonly twoFactor: "two-factor";
    readonly username: "username";
    readonly anonymous: "anonymous";
    readonly phoneNumber: "phone-number";
    readonly magicLink: "magic-link";
    readonly emailOtp: "email-otp";
    readonly passkey: "passkey";
    readonly oneTap: "one-tap";
    readonly admin: "admin";
    readonly apiKey: "api-key";
    readonly mcp: "mcp";
    readonly organization: "organization";
    readonly multiSession: "multi-session";
    readonly openApi: "open-api";
    readonly jwt: "jwt";
    readonly nextCookies: "next-cookies";
    readonly sso: "sso";
    readonly oidc: "oidc";
    readonly expo: "expo";
    readonly polar: "polar";
    readonly stripe: "stripe";
    readonly autumn: "autumn";
    readonly dodopayments: "dodopayments";
    readonly dubAnalytics: "dub-analytics";
    readonly deviceAuthorization: "device-authorization";
    readonly lastLoginMethod: "last-login-method";
};
export declare const baseSlugs: {
    readonly users: "users";
    readonly sessions: "sessions";
    readonly accounts: "accounts";
    readonly verifications: "verifications";
    readonly adminInvitations: "admin-invitations";
};
export declare const baPluginSlugs: {
    readonly subscriptions: "subscriptions";
    readonly apiKeys: "apiKeys";
    readonly jwks: "jwks";
    readonly twoFactors: "twoFactors";
    readonly passkeys: "passkeys";
    readonly oauthApplications: "oauthApplications";
    readonly oauthAccessTokens: "oauthAccessTokens";
    readonly oauthConsents: "oauthConsents";
    readonly ssoProviders: "ssoProviders";
    readonly organizations: "organizations";
    readonly invitations: "invitations";
    readonly members: "members";
    readonly teams: "teams";
    readonly teamMembers: "teamMembers";
};
export declare const baModelKey: {
    readonly user: "user";
    readonly session: "session";
    readonly account: "account";
    readonly verification: "verification";
    readonly twoFactor: "twoFactor";
    readonly passkey: "passkey";
    readonly oauthApplication: "oauthApplication";
    readonly oauthAccessToken: "oauthAccessToken";
    readonly oauthConsent: "oauthConsent";
    readonly ssoProvider: "ssoProvider";
    readonly organization: "organization";
    readonly invitation: "invitation";
    readonly member: "member";
    readonly team: "team";
    readonly teamMember: "teamMember";
    readonly subscription: "subscription";
    readonly apikey: "apikey";
    readonly jwks: "jwks";
    readonly deviceCode: "deviceCode";
};
export declare const baModelFieldKeysToFieldNames: {
    readonly user: {
        readonly role: "role";
    };
    readonly account: {
        readonly userId: "user";
    };
    readonly session: {
        readonly userId: "user";
    };
    readonly member: {
        readonly organizationId: "organization";
        readonly userId: "user";
        readonly teamId: "team";
    };
    readonly invitation: {
        readonly organizationId: "organization";
        readonly inviterId: "inviter";
        readonly teamId: "team";
    };
    readonly team: {
        readonly organizationId: "organization";
    };
    readonly apikey: {
        readonly userId: "user";
    };
    readonly twoFactor: {
        readonly userId: "user";
    };
    readonly passkey: {
        readonly userId: "user";
    };
    readonly ssoProvider: {
        readonly userId: "user";
    };
    readonly oauthApplication: {
        readonly userId: "user";
    };
    readonly oauthAccessToken: {
        readonly userId: "user";
        readonly clientId: "client";
    };
    readonly oauthConsent: {
        readonly userId: "user";
        readonly clientId: "client";
    };
};
export declare const baModelFieldKeys: {
    readonly teamMember: {
        readonly teamId: "teamId";
        readonly userId: "userId";
    };
    readonly account: {
        readonly userId: "userId";
    };
    readonly session: {
        readonly userId: "userId";
        readonly activeOrganizationId: "activeOrganizationId";
        readonly impersonatedBy: "impersonatedBy";
        readonly activeTeamId: "activeTeamId";
    };
    readonly member: {
        readonly organizationId: "organizationId";
        readonly userId: "userId";
        readonly teamId: "teamId";
    };
    readonly invitation: {
        readonly organizationId: "organizationId";
        readonly inviterId: "inviterId";
        readonly teamId: "teamId";
    };
    readonly team: {
        readonly organizationId: "organizationId";
    };
    readonly apikey: {
        readonly userId: "userId";
    };
    readonly twoFactor: {
        readonly userId: "userId";
    };
    readonly passkey: {
        readonly userId: "userId";
    };
    readonly ssoProvider: {
        readonly userId: "userId";
    };
    readonly oauthApplication: {
        readonly userId: "userId";
    };
    readonly oauthAccessToken: {
        readonly userId: "userId";
        readonly clientId: "clientId";
    };
    readonly oauthConsent: {
        readonly userId: "userId";
        readonly clientId: "clientId";
    };
};
export declare const baModelKeyToSlug: {
    readonly user: "users";
    readonly session: "sessions";
    readonly account: "accounts";
    readonly verification: "verifications";
    readonly twoFactor: "twoFactors";
    readonly passkey: "passkeys";
    readonly oauthApplication: "oauthApplications";
    readonly oauthAccessToken: "oauthAccessTokens";
    readonly oauthConsent: "oauthConsents";
    readonly ssoProvider: "ssoProviders";
    readonly organization: "organizations";
    readonly invitation: "invitations";
    readonly member: "members";
    readonly team: "teams";
    readonly teamMember: "teamMembers";
    readonly subscription: "subscriptions";
    readonly apikey: "apiKeys";
    readonly jwks: "jwks";
};
export declare const adminRoutes: {
    readonly forgotPassword: "/forgot-password";
    readonly resetPassword: "/reset-password";
    readonly adminSignup: "/signup";
    readonly adminLogin: "/login";
    readonly loginRedirect: "/login-redirect";
    readonly twoFactorVerify: "/two-factor-verify";
};
export declare const adminEndpoints: {
    readonly setAdminRole: "/set-admin-role";
    readonly refreshToken: "/refresh-token";
    readonly sendInvite: "/send-invite";
    readonly generateInviteUrl: "/generate-invite-url";
    readonly signup: "/signup";
};
export declare const defaults: {
    readonly adminRole: "admin";
    readonly userRole: "user";
};
//# sourceMappingURL=constants.d.ts.map