/**
 * EXAMPLE COLLECTIONS FOR BETTER AUTH
 *
 * Below is what your Payload collections should look like.
 * Please copy these to your actual collection configs.
 * Make sure to add an authStrategy for the users collection if there is one.
 *
 * Example auth strategy:
 * auth: {
 *   disableLocalStrategy: true,
 *   strategies: [
 *     betterAuthStrategy(),
 *     // Add other strategies as needed
 *   ],
 * },
 */
import type { CollectionConfig } from "payload";

const User: CollectionConfig = {
  slug: "user",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
    },
    {
      name: "emailVerified",
      type: "checkbox",
      required: true,
      defaultValue: false,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "twoFactorEnabled",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "role",
      type: "text",
    },
    {
      name: "banned",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "banReason",
      type: "text",
    },
    {
      name: "banExpires",
      type: "date",
    },
  ],
  timestamps: true,
} as const;

const Session: CollectionConfig = {
  slug: "session",
  admin: {
    useAsTitle: "expiresAt",
  },
  fields: [
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
    {
      name: "token",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "ipAddress",
      type: "text",
    },
    {
      name: "userAgent",
      type: "text",
    },
    {
      name: "userId",
      type: "relationship",
      relationTo: "user",
      required: true,
    },
    {
      name: "activeOrganizationId",
      type: "text",
    },
    {
      name: "user",
      type: "text",
    },
  ],
  timestamps: true,
} as const;

const Account: CollectionConfig = {
  slug: "account",
  admin: {
    useAsTitle: "accountId",
  },
  fields: [
    {
      name: "accountId",
      type: "text",
      required: true,
    },
    {
      name: "providerId",
      type: "text",
      required: true,
    },
    {
      name: "userId",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "accessToken",
      type: "text",
    },
    {
      name: "refreshToken",
      type: "text",
    },
    {
      name: "idToken",
      type: "text",
    },
    {
      name: "accessTokenExpiresAt",
      type: "date",
    },
    {
      name: "refreshTokenExpiresAt",
      type: "date",
    },
    {
      name: "scope",
      type: "text",
    },
    {
      name: "password",
      type: "text",
    },
  ],
  timestamps: true,
} as const;

const Verification: CollectionConfig = {
  slug: "verification",
  admin: {
    useAsTitle: "identifier",
  },
  fields: [
    {
      name: "identifier",
      type: "text",
      required: true,
    },
    {
      name: "value",
      type: "text",
      required: true,
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
  ],
  timestamps: true,
} as const;

const Organization: CollectionConfig = {
  slug: "organization",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
    },
    {
      name: "logo",
      type: "text",
    },
    {
      name: "metadata",
      type: "text",
    },
  ],
  timestamps: true,
} as const;

const Member: CollectionConfig = {
  slug: "member",
  admin: {
    useAsTitle: "organizationId",
  },
  fields: [
    {
      name: "organization",
      type: "relationship",
      relationTo: "organization",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "role",
      type: "text",
      required: true,
      defaultValue: "member",
    },
  ],
  timestamps: true,
} as const;

const Invitation: CollectionConfig = {
  slug: "invitation",
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "organization",
      type: "relationship",
      relationTo: "organization",
      required: true,
    },
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "role",
      type: "text",
    },
    {
      name: "status",
      type: "text",
      required: true,
      defaultValue: "pending",
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
    {
      name: "inviter",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
  ],
  timestamps: true,
} as const;

const TwoFactor: CollectionConfig = {
  slug: "twoFactor",
  admin: {
    useAsTitle: "secret",
  },
  fields: [
    {
      name: "secret",
      type: "text",
      required: true,
    },
    {
      name: "backupCodes",
      type: "text",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
  ],
  timestamps: true,
} as const;

const Passkey: CollectionConfig = {
  slug: "passkey",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "publicKey",
      type: "text",
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "credentialID",
      type: "text",
      required: true,
    },
    {
      name: "counter",
      type: "number",
      required: true,
    },
    {
      name: "deviceType",
      type: "text",
      required: true,
    },
    {
      name: "backedUp",
      type: "checkbox",
      required: true,
    },
    {
      name: "transports",
      type: "text",
    },
  ],
  timestamps: true,
} as const;

const OauthApplication: CollectionConfig = {
  slug: "oauthApplication",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "icon",
      type: "text",
    },
    {
      name: "metadata",
      type: "text",
    },
    {
      name: "clientId",
      type: "text",
      unique: true,
    },
    {
      name: "clientSecret",
      type: "text",
    },
    {
      name: "redirectURLs",
      type: "text",
    },
    {
      name: "type",
      type: "text",
    },
    {
      name: "disabled",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "userId",
      type: "text",
    },
  ],
  timestamps: true,
} as const;

const OauthAccessToken: CollectionConfig = {
  slug: "oauthAccessToken",
  admin: {
    useAsTitle: "accessToken",
  },
  fields: [
    {
      name: "accessToken",
      type: "text",
      unique: true,
    },
    {
      name: "refreshToken",
      type: "text",
      unique: true,
    },
    {
      name: "accessTokenExpiresAt",
      type: "date",
    },
    {
      name: "refreshTokenExpiresAt",
      type: "date",
    },
    {
      name: "clientId",
      type: "text",
    },
    {
      name: "userId",
      type: "text",
    },
    {
      name: "scopes",
      type: "text",
    },
  ],
  timestamps: true,
} as const;

const OauthConsent: CollectionConfig = {
  slug: "oauthConsent",
  admin: {
    useAsTitle: "clientId",
  },
  fields: [
    {
      name: "clientId",
      type: "text",
    },
    {
      name: "userId",
      type: "text",
    },
    {
      name: "scopes",
      type: "text",
    },
    {
      name: "consentGiven",
      type: "checkbox",
    },
  ],
  timestamps: true,
} as const;

export {
  User,
  Session,
  Account,
  Verification,
  Organization,
  Member,
  Invitation,
  TwoFactor,
  Passkey,
  OauthApplication,
  OauthAccessToken,
  OauthConsent,
};
