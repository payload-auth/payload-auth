import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanupAll, createAuthenticatedUser, getSession, getTestPayload, signIn, signUp } from "../helpers";

describe("Email/Password Auth Flow", () => {
  let payload: Awaited<ReturnType<typeof getTestPayload>>;

  beforeAll(async () => {
    payload = await getTestPayload();
  });

  afterEach(async () => {
    await cleanupAll(payload);
  });

  describe("Sign Up", () => {
    it("should create a new user via email signup", async () => {
      const { body } = await signUp(payload, {
        email: "newuser@test.com",
        password: "Password123!",
        name: "New User"
      });

      expect(body.user).toBeDefined();
      expect(body.user.email).toBe("newuser@test.com");
      expect(body.user.name).toBe("New User");
    });

    it("should persist the user in the Payload users collection", async () => {
      await signUp(payload, {
        email: "persist@test.com",
        password: "Password123!",
        name: "Persist User"
      });

      const found = await payload.find({
        collection: "users",
        where: { email: { equals: "persist@test.com" } }
      });

      expect(found.docs).toHaveLength(1);
      expect(found.docs[0].name).toBe("Persist User");
    });

    it("should create an account record for email-password provider", async () => {
      const { body } = await signUp(payload, {
        email: "account@test.com",
        password: "Password123!",
        name: "Account User"
      });

      const accounts = await payload.find({
        collection: "accounts",
        where: { user: { equals: body.user.id } }
      });

      expect(accounts.docs).toHaveLength(1);
      expect(accounts.docs[0].providerId).toBe("credential");
    });

    it("should assign the default role to new users", async () => {
      const { body } = await signUp(payload, {
        email: "role@test.com",
        password: "Password123!",
        name: "Role User"
      });

      const user = await payload.findByID({
        collection: "users",
        id: body.user.id
      });

      expect(user.role).toBeDefined();
      // Default role should be "user" as configured
      expect(user.role).toContain("user");
    });

    it("should reject duplicate email signups", async () => {
      await signUp(payload, {
        email: "dupe@test.com",
        password: "Password123!",
        name: "First"
      });

      const { res } = await signUp(payload, {
        email: "dupe@test.com",
        password: "Password123!",
        name: "Second"
      });

      // Better Auth should reject the duplicate
      expect(res.status).not.toBe(200);
    });
  });

  describe("Sign In", () => {
    it("should sign in an existing user and return session cookies", async () => {
      await signUp(payload, {
        email: "signin@test.com",
        password: "Password123!",
        name: "Sign In User"
      });

      const { body, cookies } = await signIn(payload, {
        email: "signin@test.com",
        password: "Password123!"
      });

      expect(body.user).toBeDefined();
      expect(body.user.email).toBe("signin@test.com");
      expect(cookies.length).toBeGreaterThan(0);
    });

    it("should reject sign in with wrong password", async () => {
      await signUp(payload, {
        email: "wrongpw@test.com",
        password: "Password123!",
        name: "Wrong PW User"
      });

      const { res } = await signIn(payload, {
        email: "wrongpw@test.com",
        password: "WrongPassword!"
      });

      expect(res.status).not.toBe(200);
    });

    it("should reject sign in for non-existent user", async () => {
      const { res } = await signIn(payload, {
        email: "noexist@test.com",
        password: "Password123!"
      });

      expect(res.status).not.toBe(200);
    });
  });

  describe("Session", () => {
    it("should return a valid session for authenticated cookies", async () => {
      const { cookies } = await createAuthenticatedUser(payload, {
        email: "session@test.com"
      });

      const { body } = await getSession(payload, cookies);

      expect(body.user).toBeDefined();
      expect(body.user.email).toBe("session@test.com");
      expect(body.session).toBeDefined();
    });

    it("should create a session record in the sessions collection", async () => {
      const { user } = await createAuthenticatedUser(payload, {
        email: "sessiondb@test.com"
      });

      const sessions = await payload.find({
        collection: "sessions",
        where: { user: { equals: user.id } }
      });

      expect(sessions.docs.length).toBeGreaterThan(0);
    });

    it("should reject session request without cookies", async () => {
      const { body } = await getSession(payload, []);

      // body may be null or an object without user
      expect(body?.user).toBeUndefined();
    });
  });
});
