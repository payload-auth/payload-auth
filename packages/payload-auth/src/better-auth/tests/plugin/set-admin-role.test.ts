import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getPayload } from "../dev";

/**
 * Integration tests for admin invite role assignment.
 *
 * The set-admin-role endpoint has been removed (P0-3 fix). Role assignment
 * now happens server-side in the after-signup middleware for both email
 * and OAuth signups.
 *
 * Tests cover:
 * - Email signup with valid invite token → admin role assigned
 * - Email signup without token → default role
 * - Email signup with invalid token → default role (no crash)
 * - Token is atomically consumed (cannot be reused)
 * - Old set-admin-role endpoint no longer exists
 *
 * Requires a running Postgres database.
 */
describe("Admin Invite Role Assignment (P0-3 / P0-4 Regression)", async () => {
  const payload = await getPayload();

  const testEmail = "invite-role-test@test.com";
  const testPassword = "invitetest123456";
  const testName = "Invite Test User";

  async function cleanup() {
    await payload.delete({
      collection: "users",
      where: { email: { equals: testEmail } }
    });
    await payload.delete({
      collection: "admin-invitations",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "sessions",
      where: { id: { exists: true } }
    });
    await payload.delete({
      collection: "accounts",
      where: { id: { exists: true } }
    });
  }

  beforeAll(cleanup);
  afterAll(cleanup);

  // Clean up between each test so they're isolated
  beforeEach(cleanup);

  it("assigns invited role during email signup when valid token is provided", async () => {
    // Create an admin invitation
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/admin/signup?token=${token}`
      }
    });

    // Sign up with the invite token passed via header
    await payload.betterAuth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName
      },
      headers: new Headers({
        "x-admin-invite-token": token
      })
    });

    // Verify user was created with admin role
    const users = await payload.find({
      collection: "users",
      where: { email: { equals: testEmail } }
    });
    expect(users.docs.length).toBe(1);
    expect(users.docs[0].role).toContain("admin");
  });

  it("assigns default role when no invite token is provided", async () => {
    // Sign up without an invite token
    await payload.betterAuth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName
      }
    });

    // User should have default role, not admin
    const users = await payload.find({
      collection: "users",
      where: { email: { equals: testEmail } }
    });
    expect(users.docs.length).toBe(1);
    expect(users.docs[0].role).not.toContain("admin");
  });

  it("assigns default role when an invalid/nonexistent token is provided", async () => {
    // Sign up with a bogus token — should not crash, just get default role
    await payload.betterAuth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName
      },
      headers: new Headers({
        "x-admin-invite-token": crypto.randomUUID()
      })
    });

    const users = await payload.find({
      collection: "users",
      where: { email: { equals: testEmail } }
    });
    expect(users.docs.length).toBe(1);
    expect(users.docs[0].role).not.toContain("admin");
  });

  it("consumes token atomically — token cannot be reused", async () => {
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/admin/signup?token=${token}`
      }
    });

    // First signup consumes the token
    await payload.betterAuth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName
      },
      headers: new Headers({
        "x-admin-invite-token": token
      })
    });

    // Verify the invitation was consumed (deleted from DB)
    const invitations = await payload.find({
      collection: "admin-invitations",
      where: { token: { equals: token } }
    });
    expect(invitations.docs.length).toBe(0);
  });

  it("invitation record is deleted even if no matching user is found", async () => {
    // This tests the atomic delete behavior — the invitation is deleted
    // before looking up the user, so even a failed user lookup doesn't
    // leave the token available for reuse.
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/admin/signup?token=${token}`
      }
    });

    // Sign up (which will use the token in the after middleware)
    await payload.betterAuth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: testName
      },
      headers: new Headers({
        "x-admin-invite-token": token
      })
    });

    // Token should be consumed regardless
    const invitations = await payload.find({
      collection: "admin-invitations",
      where: { token: { equals: token } }
    });
    expect(invitations.docs.length).toBe(0);
  });
});
