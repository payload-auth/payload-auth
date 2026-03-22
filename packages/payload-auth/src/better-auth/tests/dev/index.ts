import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import {
  // type BetterAuthOptions,
  betterAuthPlugin,
  BetterAuthReturn,
  getPayloadAuth,
  type PayloadAuthOptions
} from "../../plugin";
import {
  admin,
  anonymous,
  createAccessControl,
  emailOTP,
  lastLoginMethod,
  magicLink,
  multiSession,
  openAPI,
  organization,
  phoneNumber,
  twoFactor,
  username,
  testUtils
} from "better-auth/plugins";
import type { BetterAuthOptions } from "better-auth/types";
import {
  defaultStatements as defaultAdminStatements,
  defaultRoles as defaultAdminRoles
} from "better-auth/plugins/admin/access";
import {
  defaultStatements as defaultOrganizationStatements,
  ownerAc,
  defaultRoles as defaultOrganizationRoles
} from "better-auth/plugins/organization/access";
import { nextCookies } from "better-auth/next-js";
import { apiKey } from "@better-auth/api-key";
import { passkey } from "@better-auth/passkey";
import { emailHarmony, phoneHarmony } from "better-auth-harmony";

const statement = {
  ...defaultOrganizationStatements,
  project: ["create", "share", "update", "delete"]
} as const;

const adminStatement = {
  ...defaultAdminStatements,
  project: ["create", "share", "update", "delete"]
} as const;

const adminAc = createAccessControl(adminStatement);

const adminSuperAdmin = adminAc.newRole({
  ...adminAc.statements
});

const ac = createAccessControl(statement);

const superAdmin = ac.newRole({
  project: ["create", "update"],
  ...ownerAc.statements
});

export const betterAuthOptions = {
  appName: "payload-better-auth",
  baseURL: "http://localhost:3000" as const,
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    admin({
      ac: adminAc,
      roles: {
        ...defaultAdminRoles,
        adminSuperAdmin
      },
      defaultRole: "user"
    }),
    username(),
    organization({
      ac,
      roles: {
        ...defaultOrganizationRoles,
        superAdmin
      },
      teams: {
        enabled: true
      },
      dynamicAccessControl: {
        enabled: true
      },
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invitation/${data.id}`;
        console.log("Send invite for org: ", data, inviteLink);
      }
    }),
    lastLoginMethod({ storeInDatabase: true }),
    twoFactor({
      issuer: "payload-better-auth",
      otpOptions: {
        async sendOTP({ user, otp }) {
          console.log("Send OTP for user: ", user, otp);
        }
      }
    }),
    // emailHarmony is intentionally excluded from test config because it
    // uses mailchecker to reject disposable/test email domains (@test.com,
    // @example.com, @email.com) which breaks test signups.
    phoneHarmony({
      defaultCountry: "CA"
    }),
    anonymous({
      emailDomainName: "payload-better-auth.com",
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        console.log(
          "Link account for anonymous user: ",
          anonymousUser,
          newUser
        );
      },
      disableDeleteAnonymousUser: false
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, req) => {
        console.log("Send OTP for user: ", phoneNumber, code);
      }
    }),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        console.log("Send magic link for user: ", email, token, url);
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("Send verification OTP for user: ", email, otp, type);
      }
    }),
    passkey({
      rpID: "localhost",
      rpName: "Localhost",
      origin: "http://localhost:3000"
    }),
    apiKey(),
    multiSession(),
    testUtils({ captureOTP: true })
  ],
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "test-google-client-id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "test-google-client-secret"
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      console.log("Send verification email for user: ", url);
    }
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url, token }) => {
        console.log(
          "Send change email verification for user: ",
          user,
          newEmail,
          url,
          token
        );
      }
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
      }
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "email-password"]
    }
  }
} satisfies BetterAuthOptions;

export const betterAuthPluginOptions = {
  disabled: false,
  debug: {
    logTables: false,
    enableDebugLogs: false
  },
  hidePluginCollections: true,
  users: {
    roles: ["user", "admin", "adminSuperAdmin"] as const,
    hidden: false,
    adminRoles: ["admin"],
    allowedFields: ["name"]
  },
  adminInvitations: {
    sendInviteEmail: async ({
      payload,
      email,
      url
    }: {
      payload: any;
      email: string;
      url: string;
    }) => {
      console.log("Send admin invite: ", email, url);
      return {
        success: true as const
      };
    }
  },
  betterAuthOptions: betterAuthOptions
} satisfies PayloadAuthOptions;

type PayloadAuthOptionsType = typeof betterAuthPluginOptions;

const emailAdapter = () => {
  return () => ({
    name: "dev",
    defaultFromAddress: "test@performix.ca",
    defaultFromName: "Test",
    sendEmail: async (message) => {
      console.log("Sending email", message);
    }
  });
};

export const payloadConfig = buildConfig({
  admin: {
    user: "users"
  },
  serverURL: "http://localhost:3000",
  secret: "super-secret-payload-key",
  db: postgresAdapter({
    pool: {
      connectionString: "postgres://forrestdevs:@localhost:5432/auth-test"
    },
    migrationDir: decodeURIComponent(
      new URL("./migrations", import.meta.url).pathname
    ),
    transactionOptions: false,
    push: false
  }),
  email: emailAdapter(),
  telemetry: false,
  plugins: [betterAuthPlugin(betterAuthPluginOptions)],
  typescript: {
    outputFile: decodeURIComponent(
      new URL("./payload-types.ts", import.meta.url).pathname
    )
  }
});

export async function getPayload() {
  return await getPayloadAuth<PayloadAuthOptionsType>(payloadConfig);
}

export type Errors = BetterAuthReturn<PayloadAuthOptionsType>["$ERROR_CODES"]

export type Session =
  BetterAuthReturn<PayloadAuthOptionsType>["$Infer"]["Session"]["user"];

export type User =
  BetterAuthReturn<PayloadAuthOptionsType>["$Infer"]["Session"]["user"]["role"];

export type Organization =
  BetterAuthReturn<PayloadAuthOptionsType>["$Infer"]["Organization"];

export type Member =
  BetterAuthReturn<PayloadAuthOptionsType>["$Infer"]["Member"];

export type Invitation =
  BetterAuthReturn<PayloadAuthOptionsType>["$Infer"]["Invitation"];

export default payloadConfig;
