import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { payloadBetterAuth } from "@payload-better-auth/plugin";
import sharp from "sharp";
import { fileURLToPath } from "url";

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
  BetterAuthPlugin,
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname;
}

const baPlugins = [
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

const plugins = [
  payloadBetterAuth({
    betterAuthOptions: {
      appName: "payload-better-auth",
      enable_debug_logs: true,
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
      plugins: baPlugins,
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
    },
  }),
];

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: "user",
  },
  collections: [],
  db: postgresAdapter({
    disableCreateDatabase: true,
    pool: {
      connectionString:
        "postgres://forrestdevs:@127.0.0.1:5432/better-auth-payload",
    },
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  editor: lexicalEditor(),
  plugins,
  secret: process.env.PAYLOAD_SECRET || "test-secret_key",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});

export type MyPlugins = typeof baPlugins;
