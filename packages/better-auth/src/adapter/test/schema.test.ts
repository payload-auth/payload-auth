import { generateSchema } from "../generate-schema";
import { describe, expect, it, test } from "vitest";
import { format } from "prettier";
import { getPayloadPath } from "../generate-schema/utils";

const PAYLOAD_TEST_DIR_PATH = getPayloadPath("./test/test_payload1");
const PAYLOAD_TEST_DIR_PATH2 = getPayloadPath("./test/test_payload2");
const PAYLOAD_TEST_DIR_PATH3 = getPayloadPath("./test/test_payload3");

describe(`Handle schema generation`, async () => {
	it("should generate the correct schema with existing schema", async () => {
		const generate_schema = await generateSchema(
			{
				plugins: [
					{
						schema: {
							testTable: {
								fields: {
									hello: {
										type: "boolean",
										required: false,
									},
									hello2: {
										type: "string",
										required: true,
									},
								},
							},
						},
						id: "test",
					},
				],
			},
			{
				outputDir: PAYLOAD_TEST_DIR_PATH,
			},
		);

		// console.log(generate_schema);

		const hard_coded_schema = await format(
			`/**
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

const TestTable: CollectionConfig = {
  slug: "testTable",
  admin: {
    useAsTitle: "hello",
  },
  fields: [
    {
      name: "hello",
      type: "checkbox",
    },
    {
      name: "hello2",
      type: "text",
      required: true,
    },
  ],
  timestamps: true,
} as const;

export { User, Session, Account, Verification, TestTable };

`,
			{ filepath: "schema.ts" },
		);

		// if (generate_schema !== hard_coded_schema) {
		//   console.log(`\n\n\n--------------------------------- Generated:`);
		//   console.log(generate_schema);
		//   console.log(`--------------------------------- Hard-coded:`);
		//   console.log(hard_coded_schema);
		//   console.log(`---------------------------------\n\n\n`);
		// }
		expect(generate_schema).toEqual(hard_coded_schema);
	});

	//   it("should generate the correct schema based on multiple plugins", async () => {
	//     const generate_schema = await generateSchema(
	//       {
	//         plugins: [
	//           {
	//             schema: {
	//               user: {
	//                 fields: {},
	//               },
	//               admins: {
	//                 fields: {},
	//               },
	//             },
	//             id: "test",
	//           },
	//         ],
	//       },
	//       {
	//         payload_dir_path: PAYLOAD_TEST_DIR_PATH2,
	//       }
	//     );

	//     const hard_coded_schema = await format(
	//       `/**
	//  * EXAMPLE COLLECTIONS FOR BETTER AUTH
	//  *
	//  * Below is what your Payload collections should look like.
	//  * Please copy these to your actual collection configs.
	//  * Make sure to add an authStrategy for the users collection if there is one.
	//  *
	//  * Example auth strategy:
	//  * auth: {
	//  *   disableLocalStrategy: true,
	//  *   strategies: [
	//  *     betterAuthStrategy(),
	//  *     // Add other strategies as needed
	//  *   ],
	//  * },
	//  */
	// import type { CollectionConfig } from "payload";

	// const User: CollectionConfig = {
	//   slug: "user",
	//   admin: {
	//     useAsTitle: "name",
	//   },
	//   fields: [
	//     {
	//       name: "name",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "email",
	//       type: "email",
	//       required: true,
	//       unique: true,
	//     },
	//     {
	//       name: "emailVerified",
	//       type: "checkbox",
	//       required: true,
	//       defaultValue: false,
	//     },
	//     {
	//       name: "image",
	//       type: "upload",
	//       relationTo: "media",
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Session: CollectionConfig = {
	//   slug: "session",
	//   admin: {
	//     useAsTitle: "expiresAt",
	//   },
	//   fields: [
	//     {
	//       name: "expiresAt",
	//       type: "date",
	//       required: true,
	//     },
	//     {
	//       name: "token",
	//       type: "text",
	//       required: true,
	//       unique: true,
	//     },
	//     {
	//       name: "ipAddress",
	//       type: "text",
	//     },
	//     {
	//       name: "userAgent",
	//       type: "text",
	//     },
	//     {
	//       name: "userId",
	//       type: "relationship",
	//       relationTo: "user",
	//       required: true,
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Account: CollectionConfig = {
	//   slug: "account",
	//   admin: {
	//     useAsTitle: "accountId",
	//   },
	//   fields: [
	//     {
	//       name: "accountId",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "providerId",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "userId",
	//       type: "relationship",
	//       relationTo: "user",
	//       required: true,
	//     },
	//     {
	//       name: "accessToken",
	//       type: "text",
	//     },
	//     {
	//       name: "refreshToken",
	//       type: "text",
	//     },
	//     {
	//       name: "idToken",
	//       type: "text",
	//     },
	//     {
	//       name: "accessTokenExpiresAt",
	//       type: "date",
	//     },
	//     {
	//       name: "refreshTokenExpiresAt",
	//       type: "date",
	//     },
	//     {
	//       name: "scope",
	//       type: "text",
	//     },
	//     {
	//       name: "password",
	//       type: "text",
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Verification: CollectionConfig = {
	//   slug: "verification",
	//   admin: {
	//     useAsTitle: "identifier",
	//   },
	//   fields: [
	//     {
	//       name: "identifier",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "value",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "expiresAt",
	//       type: "date",
	//       required: true,
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Admins: CollectionConfig = {
	//   slug: "admins",
	//   admin: {
	//     useAsTitle: "id",
	//   },
	//   fields: [],
	//   timestamps: true,
	// } as const;

	// export { User, Session, Account, Verification, Admins };
	// `,
	//       { filepath: "schema.ts" }
	//     );

	//     if (generate_schema !== hard_coded_schema) {
	//       console.log(`\n\n\n--------------------------------- Generated:`);
	//       console.log(generate_schema);
	//       console.log(`--------------------------------- Hard-coded:`);
	//       console.log(hard_coded_schema);
	//       console.log(`---------------------------------\n\n\n`);
	//     }

	//     expect(generate_schema).toBe(hard_coded_schema);
	//   });

	//   it(`should generate the correct schema based on multiple different field types`, async () => {
	//     const generate_schema = await generateSchema(
	//       {
	//         plugins: [
	//           {
	//             id: "admin",
	//             schema: {
	//               admin: {
	//                 fields: {
	//                   name: {
	//                     type: "string",
	//                     required: true,
	//                   },
	//                   id: {
	//                     type: "string",
	//                     required: true,
	//                   },
	//                   isAdmin: {
	//                     type: "boolean",
	//                     required: true,
	//                   },
	//                   status: {
	//                     type: "string",
	//                     required: false,
	//                   },
	//                   date: {
	//                     type: "date",
	//                   },
	//                   number: {
	//                     type: "number",
	//                   },
	//                   str_array: {
	//                     type: "string[]",
	//                   },
	//                   num_array: {
	//                     type: "number[]",
	//                   },
	//                 },
	//               },
	//             },
	//           },
	//         ],
	//       },
	//       {
	//         payload_dir_path: PAYLOAD_TEST_DIR_PATH3,
	//       }
	//     );

	//     const hard_coded_schema = await format(
	//       `/**
	//  * EXAMPLE COLLECTIONS FOR BETTER AUTH
	//  *
	//  * Below is what your Payload collections should look like.
	//  * Please copy these to your actual collection configs.
	//  * Make sure to add an authStrategy for the users collection if there is one.
	//  *
	//  * Example auth strategy:
	//  * auth: {
	//  *   disableLocalStrategy: true,
	//  *   strategies: [
	//  *     betterAuthStrategy(),
	//  *     // Add other strategies as needed
	//  *   ],
	//  * },
	//  */
	// import type { CollectionConfig } from "payload";

	// const User: CollectionConfig = {
	//   slug: "user",
	//   admin: {
	//     useAsTitle: "name",
	//   },
	//   fields: [
	//     {
	//       name: "name",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "email",
	//       type: "email",
	//       required: true,
	//       unique: true,
	//     },
	//     {
	//       name: "emailVerified",
	//       type: "checkbox",
	//       required: true,
	//       defaultValue: false,
	//     },
	//     {
	//       name: "image",
	//       type: "upload",
	//       relationTo: "media",
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Session: CollectionConfig = {
	//   slug: "session",
	//   admin: {
	//     useAsTitle: "expiresAt",
	//   },
	//   fields: [
	//     {
	//       name: "expiresAt",
	//       type: "date",
	//       required: true,
	//     },
	//     {
	//       name: "token",
	//       type: "text",
	//       required: true,
	//       unique: true,
	//     },
	//     {
	//       name: "ipAddress",
	//       type: "text",
	//     },
	//     {
	//       name: "userAgent",
	//       type: "text",
	//     },
	//     {
	//       name: "userId",
	//       type: "relationship",
	//       relationTo: "user",
	//       required: true,
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Account: CollectionConfig = {
	//   slug: "account",
	//   admin: {
	//     useAsTitle: "accountId",
	//   },
	//   fields: [
	//     {
	//       name: "accountId",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "providerId",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "userId",
	//       type: "relationship",
	//       relationTo: "user",
	//       required: true,
	//     },
	//     {
	//       name: "accessToken",
	//       type: "text",
	//     },
	//     {
	//       name: "refreshToken",
	//       type: "text",
	//     },
	//     {
	//       name: "idToken",
	//       type: "text",
	//     },
	//     {
	//       name: "accessTokenExpiresAt",
	//       type: "date",
	//     },
	//     {
	//       name: "refreshTokenExpiresAt",
	//       type: "date",
	//     },
	//     {
	//       name: "scope",
	//       type: "text",
	//     },
	//     {
	//       name: "password",
	//       type: "text",
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Verification: CollectionConfig = {
	//   slug: "verification",
	//   admin: {
	//     useAsTitle: "identifier",
	//   },
	//   fields: [
	//     {
	//       name: "identifier",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "value",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "expiresAt",
	//       type: "date",
	//       required: true,
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// const Admin: CollectionConfig = {
	//   slug: "admin",
	//   admin: {
	//     useAsTitle: "name",
	//   },
	//   fields: [
	//     {
	//       name: "name",
	//       type: "text",
	//       required: true,
	//     },
	//     {
	//       name: "isAdmin",
	//       type: "checkbox",
	//       required: true,
	//     },
	//     {
	//       name: "status",
	//       type: "text",
	//     },
	//     {
	//       name: "date",
	//       type: "date",
	//     },
	//     {
	//       name: "number",
	//       type: "number",
	//     },
	//     {
	//       name: "str_array",
	//       type: "text",
	//     },
	//     {
	//       name: "num_array",
	//       type: "text",
	//     },
	//   ],
	//   timestamps: true,
	// } as const;

	// export { User, Session, Account, Verification, Admin };
	//       `,
	//       { filepath: "schema.ts" }
	//     );

	//     if (generate_schema !== hard_coded_schema) {
	//       console.log(`\n\n\n--------------------------------- Generated:`);
	//       console.log(generate_schema);
	//       console.log(`--------------------------------- Hard-coded:`);
	//       console.log(hard_coded_schema);
	//       console.log(`---------------------------------\n\n\n`);
	//     }

	//     expect(generate_schema).toBe(hard_coded_schema);
	//   });

	//   test.skip("should support .index method after `defineTable`", async () => {
	//     const generate_schema = await generateSchema(
	//       {
	//         plugins: [
	//           {
	//             schema: {
	//               testTable: {
	//                 fields: {},
	//               },
	//             },
	//             id: "test",
	//           },
	//         ],
	//       },
	//       {
	//         payload_dir_path: PAYLOAD_TEST_DIR_PATH3,
	//       }
	//     );

	//     const hard_coded_schema = await format(
	//       [
	//         `import {defineSchema,defineTable} from "convex/server";`,
	//         `import {v} from "convex/values";`,
	//         ``,
	//         `export default defineSchema({`,
	//         default_tables,
	//         `testTable: defineTable({`,
	//         `}).index("by_something", ["email"]),`,
	//         `});`,
	//       ].join("\n"),
	//       { filepath: "schema.ts" }
	//     );

	//     if (generate_schema !== hard_coded_schema) {
	//       console.log(`\n\n\n--------------------------------- Generated:`);
	//       console.log(generate_schema);
	//       console.log(`--------------------------------- Hard-coded:`);
	//       console.log(hard_coded_schema);
	//       console.log(`---------------------------------\n\n\n`);
	//     }

	//     expect(generate_schema).toBe(hard_coded_schema);
	//   });

	//   it(`should generate references correctly`, async () => {
	//     const generate_schema = await generateSchema(
	//       {
	//         plugins: [
	//           {
	//             id: "admin",
	//             schema: {
	//               admin: {
	//                 fields: {
	//                   id: {
	//                     type: "string",
	//                     required: true,
	//                   },

	//                   reference_optional: {
	//                     type: "string",
	//                     references: {
	//                       field: "something",
	//                       model: "something_else",
	//                     },
	//                   },
	//                   reference_required: {
	//                     type: "string",
	//                     required: true,
	//                     references: {
	//                       field: "something2",
	//                       model: "something2_else",
	//                     },
	//                   },
	//                 },
	//               },
	//             },
	//           },
	//         ],
	//       },
	//       {
	//         payload_dir_path: PAYLOAD_TEST_DIR_PATH3,
	//       }
	//     );

	//     const hard_coded_schema = await format(
	//       [
	//         `import {defineSchema,defineTable} from "convex/server";`,
	//         `import {v} from "convex/values";`,
	//         ``,
	//         `export default defineSchema({`,
	//         default_tables,
	//         `admin: defineTable({`,
	//         `id: v.id("admin"),`,
	//         `reference_optional: v.id("something_else"),`,
	//         `reference_required: v.id("something2_else"),`,
	//         `}),`,
	//         `});`,
	//       ].join("\n"),
	//       { filepath: "schema.ts" }
	//     );

	//     if (generate_schema !== hard_coded_schema) {
	//       console.log(`\n\n\n--------------------------------- Generated:`);
	//       console.log(generate_schema);
	//       console.log(`--------------------------------- Hard-coded:`);
	//       console.log(hard_coded_schema);
	//       console.log(`---------------------------------\n\n\n`);
	//     }
	//     expect(generate_schema).toBe(hard_coded_schema);
	//   });
});
