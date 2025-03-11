import { generateSchema } from "./generate-schema";

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
  customSession,
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";

await generateSchema(
  {
    appName: "payload-better-auth",
    plugins: [
      organization({
        async sendInvitationEmail(data) {},
      }),
      twoFactor({
        otpOptions: {
          async sendOTP({ user, otp }) {},
        },
      }),
      passkey(),
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
      nextCookies(),
      oidcProvider({
        loginPage: "/sign-in",
      }),
      oneTap(),
      customSession(async (session) => {
        return {
          ...session,
          user: {
            ...session.user,
            dd: "test",
          },
        };
      }),
    ],
    emailVerification: {
      async sendVerificationEmail({ user, url }) {},
    },
    account: {
      accountLinking: {
        trustedProviders: ["google", "github", "demo-app"],
      },
    },
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }) {},
    },
    socialProviders: {
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID || "",
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      },
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID || "",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      },
      twitch: {
        clientId: process.env.TWITCH_CLIENT_ID || "",
        clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
      },
      twitter: {
        clientId: process.env.TWITTER_CLIENT_ID || "",
        clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      },
    },
  },
  {
    payload_dir_path: "./",
  }
);
