import type { TestHelpers } from "better-auth/plugins";
import type { getTestPayload } from "./setup";

type TestPayload = Awaited<ReturnType<typeof getTestPayload>>;

/**
 * Sign up a user via the Better Auth API and return the response + cookies.
 */
export async function signUp(
  payload: TestPayload,
  data: { email: string; password: string; name: string }
) {
  const res = await payload.betterAuth.api.signUpEmail({
    body: data,
    asResponse: true
  });

  const cookies = res.headers.getSetCookie?.() ?? [];
  const body = await res.json();
  return { res, body, cookies };
}

/**
 * Sign in a user via the Better Auth API and return the response + cookies.
 */
export async function signIn(
  payload: TestPayload,
  data: { email: string; password: string }
) {
  const res = await payload.betterAuth.api.signInEmail({
    body: data,
    asResponse: true
  });

  const cookies = res.headers.getSetCookie?.() ?? [];
  const body = await res.json();
  return { res, body, cookies };
}

/**
 * Get the current session using cookies.
 */
export async function getSession(
  payload: TestPayload,
  cookies: string[]
) {
  const res = await payload.betterAuth.api.getSession({
    headers: new Headers({
      cookie: cookies.join("; ")
    }),
    asResponse: true
  });

  const body = await res.json();
  return { res, body };
}

/**
 * Create a test user and sign them in. Returns user data + session cookies.
 * Uses the full signup/signin flow — creates user, account, and session.
 */
export async function createAuthenticatedUser(
  payload: TestPayload,
  overrides: Partial<{ email: string; password: string; name: string }> = {}
) {
  const data = {
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    password: overrides.password ?? "TestPassword123!",
    name: overrides.name ?? "Test User"
  };

  const signup = await signUp(payload, data);

  // Sign in to get fresh cookies (signup may not always set session cookies)
  const signin = await signIn(payload, {
    email: data.email,
    password: data.password
  });

  return {
    user: signin.body.user ?? signup.body.user,
    cookies: signin.cookies.length ? signin.cookies : signup.cookies,
    credentials: data
  };
}

// ---------------------------------------------------------------------------
// Test-utils based helpers (faster — bypass HTTP auth flows)
// ---------------------------------------------------------------------------

/**
 * Create a user directly in the DB via test-utils and return auth headers.
 * Much faster than createAuthenticatedUser — skips signup/signin HTTP flow.
 *
 * NOTE: Does NOT create an account record. Use createAuthenticatedUser()
 * if your test needs to verify accounts or perform signIn later.
 */
export async function createQuickUser(
  test: TestHelpers,
  overrides: Partial<{ email: string; name: string; emailVerified: boolean }> = {}
) {
  const user = test.createUser({
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    name: overrides.name ?? "Test User",
    emailVerified: overrides.emailVerified ?? true
  });
  const saved = await test.saveUser(user);
  return saved;
}

/**
 * Create a user + authenticated session directly. Returns user + headers.
 * Fastest way to get an authenticated context for access control tests.
 */
export async function createQuickSession(
  test: TestHelpers,
  overrides: Partial<{ email: string; name: string }> = {}
) {
  const user = await createQuickUser(test, overrides);
  const { session, headers, cookies, token } = await test.login({
    userId: user.id
  });
  return { user, session, headers, cookies, token };
}
