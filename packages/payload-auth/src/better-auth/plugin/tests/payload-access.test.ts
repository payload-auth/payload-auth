import { describe, expect, it, vi } from "vitest";
import type { PayloadRequest } from "payload";
import {
  hasAdminRoles,
  isAdminWithRoles,
  isAdminOrCurrentUserWithRoles,
  isAdminOrCurrentUserUpdateWithAllowedFields
} from "../lib/build-collections/utils/payload-access";

// Helper to create mock PayloadRequest objects
function mockReq(user: Record<string, any> | null = null): PayloadRequest {
  return {
    user,
    payload: {
      login: vi.fn()
    }
  } as unknown as PayloadRequest;
}

describe("hasAdminRoles", () => {
  it("detects admin role in array format", () => {
    const req = mockReq({ role: ["admin"] });
    expect(hasAdminRoles(["admin"])({ req })).toBe(true);
  });

  it("detects admin role in string format", () => {
    const req = mockReq({ role: "admin" });
    expect(hasAdminRoles(["admin"])({ req })).toBe(true);
  });

  it("detects admin role in comma-separated string", () => {
    const req = mockReq({ role: "user, admin" });
    expect(hasAdminRoles(["admin"])({ req })).toBe(true);
  });

  it("returns false for non-admin roles", () => {
    const req = mockReq({ role: ["user", "editor"] });
    expect(hasAdminRoles(["admin"])({ req })).toBe(false);
  });

  it("returns false when user has no role", () => {
    const req = mockReq({ id: "1" });
    expect(hasAdminRoles(["admin"])({ req })).toBe(false);
  });

  it("returns false when there is no user", () => {
    const req = mockReq(null);
    expect(hasAdminRoles(["admin"])({ req })).toBe(false);
  });

  it("supports multiple admin role values", () => {
    const req = mockReq({ role: ["superadmin"] });
    expect(hasAdminRoles(["admin", "superadmin"])({ req })).toBe(true);
  });
});

describe("isAdminWithRoles", () => {
  it("returns true for matching admin role", () => {
    const req = mockReq({ role: ["admin"] });
    expect(isAdminWithRoles({ adminRoles: ["admin"] })({ req })).toBe(true);
  });

  it("returns false for non-matching role", () => {
    const req = mockReq({ role: ["user"] });
    expect(isAdminWithRoles({ adminRoles: ["admin"] })({ req })).toBe(false);
  });

  it("returns false when there is no user", () => {
    const req = mockReq(null);
    expect(isAdminWithRoles({ adminRoles: ["admin"] })({ req })).toBe(false);
  });

  it("returns false when user has no role property", () => {
    const req = mockReq({ id: "1", email: "test@test.com" });
    expect(isAdminWithRoles({ adminRoles: ["admin"] })({ req })).toBe(false);
  });
});

describe("isAdminOrCurrentUserWithRoles", () => {
  it("returns true for admin user", () => {
    const req = mockReq({ id: "1", role: ["admin"] });
    const result = isAdminOrCurrentUserWithRoles({
      adminRoles: ["admin"]
    })({ req } as any);
    expect(result).toBe(true);
  });

  it("returns constraint object for current non-admin user", () => {
    const req = mockReq({ id: "user-1", role: ["user"] });
    const result = isAdminOrCurrentUserWithRoles({
      adminRoles: ["admin"]
    })({ req } as any);
    expect(result).toEqual({ id: { equals: "user-1" } });
  });

  it("returns false for unauthenticated request", () => {
    const req = mockReq(null);
    const result = isAdminOrCurrentUserWithRoles({
      adminRoles: ["admin"]
    })({ req } as any);
    expect(result).toBe(false);
  });

  it("uses custom idField for constraint", () => {
    const req = mockReq({ id: "user-1", role: ["user"] });
    const result = isAdminOrCurrentUserWithRoles({
      adminRoles: ["admin"],
      idField: "customId"
    })({ req } as any);
    expect(result).toEqual({ customId: { equals: "user-1" } });
  });
});

describe("isAdminOrCurrentUserUpdateWithAllowedFields", () => {
  it("returns true for admin users regardless of fields", async () => {
    const req = mockReq({ id: "1", role: ["admin"] });
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });
    const result = await accessFn({ req, id: "999", data: { role: ["superadmin"] } } as any);
    expect(result).toBe(true);
  });

  it("returns false for unauthenticated users", async () => {
    const req = mockReq(null);
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });
    const result = await accessFn({ req, id: "1", data: { name: "new" } } as any);
    expect(result).toBe(false);
  });

  it("allows current user to update allowed fields", async () => {
    const req = mockReq({ id: "user-1", role: ["user"] });
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name", "image"],
      userSlug: "users",
      adminRoles: ["admin"]
    });
    const result = await accessFn({
      req,
      id: "user-1",
      data: { name: "New Name" }
    } as any);
    expect(result).toBe(true);
  });

  it("rejects current user updating disallowed fields", async () => {
    const req = mockReq({ id: "user-1", role: ["user"] });
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });
    const result = await accessFn({
      req,
      id: "user-1",
      data: { role: ["admin"] }
    } as any);
    expect(result).toBe(false);
  });

  it("rejects when user tries to update a different user", async () => {
    const req = mockReq({ id: "user-1", role: ["user"] });
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });
    const result = await accessFn({
      req,
      id: "user-2",
      data: { name: "Hacked" }
    } as any);
    expect(result).toBe(false);
  });

  // P0-1 REGRESSION TEST: allowedFields array must NOT be mutated
  it("does NOT mutate the allowedFields config array after password change", async () => {
    const originalAllowedFields = ["name", "image"];
    const allowedFieldsCopy = [...originalAllowedFields];

    const req = mockReq({ id: "user-1", email: "test@test.com", role: ["user"] });
    (req.payload.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user-1" }
    });

    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: originalAllowedFields,
      userSlug: "users",
      adminRoles: ["admin"]
    });

    // Simulate successful password change
    await accessFn({
      req,
      id: "user-1",
      data: { name: "test", password: "newpass", currentPassword: "oldpass" }
    } as any);

    // The original array should NOT have been mutated
    expect(originalAllowedFields).toEqual(allowedFieldsCopy);
    expect(originalAllowedFields).not.toContain("password");
    expect(originalAllowedFields).not.toContain("currentPassword");
  });

  // P0-1 REGRESSION TEST: Second call must still require password verification
  it("still requires password verification on second invocation", async () => {
    const allowedFields = ["name"];

    const loginMock = vi.fn().mockResolvedValue({ user: { id: "user-1" } });

    // First invocation - password change succeeds
    const req1 = {
      user: { id: "user-1", email: "test@test.com", role: ["user"] },
      payload: { login: loginMock }
    } as unknown as PayloadRequest;

    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields,
      userSlug: "users",
      adminRoles: ["admin"]
    });

    await accessFn({
      req: req1,
      id: "user-1",
      data: { name: "test", password: "new1", currentPassword: "old1" }
    } as any);

    // Second invocation - password change WITHOUT currentPassword should fail
    const req2 = {
      user: { id: "user-1", email: "test@test.com", role: ["user"] },
      payload: { login: loginMock }
    } as unknown as PayloadRequest;

    const result = await accessFn({
      req: req2,
      id: "user-1",
      data: { name: "test", password: "new2" }
    } as any);

    expect(result).toBe(false);
  });

  it("requires both password and currentPassword for password changes", async () => {
    const req = mockReq({ id: "user-1", email: "test@test.com", role: ["user"] });
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });

    // Only password, no currentPassword
    const result1 = await accessFn({
      req,
      id: "user-1",
      data: { password: "newpass" }
    } as any);
    expect(result1).toBe(false);

    // Only currentPassword, no password
    const result2 = await accessFn({
      req,
      id: "user-1",
      data: { currentPassword: "oldpass" }
    } as any);
    expect(result2).toBe(false);
  });

  it("returns false when login verification fails (wrong current password)", async () => {
    const req = mockReq({ id: "user-1", email: "test@test.com", role: ["user"] });
    (req.payload.login as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Invalid credentials")
    );

    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });

    const result = await accessFn({
      req,
      id: "user-1",
      data: { password: "newpass", currentPassword: "wrongpass" }
    } as any);
    expect(result).toBe(false);
  });

  it("returns false when user has no email and tries password change", async () => {
    const req = mockReq({ id: "user-1", role: ["user"] });
    const accessFn = isAdminOrCurrentUserUpdateWithAllowedFields({
      allowedFields: ["name"],
      userSlug: "users",
      adminRoles: ["admin"]
    });

    const result = await accessFn({
      req,
      id: "user-1",
      data: { password: "newpass", currentPassword: "oldpass" }
    } as any);
    expect(result).toBe(false);
  });
});
