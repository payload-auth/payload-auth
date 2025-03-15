import type { Plugin } from "payload";
import {
  payloadBetterAuth,
  type PayloadBetterAuthOptions,
} from "@payload-auth/better-auth-plugin";
import {
  admin,
  multiSession,
  organization,
  twoFactor,
  oneTap,
  openAPI,
  username,
  anonymous,
  phoneNumber,
  magicLink,
  emailOTP,
  apiKey,
  jwt,
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import { emailHarmony, phoneHarmony } from "better-auth-harmony";

const betterAuthPlugins = [
  emailHarmony(),
  phoneHarmony({
    defaultCountry: "CA",
  }),
  twoFactor({
    schema: {
      user: {
        modelName: "users",
        fields: {
          userId: "user",
        },
      },
      twoFactor: {
        modelName: "twoFactors",
        fields: {
          userId: "user",
        },
      },
    },
    issuer: "payload-better-auth",
    otpOptions: {
      async sendOTP({ user, otp }) {
        console.log("Send OTP for user: ", user, otp);
      },
    },
  }),
  anonymous({
    emailDomainName: "payload-better-auth.com",
    onLinkAccount: async ({ anonymousUser, newUser }) => {
      console.log("Link account for anonymous user: ", anonymousUser, newUser);
    },
    disableDeleteAnonymousUser: false,
  }),
  phoneNumber({
    sendOTP: async ({ phoneNumber, code }, req) => {
      console.log("Send OTP for user: ", phoneNumber, code);
    },
  }),
  magicLink({
    sendMagicLink: async ({ email, token, url }, request) => {
      console.log("Send magic link for user: ", email, token, url);
    },
  }),
  emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      console.log("Send verification OTP for user: ", email, otp, type);
    },
  }),
  passkey({
    rpID: "payload-better-auth",
    rpName: "payload-better-auth-demo",
    origin: "http://localhost:3000",
  }),
  admin(),
  apiKey(),
  organization({
    teams: {
      enabled: true,
    },
    async sendInvitationEmail(data) {
      const inviteLink = `http://localhost:3000/accept-invitation/${data.id}`;
      console.log("Send invite for org: ", data, inviteLink);
    },
  }),
  multiSession(),
  openAPI(),
  jwt(),
  nextCookies(),
];

export type BetterAuthPlugins = typeof betterAuthPlugins;

export const betterAuthOptions: PayloadBetterAuthOptions = {
  appName: "payload-better-auth",
  baseURL: "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      console.log("Send reset password for user: ", user, url);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      console.log("Send verification email for user: ", user, url);
    },
  },
  plugins: betterAuthPlugins,
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
        console.log(
          "Send change email verification for user: ",
          user,
          newEmail,
          url,
          token
        );
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        // Send delete account verification
      },
      beforeDelete: async (user) => {
        // Perform actions before user deletion
      },
      afterDelete: async (user) => {
        // Perform cleanup after user deletion
      },
    },
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
  session: {
    // cookieCache: {
    //   enabled: true,
    //   maxAge: 5 * 60, // Cache duration in seconds
    // },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"],
    },
  },
};

export const plugins: Plugin[] = [
  payloadBetterAuth({
    logTables: false,
    enableDebugLogs: true,
    hidePluginCollections: true,
    users: {
      slug: "users",
      adminRoles: ["admin"],
    },
    accounts: {
      slug: "accounts",
    },
    betterAuthOptions,
  }),
];
