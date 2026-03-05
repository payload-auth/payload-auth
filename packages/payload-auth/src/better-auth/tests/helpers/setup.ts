import type { BasePayload } from "payload";
import type { TestHelpers } from "better-auth/plugins";
import { getPayload } from "../dev";

let _payload: Awaited<ReturnType<typeof getPayload>> | null = null;

/**
 * Returns a singleton Payload instance for tests.
 * The instance is created once and reused across all tests in the same worker.
 */
export async function getTestPayload() {
  if (!_payload) {
    _payload = await getPayload();
  }
  return _payload;
}

let _testHelpers: TestHelpers | null = null;

/**
 * Returns the Better Auth test-utils helpers from the auth context.
 * Singleton — the context is resolved once and cached.
 *
 * Cast needed because the testUtils plugin injects `test` at runtime
 * but TypeScript can't infer plugin augmentations on the context type.
 */
export async function getTestHelpers(): Promise<TestHelpers> {
  if (!_testHelpers) {
    const payload = await getTestPayload();
    const ctx = (await payload.betterAuth.$context) as unknown as { test: TestHelpers };
    _testHelpers = ctx.test;
  }
  return _testHelpers!;
}

/**
 * Returns both the Payload instance and test helpers in one call.
 */
export async function getTestContext() {
  const payload = await getTestPayload();
  const test = await getTestHelpers();
  return { payload, test };
}

/**
 * Collection slugs that the plugin creates.
 * Used for cleanup between tests.
 */
const pluginCollections = [
  "sessions",
  "accounts",
  "verifications",
  "admin-invitations"
] as const;

/**
 * Delete all records from all auth-related collections.
 * Order matters — delete referencing collections first.
 */
export async function cleanupAll(payload: BasePayload) {
  const allCollections = [
    ...pluginCollections,
    "users"
  ] as const;

  for (const slug of allCollections) {
    try {
      await payload.delete({
        collection: slug,
        where: { id: { exists: true } }
      });
    } catch {
      // Collection may not exist in this config
    }
  }
}
