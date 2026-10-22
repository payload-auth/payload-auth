import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getPayload } from "../dev";

/**
 * Integration tests for admin invitation token expiry (NEW-2 fix).
 *
 * Admin invitations now carry a required `expiresAt` field. The after-signup
 * middleware treats an expired invitation the same as "no invitation":
 * - the invited role is NOT assigned
 * - the invitation record is NOT consumed (deleted), so an admin can inspect
 *   or clean up stale invitations
 *
 * A still-valid (non-expired) invitation continues to be consumed and to
 * assign the invited role, as covered in set-admin-role.test.ts.
 *
 * Requires a running Postgres database.
 */
describe("Admin Invite Token Expiry (NEW-2)", async () => {
  const payload = await getPayload();

  const testEmail = "invite-expiry-test@test.com";
  const testPassword = "invitetest123456";
  const testName = "Invite Expiry Test User";

  function futureExpiry(): string {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }

  function pastExpiry(): string {
    return new Date(Date.now() - 60 * 60 * 1000).toISOString();
  }

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
  beforeEach(cleanup);

  it("defaults expiresAt to 7 days out when it is omitted", async () => {
    // The admin UI create view and the fresh-database admin-login view both
    // create invitations without an expiresAt (the field is read-only).
    const before = Date.now();
    const invitation = await payload.create({
      collection: "admin-invitations",
      data: {
        token: crypto.randomUUID(),
        role: "admin"
      }
    });
    const after = Date.now();

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(invitation.expiresAt as string).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + sevenDays);
    expect(expiresAt).toBeLessThanOrEqual(after + sevenDays);
  });

  it("does not assign the invited role when the token is expired", async () => {
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/admin/signup?token=${token}`,
        expiresAt: pastExpiry()
      }
    });

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

    const users = await payload.find({
      collection: "users",
      where: { email: { equals: testEmail } }
    });
    expect(users.docs.length).toBe(1);
    expect(users.docs[0].role).not.toContain("admin");
  });

  it("does not consume (delete) an expired invitation", async () => {
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/admin/signup?token=${token}`,
        expiresAt: pastExpiry()
      }
    });

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

    const invitations = await payload.find({
      collection: "admin-invitations",
      where: { token: { equals: token } }
    });
    expect(invitations.docs.length).toBe(1);
  });

  it("assigns the invited role and consumes the token when it has not expired", async () => {
    const token = crypto.randomUUID();
    await payload.create({
      collection: "admin-invitations",
      data: {
        token,
        role: "admin",
        url: `http://localhost:3000/admin/signup?token=${token}`,
        expiresAt: futureExpiry()
      }
    });

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

    const users = await payload.find({
      collection: "users",
      where: { email: { equals: testEmail } }
    });
    expect(users.docs.length).toBe(1);
    expect(users.docs[0].role).toContain("admin");

    const invitations = await payload.find({
      collection: "admin-invitations",
      where: { token: { equals: token } }
    });
    expect(invitations.docs.length).toBe(0);
  });
});
