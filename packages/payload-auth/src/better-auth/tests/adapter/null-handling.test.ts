import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { payloadAdapter } from "../../adapter/index";
import { getPayload } from "../dev";

/**
 * Integration tests for null value handling through the adapter layer.
 * Verifies P0-5 fix: transformInput no longer drops null values.
 *
 * Requires a running Postgres database.
 */
describe("Null Value Handling", async () => {
  const payload = await getPayload();
  let testUserId: string | number;

  beforeAll(async () => {
    // Clean up any existing test data
    await payload.delete({
      collection: "users",
      where: { email: { equals: "null-test@test.com" } }
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      try {
        await payload.delete({
          collection: "users",
          id: testUserId
        });
      } catch {}
    }
    // Clean up sessions and accounts for this user
    await payload.delete({
      collection: "sessions",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "accounts",
      where: { id: { exists: true } }
    });
  });

  it("should create a user with image then clear image via Better Auth adapter", async () => {
    // Create user via Better Auth API
    const signUpResult = await payload.betterAuth.api.signUpEmail({
      body: {
        email: "null-test@test.com",
        password: "testpassword123",
        name: "Null Test User",
        image: "https://example.com/avatar.png"
      }
    });

    expect(signUpResult).toBeDefined();
    testUserId = signUpResult.user.id;

    // Verify the user was created with an image
    const user = await payload.findByID({
      collection: "users",
      id: testUserId
    });
    expect(user.image).toBe("https://example.com/avatar.png");
  });

  it("should allow clearing an optional field by setting it to null through the adapter", async () => {
    // Use the adapter directly to update image to null
    const adapter = payloadAdapter({
      payloadClient: payload,
      adapterConfig: {
        idType: payload.db.defaultIDType
      }
    });

    const adapterInstance = adapter({
      ...payload.betterAuth.options
    });

    // Update image to null - this should work after P0-5 fix
    const result = await adapterInstance.update({
      model: "user",
      where: [{ field: "id", value: String(testUserId) }],
      update: { image: null }
    });

    expect(result).toBeDefined();

    // Verify the image was actually cleared in the database
    const user = await payload.findByID({
      collection: "users",
      id: testUserId
    });

    // Image should be null/empty after the update
    expect(user.image).toBeFalsy();
  });

  it("should not clear fields when value is undefined (skip behavior)", async () => {
    // First set an image
    await payload.update({
      collection: "users",
      id: testUserId,
      data: { image: "https://example.com/restored.png" }
    });

    const adapter = payloadAdapter({
      payloadClient: payload,
      adapterConfig: {
        idType: payload.db.defaultIDType
      }
    });

    const adapterInstance = adapter({
      ...payload.betterAuth.options
    });

    // Update with undefined image - should be skipped, not clearing the field
    const result = await adapterInstance.update({
      model: "user",
      where: [{ field: "id", value: String(testUserId) }],
      update: { image: undefined, email: "null-test@test.com" }
    });

    expect(result).toBeDefined();

    // Verify image was NOT cleared
    const user = await payload.findByID({
      collection: "users",
      id: testUserId
    });
    expect(user.image).toBe("https://example.com/restored.png");
  });
});
