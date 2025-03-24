import { betterAuth, type BetterAuthOptions } from "better-auth";
import { afterAll, beforeAll, describe, expect, it, test } from "vitest";
import { payloadAdapter } from "./../src/index";
import { runAdapterTest } from "./better-auth-adapter-test.js";
import { getPayload } from "../dev/index.js";
import { BasePayload } from "payload";

describe("Handle Payload Adapter", async () => {
	it("should successfully add the Payload Adapter", async () => {
		const payload = await getPayload();

		const auth = betterAuth({
			database: payloadAdapter(payload),
		});

		expect(auth).toBeDefined();
		expect(auth.options.database).toBeDefined();
		expect(auth.options.database({}).id).toEqual("payload");
	});
});

function deleteAll(payload: BasePayload) {
	beforeAll(async () => {
		// delete all users and sessions
		const res = await payload.delete({
			collection: "user",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("before users: ", res.docs.length, res.errors);
		const res2 = await payload.delete({
			collection: "session",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("before sessions: ", res2.docs.length, res2.errors);
		const res3 = await payload.delete({
			collection: "account",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("before accounts: ", res3.docs.length, res3.errors);
		const res4 = await payload.delete({
			collection: "verification",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("before verification: ", res4.docs.length, res4.errors);
	});
	afterAll(async () => {
		const res2 = await payload.delete({
			collection: "session",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("after sessions: ", res2.docs.length, res2.errors);
		const res3 = await payload.delete({
			collection: "account",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("after accounts: ", res3.docs.length, res3.errors);
		const res = await payload.delete({
			collection: "user",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("after users: ", res.docs.length, res.errors);

		const res4 = await payload.delete({
			collection: "verification",
			where: {
				id: {
					exists: true,
				},
			},
		});
		console.log("after verification: ", res4.docs.length, res4.errors);
	});
}

describe("Run BetterAuth Adapter tests", async () => {
	const payload = await getPayload();

	deleteAll(payload);

	const adapter = payloadAdapter(payload, {
		enable_debug_logs: true,
	});

	await runAdapterTest({
		getAdapter: async (
			customOptions = {
				session: {
					fields: {
						userId: "user",
					},
				},
				account: {
					fields: {
						userId: "user",
					},
				},
			},
		) => {
			return adapter({ ...customOptions });
		},
		skipGenerateIdTest: true,
	});
	test("should find many with offset and limit", async () => {
		// At this point, `user` contains 8 rows.
		// offset of 2 returns 6 rows
		// limit of 2 returns 2 rows
		const res = await adapter({}).findMany({
			model: "user",
			offset: 2,
			limit: 2,
		});
		expect(res.length).toBe(2);
	});
});

describe("Authentication Flow Tests", async () => {
	const testUser = {
		email: "test-email@email.com",
		password: "password12345",
		name: "Test Name",
	};
	const payload = await getPayload();

	deleteAll(payload);

	const auth = betterAuth({
		database: payloadAdapter(payload, {
			enable_debug_logs: true,
		}),
		emailAndPassword: {
			enabled: true,
		},
		session: {
			fields: {
				userId: "user",
			},
		},
		account: {
			fields: {
				userId: "user",
			},
		},
	});

	it("should successfully sign up a new user", async () => {
		const user = await auth.api.signUpEmail({
			body: {
				email: testUser.email,
				password: testUser.password,
				name: testUser.name,
			},
		});
		expect(user).toBeDefined();
	});

	it("should successfully sign in an existing user", async () => {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const user = await auth.api.signInEmail({
			body: {
				email: testUser.email,
				password: testUser.password,
			},
		});

		expect(user.user).toBeDefined();
	});
});
