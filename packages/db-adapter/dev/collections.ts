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
		},
		{
			name: "image",
			type: "upload",
			relationTo: "media",
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
			required: true,
			relationTo: "user",
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
			type: "number",
			required: true,
		},
		{
			name: "providerId",
			type: "text",
		},
		{
			name: "userId",
			type: "relationship",
			required: true,
			relationTo: "user",
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

const Media: CollectionConfig = {
	slug: "media",
	fields: [
		{
			name: "alt",
			type: "text",
		},
	],
	upload: {
		adminThumbnail: "thumbnail",
		imageSizes: [
			{
				name: "thumbnail",
				fit: "cover",
				width: 500,
				formatOptions: {
					format: "webp",
					options: {
						quality: 100,
					},
				},
			},
		],
		formatOptions: {
			format: "webp",
			options: {
				quality: 80,
			},
		},
		resizeOptions: {
			width: 2560,
			withoutEnlargement: true,
		},
		bulkUpload: true,
		disableLocalStorage: true,
		focalPoint: true,
		crop: true,
		pasteURL: {
			allowList: [
				{
					hostname: "payloadcms.com", // required
					pathname: "",
					port: "",
					protocol: "https",
					search: "",
				},
				{
					hostname: "drive.google.com",
					protocol: "https",
				},
				{
					hostname: "www.bonavistaleisurescapes.com",
					protocol: "https",
				},
				{
					hostname: "www.acdcfeeds.com",
					protocol: "https",
				},
			],
		},
	},
} as const;

const collections = [User, Session, Account, Verification, Media];

export { collections };
