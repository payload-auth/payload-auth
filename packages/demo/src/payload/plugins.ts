import type { Plugin } from "payload";
import { payloadBetterAuth } from "@payload-auth/better-auth-plugin";
import {
  bearer,
  admin,
  multiSession,
  organization,
  twoFactor,
  oneTap,
  oAuthProxy,
  openAPI,
  oidcProvider,
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import type { BetterAuthOptions } from "better-auth";

const betterAuthPlugins = [
  organization({
    schema: {
      member: {
        fields: {
          organizationId: "organization",
          userId: "user",
        },
      },
      invitation: {
        fields: {
          organizationId: "organization",
          inviterId: "inviter",
        },
      },
    },

    async sendInvitationEmail(data) {
      console.log("Send invite for org: ", data);
    },
  }),
  twoFactor({
    schema: {
      twoFactor: {
        fields: {
          userId: "user",
        },
      },
    },
    otpOptions: {
      async sendOTP({ user, otp }) {
        console.log("Send OTP for user: ", user, otp);
      },
    },
  }),
  passkey({
    schema: {
      passkey: {
        fields: {
          userId: "user",
        },
      },
    },
  }),
  openAPI(),
  bearer(),
  admin({
    adminUserIds: [],
    schema: {
      session: {
        fields: {
          impersonatedBy: "user",
        },
      },
    },
  }),
  multiSession(),
  oAuthProxy(),
  oidcProvider({
    loginPage: "/sign-in",
  }),
  oneTap(),
  nextCookies(),
];

export type BetterAuthPlugins = typeof betterAuthPlugins;

export const betterAuthOptions: BetterAuthOptions = {
  appName: "payload-better-auth",
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
    modelName: "user",
    additionalFields: {},
  },
  session: {
    modelName: "session",
    fields: {
      userId: "user",
    },
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  account: {
    modelName: "account",
    fields: {
      userId: "user",
    },
    accountLinking: {
      trustedProviders: ["google", "github", "demo-app"],
    },
  },
  verification: {
    modelName: "verification-token",
  },
};

export const plugins: Plugin[] = [
  payloadBetterAuth({
    betterAuthOptions: {
      enable_debug_logs: true,
      ...betterAuthOptions,
    },
  }),
];
