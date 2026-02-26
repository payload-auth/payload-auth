import { describe, expect, it } from "vitest";
import type { BetterAuthOptions } from "better-auth";
import type { BasePayload } from "payload";
import { createTransform } from "../transform/index";

// Minimal BetterAuth options to initialize the transform layer.
// getAuthTables() needs at least the base schema for user, session, account, verification.
const minimalOptions: BetterAuthOptions = {
  database: { type: "sqlite", url: ":memory:" },
  baseURL: "http://localhost:3000",
  user: {
    modelName: "users"
  },
  session: {
    modelName: "sessions"
  },
  account: {
    modelName: "accounts"
  }
};

// Helper to create a mock collection entry matching Payload's Collection interface.
// getCollectionByModelKey looks up by c.config.custom.betterAuthModelKey or c.config.slug.
function mockCollection(slug: string, modelKey: string, fields: any[]) {
  return {
    config: {
      slug,
      custom: { betterAuthModelKey: modelKey },
      fields
    }
  };
}

// Minimal mock Payload instance that provides collection config for field lookups
function defaultMockPayload(): BasePayload {
  return {
    collections: {
      users: mockCollection("users", "user", [
        { name: "id", type: "number" },
        { name: "name", type: "text" },
        { name: "email", type: "text" },
        { name: "emailVerified", type: "checkbox" },
        { name: "image", type: "text" },
        { name: "createdAt", type: "date" },
        { name: "updatedAt", type: "date" }
      ]),
      sessions: mockCollection("sessions", "session", [
        { name: "id", type: "number" },
        { name: "token", type: "text" },
        { name: "userId", type: "relationship", relationTo: "users" },
        { name: "expiresAt", type: "date" },
        { name: "createdAt", type: "date" },
        { name: "updatedAt", type: "date" }
      ]),
      accounts: mockCollection("accounts", "account", [
        { name: "id", type: "number" },
        { name: "userId", type: "relationship", relationTo: "users" },
        { name: "accountId", type: "text" },
        { name: "providerId", type: "text" },
        { name: "password", type: "text" },
        { name: "createdAt", type: "date" },
        { name: "updatedAt", type: "date" }
      ]),
      verifications: mockCollection("verifications", "verification", [
        { name: "id", type: "number" },
        { name: "identifier", type: "text" },
        { name: "value", type: "text" },
        { name: "expiresAt", type: "date" },
        { name: "createdAt", type: "date" },
        { name: "updatedAt", type: "date" }
      ])
    }
  } as unknown as BasePayload;
}

describe("Transform Layer", () => {
  describe("transformInput", () => {
    it("passes null values through for field clearing (P0-5 fix)", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.transformInput({
        data: { image: null, name: "test" },
        model: "user" as any,
        idType: "text",
        payload
      });

      expect(result).toHaveProperty("image");
      expect(result.image).toBeNull();
      expect(result.name).toBe("test");
    });

    it("skips undefined values", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.transformInput({
        data: { image: undefined, name: "test" },
        model: "user" as any,
        idType: "text",
        payload
      });

      expect(result).not.toHaveProperty("image");
      expect(result.name).toBe("test");
    });

    it("handles empty data object", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.transformInput({
        data: {},
        model: "user" as any,
        idType: "text",
        payload
      });

      expect(result).toEqual({});
    });

    it("preserves standard field values", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.transformInput({
        data: { name: "John", email: "john@test.com", emailVerified: true },
        model: "user" as any,
        idType: "text",
        payload
      });

      expect(result.name).toBe("John");
      expect(result.email).toBe("john@test.com");
      expect(result.emailVerified).toBe(true);
    });

    it("passes through multiple null fields for clearing", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.transformInput({
        data: { image: null, name: null },
        model: "user" as any,
        idType: "text",
        payload
      });

      expect(result.image).toBeNull();
      expect(result.name).toBeNull();
    });
  });

  describe("convertWhereClause", () => {
    it("returns empty object for undefined where", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: undefined,
        payload
      });

      expect(result).toEqual({});
    });

    it("maps single condition correctly", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "email", value: "test@test.com" }],
        payload
      });

      expect(result).toHaveProperty("email");
      expect(result.email).toEqual({ equals: "test@test.com" });
    });

    it("maps eq operator", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "name", operator: "eq", value: "John" }],
        payload
      });

      expect(result.name).toEqual({ equals: "John" });
    });

    it("maps ne operator", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "name", operator: "ne", value: "John" }],
        payload
      });

      expect(result.name).toEqual({ not_equals: "John" });
    });

    it("maps gt/gte/lt/lte operators", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const gtResult = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "id", operator: "gt", value: "5" }],
        payload
      });
      expect(gtResult.id).toEqual({ greater_than: "5" });

      const gteResult = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "id", operator: "gte", value: "5" }],
        payload
      });
      expect(gteResult.id).toEqual({ greater_than_equal: "5" });

      const ltResult = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "id", operator: "lt", value: "5" }],
        payload
      });
      expect(ltResult.id).toEqual({ less_than: "5" });

      const lteResult = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "id", operator: "lte", value: "5" }],
        payload
      });
      expect(lteResult.id).toEqual({ less_than_equal: "5" });
    });

    it("maps contains operator", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "name", operator: "contains", value: "john" }],
        payload
      });

      expect(result.name).toEqual({ contains: "john" });
    });

    it("maps in operator", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [
          { field: "id", operator: "in", value: ["1", "2", "3"] }
        ],
        payload
      });

      expect(result.id).toEqual({ in: ["1", "2", "3"] });
    });

    it("maps starts_with operator to like with suffix", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "name", operator: "starts_with", value: "Jo" }],
        payload
      });

      expect(result.name).toEqual({ like: "Jo%" });
    });

    it("maps ends_with operator to like with prefix", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [{ field: "name", operator: "ends_with", value: "hn" }],
        payload
      });

      expect(result.name).toEqual({ like: "%hn" });
    });

    it("converts string ID to number in where clause when idType is number", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "number",
        model: "user" as any,
        where: [{ field: "id", value: "123" }],
        payload
      });

      expect(result.id).toEqual({ equals: 123 });
    });

    it("handles empty where array", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "text",
        model: "user" as any,
        where: [],
        payload
      });

      // Empty array → no conditions
      expect(result).toEqual({});
    });

    // P1-2: Relationship field ID conversion in WHERE clauses
    it("converts string userId to number in WHERE when idType is number (P1-2)", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "number",
        model: "session" as any,
        where: [{ field: "userId", value: "42" }],
        payload
      });

      // userId is a relationship field — its value should be converted to number
      expect(result.userId).toEqual({ equals: 42 });
    });

    it("converts string userId to number in account WHERE (P1-2)", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "number",
        model: "account" as any,
        where: [{ field: "userId", value: "99" }],
        payload
      });

      expect(result.userId).toEqual({ equals: 99 });
    });

    it("does not convert non-relationship field values (P1-2)", () => {
      const transform = createTransform(minimalOptions, false);
      const payload = defaultMockPayload();

      const result = transform.convertWhereClause({
        idType: "number",
        model: "user" as any,
        where: [{ field: "email", value: "test@test.com" }],
        payload
      });

      // email is not a relationship field — should remain a string
      expect(result.email).toEqual({ equals: "test@test.com" });
    });
  });

  describe("singleIdQuery", () => {
    it("extracts ID from simple equals query", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.singleIdQuery({ id: { equals: "123" } })).toBe("123");
      expect(transform.singleIdQuery({ id: { equals: 456 } })).toBe(456);
    });

    it("extracts ID from _id field", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.singleIdQuery({ _id: { equals: "abc" } })).toBe("abc");
    });

    it("returns null for complex queries", () => {
      const transform = createTransform(minimalOptions, false);

      expect(
        transform.singleIdQuery({ and: [{ id: { equals: "123" } }] } as any)
      ).toBeNull();
    });

    it("returns null for empty where clause", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.singleIdQuery(undefined as any)).toBeNull();
      expect(transform.singleIdQuery({} as any)).toBeNull();
    });

    it("returns null for non-ID field queries", () => {
      const transform = createTransform(minimalOptions, false);

      expect(
        transform.singleIdQuery({ email: { equals: "test@test.com" } } as any)
      ).toBeNull();
    });
  });

  describe("convertSort", () => {
    it("converts ascending sort", () => {
      const transform = createTransform(minimalOptions, false);

      expect(
        transform.convertSort("user" as any, {
          field: "name",
          direction: "asc"
        })
      ).toBe("name");
    });

    it("converts descending sort with dash prefix", () => {
      const transform = createTransform(minimalOptions, false);

      expect(
        transform.convertSort("user" as any, {
          field: "createdAt",
          direction: "desc"
        })
      ).toBe("-createdAt");
    });

    it("returns undefined when no sort specified", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.convertSort("user" as any, undefined)).toBeUndefined();
    });
  });

  describe("convertSelect", () => {
    it("converts field array to object with true values", () => {
      const transform = createTransform(minimalOptions, false);

      const result = transform.convertSelect("user" as any, [
        "email",
        "name"
      ]);
      expect(result).toEqual({ email: true, name: true });
    });

    it("returns undefined for empty select", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.convertSelect("user" as any, [])).toBeUndefined();
      expect(transform.convertSelect("user" as any, undefined)).toBeUndefined();
    });
  });

  describe("getCollectionSlug", () => {
    it("resolves model name to collection slug", () => {
      const transform = createTransform(minimalOptions, false);

      // The minimalOptions set user modelName to "users"
      expect(transform.getCollectionSlug("user" as any)).toBe("users");
    });
  });

  describe("getFieldName", () => {
    it("preserves id fields", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.getFieldName("user" as any, "id")).toBe("id");
      expect(transform.getFieldName("user" as any, "_id")).toBe("_id");
    });

    it("returns original field name when no mapping exists", () => {
      const transform = createTransform(minimalOptions, false);

      expect(transform.getFieldName("user" as any, "email")).toBe("email");
      expect(transform.getFieldName("user" as any, "name")).toBe("name");
    });
  });
});
