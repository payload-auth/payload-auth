# Payload Better Auth Plugin - Security & Robustness Audit Report

**Date:** February 25, 2026
**Scope:** Full codebase review of `packages/payload-auth/src/better-auth/`
**Methodology:** Automated multi-agent analysis cross-referenced with Better Auth and Payload CMS v3 documentation, followed by manual source verification of all critical and high findings.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [P0 - Critical Issues](#p0---critical-issues)
4. [P1 - High Priority Issues](#p1---high-priority-issues)
5. [P2 - Medium Priority Issues](#p2---medium-priority-issues)
6. [P3 - Low Priority Issues](#p3---low-priority-issues)
7. [Architectural Concerns](#architectural-concerns)
8. [Recommendations](#recommendations)

---

## Executive Summary

This audit identified **5 critical (P0)**, **13 high (P1)**, **20 medium (P2)**, and **13 low (P3)** issues across the plugin codebase. The most severe findings include:

- A shared closure array mutation that disables password verification after the first password change globally
- A wrong foreign key reference in the organizations plugin that corrupts database relationships
- Unauthenticated admin invite endpoints that allow privilege escalation
- Silent null-dropping in the adapter transform layer that prevents fields from ever being cleared
- Incorrect AND/OR query semantics in the where-clause converter

The plugin's overall architecture is well-conceived - using Payload as the database adapter for Better Auth is an elegant approach. However, the bridge between these two systems introduces numerous edge cases, particularly around data transformation, dual-session management, and access control. Many issues stem from the inherent complexity of synchronizing two authentication systems that were designed to work independently.

---

## Architecture Overview

The plugin operates as a Payload CMS plugin that integrates Better Auth as the authentication engine. The key architectural layers are:

```
User Application
       |
  Payload CMS (collections, hooks, access control, admin UI)
       |
  payload-auth plugin (bridge layer)
       |
  Better Auth (session management, OAuth, 2FA, organizations)
       |
  Payload Adapter (translates Better Auth DB operations to Payload API)
       |
  Payload Database Layer (Postgres, MongoDB, etc.)
```

**Key integration points:**
- **Adapter** (`adapter/`): Implements Better Auth's `DBAdapter` interface using Payload's local API
- **Transform** (`adapter/transform/`): Bidirectional field name/type mapping between Better Auth and Payload schemas
- **Plugin** (`plugin/`): Payload plugin that generates collections, hooks, and admin UI
- **Collection Builders** (`plugin/lib/build-collections/`): Dynamic Payload collection generation from Better Auth schemas
- **Options Sanitization** (`plugin/lib/sanitize-better-auth-options/`): Normalizes and configures Better Auth options
- **Auth Strategy** (`better-auth-strategy.ts`): Custom Payload auth strategy that delegates to Better Auth sessions

---

## P0 - Critical Issues

These issues can cause security vulnerabilities, data corruption, or system-wide failures. Fix immediately.

### P0-1: Shared `allowedFields` Array Mutation Bypasses Password Verification — FIXED

**File:** `plugin/lib/build-collections/utils/payload-access.ts:96`
**Type:** Security - Authentication Bypass

The `isAdminOrCurrentUserUpdateWithAllowedFields` access control function previously captured the `allowedFields` array in a closure and mutated it with `.push("password", "currentPassword")` after a successful password verification. Since the array was shared across all requests, after the first successful password change by any user, password and currentPassword were permanently in the allowed list for all subsequent requests — bypassing password verification entirely.

**Impact:** Any authenticated user could change any other user's password without knowing the current password, after any single password change had occurred anywhere in the system.

**Resolution:**
- Replaced `allowedFields.push(...)` with a local copy: `effectiveAllowedFields = [...allowedFields, "password", "currentPassword"]`
- The `hasDisallowedField` check now uses the local `effectiveAllowedFields` variable instead of the shared closure array
- **Tests:** 25 unit tests in `payload-access.test.ts`, including 2 P0-1-specific regression tests verifying the array is not mutated and that password verification is still required on subsequent invocations

---

### P0-2: `team.organizationId` References Wrong Model (User Instead of Organization) — FIXED

**File:** `plugin/lib/sanitize-better-auth-options/organizations-plugin.ts:111`
**Type:** Data Integrity - Schema Corruption

The team's `organizationId` foreign key was configured to reference the **users** collection instead of the **organizations** collection due to a copy-paste error.

**Impact:** Every team's `organizationId` relationship field pointed to the users collection. In relational databases (Postgres), this creates an incorrect foreign key constraint. In the Payload admin UI, the organization field on teams shows users instead of organizations. Queries joining teams to organizations will return wrong results or fail.

**Resolution:**
- Changed `baModelKey.user` to `baModelKey.organization` on line 111.
- **Tests:** 10 unit tests in `organizations-plugin.test.ts`, including a P0-2 regression test that explicitly asserts `team.organizationId.references.model` equals the organization collection slug (not users), and a custom slug test verifying it works with non-default collection names.

---

### P0-3: Admin Invite Endpoints Have No Authentication — FIXED

**Files:**
- `plugin/lib/build-collections/users/endpoints/generate-invite-url.ts` (entire handler)
- `plugin/lib/build-collections/users/endpoints/send-invite-url.ts` (entire handler)
- `plugin/lib/build-collections/users/endpoints/set-admin-role.ts` (DELETED)
**Type:** Security - Privilege Escalation

Neither the `generate-invite-url` nor `send-invite-url` endpoint checks `req.user` or validates that the caller is an admin. Payload does NOT automatically enforce authentication on custom endpoints - the handler must check it explicitly.

The `generate-invite-url` handler:
1. Accepts a POST with a role
2. Generates a `crypto.randomUUID()` token
3. Creates an admin invitation record in the database
4. Returns the invite link in the response body

An unauthenticated attacker can call `POST /api/users/generate-invite-url` with `{ role: { value: "admin" } }` to generate valid admin invite tokens. Combined with the `set-admin-role` endpoint (which does require a session), this enables a privilege escalation chain:

1. Attacker creates a normal account
2. Attacker calls `generate-invite-url` (no auth required) to get an admin invite token
3. Attacker calls `set-admin-role?token=xxx` (with their session) to become admin

The `send-invite-url` endpoint similarly allows unauthenticated email sending, which could be used for phishing or spam.

**Resolution:**
- **`set-admin-role` endpoint eliminated entirely.** Role assignment now happens server-side in the after-signup middleware for both email and OAuth signups, leveraging Better Auth v1.4's `additionalData`/`getOAuthState()` API. The invite token is passed through the OAuth state for social signups and via query/body for email signups.
- **`generate-invite-url` and `send-invite-url` hardened** with both `req.user` + admin role checks AND Better Auth session validation (`betterAuth.api.getSession()`) as defense-in-depth.
- **Tests added:** 5 integration tests for admin invite role assignment (email signup with valid/invalid/no token, atomic token consumption, invitation cleanup), plus 4 endpoint auth tests for generate/send invite URL.

---

### P0-4: Invite Token Race Condition Enables Multi-User Role Escalation — FIXED

**File:** `plugin/lib/build-collections/users/endpoints/set-admin-role.ts` (DELETED)
**Type:** Security - Race Condition

The `set-admin-role` endpoint performed three non-atomic operations:

1. **Find** invite by token (line 40-47)
2. **Update** user role with `overrideAccess: true` (line 56-63)
3. **Delete** invite token (line 64-72)

Between steps 1 and 3, a second concurrent request with the same token can also pass the find check. Both requests set their respective users to the admin role, and only one delete succeeds. A single invite token can promote multiple users.

Additionally:
- The `token` field is `z.string().optional()` (line 9) - an undefined token could match null/empty rows
- There is **no expiration** check on invite tokens - they remain valid forever
- The `redirect` parameter is user-controlled with no validation, creating an **open redirect** vulnerability (line 73-78)

**Impact:** A single invite token can be used by multiple users to gain admin privileges. Invite tokens never expire. The redirect parameter can be used for phishing.

**Resolution:**
- **`set-admin-role` endpoint deleted entirely.** The entire attack surface (race condition, open redirect, optional token) is eliminated.
- Role assignment now happens in the after-signup middleware using a find-then-delete-by-ID pattern: the invitation is looked up by token, then immediately deleted by its unique ID before the role is assigned. This prevents token reuse.
- No user-controlled redirect parameter exists in the new flow.
- **Tests verify:** token is atomically consumed and cannot be reused (see `set-admin-role.test.ts`).

---

### P0-5: `transformInput` Silently Drops `null` Values — FIXED

**File:** `adapter/transform/index.ts:349-353`
**Type:** Data Integrity - Silent Data Loss

The `transformInput` function previously skipped both `null` and `undefined` values. When Better Auth sent an update like `{ image: null }` to clear a field, the adapter dropped it, resulting in an empty update payload.

**Impact:** Any operation that clears an optional field silently failed. Users could not be unbanned, profile images could not be removed, optional metadata could not be cleared.

**Resolution:**
- Changed the guard from `if (value === null || value === undefined)` to `if (value === undefined)` — null values now pass through to Payload for field clearing.
- **Tests:** Unit tests in `transform.test.ts` (29 tests, including "passes null values through for field clearing" and "skips undefined values") plus integration tests in `null-handling.test.ts` (3 tests verifying null clears fields, undefined preserves them, through the full adapter layer).

---

## P1 - High Priority Issues

These issues affect correctness, security, or reliability and should be fixed in the next release.

### P1-1: WHERE Clause AND/OR Connector Semantics Are Incorrect

**File:** `adapter/transform/index.ts:778-821`
**Type:** Query Correctness

Better Auth's `Where[]` uses a `connector` property to specify how a condition joins to the **next** condition. The current code incorrectly groups all conditions by their connector into separate AND/OR arrays:

```typescript
const and = where.filter((w) => w.connector === "AND" || !w.connector);
const or = where.filter((w) => w.connector === "OR");
```

Consider: `[{field: "a", value: 1}, {field: "b", value: 2, connector: "OR"}, {field: "c", value: 3}]`

The intent is sequential: `a=1 AND b=2 OR c=3`. But the current code produces:
- AND group: `[a=1, c=3]` (both have no connector or default AND)
- OR group: `[b=2]` (has connector: "OR")
- Result: `{ AND: [{a:1}, {c:3}], OR: [{b:2}] }` = `(a=1 AND c=3) AND (b=2)` = `a=1 AND b=2 AND c=3`

The OR semantics are completely lost. The condition `c=3` ends up in the AND group because it has no explicit connector (the `connector: "OR"` on the previous condition was supposed to mean "OR the next condition").

**Impact:** Any Better Auth query with mixed AND/OR conditions returns wrong results. This could affect session lookups, user searches, and organization membership queries.

---

### P1-2: Relationship Field IDs Not Type-Converted in WHERE Clauses

**File:** `adapter/transform/index.ts:667-713`
**Type:** Query Correctness

The `convertWhereValue` function only converts ID types for `id` and `_id` fields. But relationship fields like `userId`, `organizationId`, `teamId` also store IDs that need conversion between string and number. When Better Auth sends `{field: "userId", value: "123"}` and the database uses numeric IDs, the string `"123"` is passed directly to Payload, which may not match the numeric `123` in a strict database query.

The `transformInput` function correctly handles this for create/update operations, but `convertWhereClause` does not, creating an inconsistency.

**Impact:** On databases with numeric IDs (Postgres with serial/int PKs), any Better Auth query filtering by a relationship field (userId, organizationId, etc.) may silently return zero results.

---

### P1-3: `findMany` Pagination Returns Wrong Results When offset % limit != 0

**File:** `adapter/index.ts:386-411`
**Type:** Data Correctness

The pagination logic translates Better Auth's `offset`/`limit` to Payload's `page`/`limit`:

```typescript
const spill = offset % limit;
const page = Math.floor(offset / limit) + 1;
const fetchLimit = spill ? limit + spill : limit;
```

When `spill > 0`, `fetchLimit` is increased, but the `page` calculation was derived using the original `limit`. Since Payload's `page` is relative to its own `limit` parameter, changing `fetchLimit` shifts the actual data window.

Example: `offset=7, limit=5` -> `spill=2, page=2, fetchLimit=7`. Payload returns page 2 of 7-item pages (items 8-14). `slice(2, 7)` gives items 10-14. Expected: items 8-12.

**Impact:** Paginated queries with non-aligned offsets return incorrect data subsets. This can affect any list endpoint that uses offset-based pagination.

---

### P1-4: Accounts Collection `existingCollection` Override Destroys All Security Guards

**File:** `plugin/lib/build-collections/accounts/index.ts:168`
**Type:** Security - Access Control Bypass

```typescript
let accountCollection: CollectionConfig = {
  slug: accountSlug,
  admin: { ... },
  access: { /* carefully configured guards */ },
  hooks: { ... },
  fields: [ ... ],
  ...existingAccountCollection  // <-- spread LAST, overwrites everything above
};
```

The `existingAccountCollection` is spread at the **end** of the object literal, completely overwriting `slug`, `admin`, `access`, `hooks`, `fields`, and everything else. This is different from the users collection builder (which spreads existing collection first and then overrides specific properties), and different from other builders like sessions/teams (which use a mixed pattern).

If a user has an existing accounts collection with even basic access controls like `access: { read: () => true }`, all the plugin's access guards (admin-only create, admin-only delete, admin-or-self read) are replaced.

**Impact:** Any user who defines an existing accounts collection inadvertently removes all authentication-related access controls on that collection. OAuth tokens, password hashes, and provider credentials become accessible.

---

### P1-5: `setLoginMethods` Incorrectly Detects Email/Password as Enabled

**File:** `plugin/lib/set-login-methods.ts:13-16`
**Type:** UI Bug

```typescript
if (
  !!betterAuthOptions?.emailAndPassword ||
  betterAuthOptions?.emailAndPassword?.enabled
)
  loginMethods.push("emailPassword");
```

The expression `!!betterAuthOptions?.emailAndPassword` evaluates to `true` whenever the `emailAndPassword` configuration object **exists at all**, regardless of `enabled: false`. Since `!!{ enabled: false }` is `true`, the `||` short-circuits and `emailPassword` is always added when any email/password config is present.

**Impact:** The admin login page shows an email/password login form even when `emailAndPassword: { enabled: false }` is configured. Users attempt to log in with email/password and get confusing errors.

**Fix:** Change to `betterAuthOptions?.emailAndPassword?.enabled !== false` or `betterAuthOptions?.emailAndPassword?.enabled`.

---

### P1-6: `create` Returns `null as R` on Error

**File:** `adapter/index.ts:227-230`
**Type:** Error Handling - Silent Failure

```typescript
} catch (error) {
  errorLog(["Error in creating:", model, error]);
  return null as R;
}
```

Better Auth expects `create()` to return a valid object with an `id` field. Returning `null` cast as `R` causes downstream "Cannot read property 'id' of null" crashes. The same error-swallowing pattern appears in `findMany` (returns `[]`), `update` (returns `null`), `updateMany` (returns `0`), `delete` (swallows silently), `deleteMany` (returns `0`), and `count` (returns `0`).

**Impact:** Database errors are invisible. Connection failures, schema mismatches, and constraint violations are silently swallowed, causing confusing secondary errors elsewhere.

---

### P1-7: Incomplete Cascade Delete on User Deletion

**File:** `plugin/lib/build-collections/users/hooks/before-delete.ts`
**Type:** Data Integrity - Orphaned Records

The beforeDelete hook only cleans up three related collections:
- Accounts
- Sessions
- Verifications

It does **not** clean up records from plugin collections:
- **Passkeys** (WebAuthn credentials remain for deleted user)
- **Two-factor** records (TOTP secrets remain, containing sensitive data)
- **API keys** (active API keys for deleted user continue to work if validated by key alone)
- **Organization members** (deleted user appears as an org member)
- **Team members** (deleted user appears in teams)
- **OAuth consents** (consent records reference non-existent user)
- **OAuth access tokens** (tokens for deleted user may remain valid)
- **Subscriptions** (billing records reference non-existent user)

**Impact:** Deleting a user leaves orphaned records across multiple collections. Active API keys and OAuth tokens for deleted users may continue to work. Sensitive data (2FA secrets, passkey credentials) persists.

---

### P1-8: Admin Invite Role Not Applied for Social Provider Sign-Ups — FIXED

**File:** `plugin/lib/sanitize-better-auth-options/utils/use-admin-invite-after-email-sign-up-middleware.ts` (DELETED, replaced by `admin-invite-after-signup-middleware.ts`)
**Type:** Logic Error

The **before** middleware (`requireAdminInviteForSignUpMiddleware`) validates invite tokens for both `/sign-up/email` and `/sign-in/social`. But the **after** middleware only processed `/sign-up/email`:

```typescript
if (ctx.path !== "/sign-up/email") {
  if (typeof originalAfter === "function") originalAfter(ctx);
  return;
}
```

When a user signs up via a social provider (Google, GitHub, etc.) with a valid admin invite token, the before check passes, but the after hook never sets the invited role. The user is created with the default role.

**Impact:** Admin invitations via social providers do not work. The user gets the default role instead of the invited admin role.

**Resolution:**
- The after-signup middleware now handles both `/sign-up/email` and `/callback/*` (OAuth callbacks).
- For OAuth signups, the invite token is passed via Better Auth v1.4's `additionalData` and retrieved server-side using `getOAuthState()`.
- The before middleware was also updated to check `ctx.body?.additionalData?.adminInviteToken` for social sign-in flows.
- Client components updated to pass `additionalData: { adminInviteToken }` in `signIn.social()` calls.

---

### P1-9: Unsupported Better Auth Plugins Silently Stripped

**File:** `plugin/lib/sanitize-better-auth-options/index.ts:186-231`
**Type:** Configuration - Silent Failure

```typescript
const supportedPlugins = betterAuthOptions.plugins.filter((plugin) =>
  Object.values(supportedBAPluginIds).includes(plugin.id as any)
);
betterAuthOptions.plugins = supportedPlugins;
```

Any Better Auth plugin not in the hardcoded `supportedBAPluginIds` allowlist is silently removed. A `console.warn` is logged, but the plugins are still dropped. This means:
- Custom Better Auth plugins are stripped
- Newer official plugins (released after this code) are stripped
- Community plugins are stripped

**Impact:** Users who add custom or newer Better Auth plugins find them silently disabled. This is especially problematic as Better Auth's plugin ecosystem grows.

---

### P1-10: User-Provided Password Hashing Silently Overwritten

**File:** `plugin/lib/sanitize-better-auth-options/index.ts:101-110`
**Type:** Configuration - Silent Override

```typescript
betterAuthOptions.emailAndPassword.password = {
  ...(betterAuthOptions.emailAndPassword.password || {}),
  verify: ({ hash, password }) => verifyPassword({ hash, password }),
  hash: (password) => hashPassword(password)
};
```

The plugin's `verify` and `hash` functions are placed **after** the user's spread, overwriting any custom implementations. Additionally, this only applies when `disableDefaultPayloadAuth` is `false`. Switching `disableDefaultPayloadAuth` between `true` and `false` changes the hashing algorithm (Payload-compatible pbkdf2 vs. Better Auth's default scrypt), invalidating all existing password hashes.

**Impact:** Users cannot provide custom password hashing. Toggling `disableDefaultPayloadAuth` locks out all existing users.

---

### P1-11: Transaction Is a No-Op

**File:** `adapter/index.ts:169-173`
**Type:** Data Integrity - Missing Atomicity

```typescript
async transaction<R>(callback: (tx: Omit<DBAdapter, "transaction">) => Promise<R>): Promise<R> {
  return await callback(this);
}
```

The `transaction` method simply calls the callback with `this` - no actual transactional semantics are provided. Better Auth uses transactions for atomic multi-step operations like user creation (create user + create account). If the second step fails, the first is not rolled back.

**Impact:** Partial data from failed multi-step operations persists as orphaned records. Users may exist without accounts, sessions without users, etc.

---

### P1-12: `afterLogin` Hook Has No Error Handling

**File:** `plugin/lib/build-collections/users/hooks/after-login.ts`
**Type:** Reliability - Inconsistent State

The entire afterLogin hook (lines 20-95) has no try/catch block. Since this is an `afterLogin` hook, Payload's login has already succeeded and a JWT has been issued. If any step fails (session creation, cookie signing, cookie setting), the error propagates and the user receives a Payload JWT but no Better Auth session.

The `decodeURIComponent(value)` call on line 92 is particularly fragile - it throws `URIError` on invalid percent-encoded sequences, which could crash the hook after the session has already been created in the database (creating an orphaned session).

**Impact:** Intermittent failures leave users with a Payload JWT but no Better Auth session. The dual auth state becomes inconsistent.

---

### P1-13: Data Shape Disconnect — Populated Relationships Leak Into Cookie Cache and Session Data

**Files:**
- `adapter/transform/index.ts:548-604` (`normalizeDocumentIds`)
- `adapter/index.ts:10-11` (depth constants)
- `plugin/lib/build-collections/users/better-auth-strategy.ts:28-31` (`findByID` without depth)
- `plugin/lib/build-collections/users/endpoints/refresh-token.ts:73-76, 84-88, 130` (`findByID` + cookie cache)
- `plugin/helpers/prepare-session-data.ts` (`getFieldsToSign` usage)
- `plugin/lib/sanitize-better-auth-options/utils/apply-save-to-jwt-returned.ts` (band-aid suppression)
**Type:** Data Integrity / Security - Cookie Bloat and Type Mismatch

#### The Problem

Better Auth's type system expects flat, scalar ID references for all relationship fields (e.g., `userId: string`, `organizationId: string`). Payload CMS, however, can return relationship fields as fully populated document objects depending on the `depth` parameter. This fundamental mismatch manifests at multiple layers of the plugin, causing:

1. **Bloated cookie data** — populated relationship objects leak into session cookies
2. **Type confusion** — `as any` casts hide mismatches between expected flat IDs and actual nested objects
3. **Inconsistent behavior** — different operations return different shapes for the same fields

#### Root Cause: Dual Representation in `normalizeDocumentIds`

The adapter transform layer (`adapter/transform/index.ts:548-604`) creates a **dual representation** for relationship fields:

```typescript
// For an object relationship like { id: 5, name: "org1", ... }:
result[originalKey] = String(docId);           // BA key: flat string "5"
result[field.fieldName] = { ...doc, id: String(docId) }; // Payload key: full object
```

When the BetterAuth key name and Payload field name differ (e.g., BA's `organizationId` → Payload's `organization`), both keys coexist on the same document. When they share the same name, the second assignment overwrites the first, and the populated object wins.

This means `transformOutput` can return documents like:

```typescript
{
  id: "1",
  userId: "42",                    // flat — correct for BA
  organization: { id: "5", name: "Acme Corp", slug: "acme", ... }  // populated — wrong for BA
  organizationId: "5",            // flat — correct for BA (if names differ)
}
```

#### Inconsistent Depth Across Operations

The adapter uses two different depth constants:

| Operation | Depth | Effect |
|-----------|-------|--------|
| `create` | `0` | Flat IDs (correct for BA) |
| `findOne`, `findMany`, `update`, `delete`, `count` | `1` | Populated relationships (bloated for BA) |

The `create` depth was intentionally set to 0 with the comment: *"Use depth: 0 for create to avoid populating relationship fields. Populated relationships would bloat the session data stored in cookie cache."* — acknowledging the problem but only fixing it for creates.

All other operations return depth-1 populated documents, which flow into:
- Better Auth's internal session/user caching
- Cookie cache via `setCookieCache`
- The auth strategy's user response
- The refresh token endpoint's response body

#### Uncontrolled Depth in Consumer Code

Both the auth strategy and refresh token endpoint call `findByID` **without specifying a depth parameter**:

```typescript
// better-auth-strategy.ts:28-31
const user = await payloadAuth.findByID({
  collection: userSlug ?? baseSlugs.users,
  id: userId
  // No depth — uses Payload's default (which varies)
});

// refresh-token.ts:73-76
const user = await payload.findByID({
  collection: userSlug as string,
  id: res.session.userId
  // No depth — uses Payload's default
});
```

These are **direct Payload local API calls** (not adapter calls), so the adapter's depth constants don't apply. The returned user object may contain deeply populated relationships that are then spread directly into responses and cookie data.

#### Cookie Cache Data Shape Leak

The refresh token endpoint demonstrates the full chain:

```typescript
// 1. Fetch user with uncontrolled depth
const user = await payload.findByID({ collection: userSlug, id: res.session.userId });

// 2. Filter through getFieldsToSign — retains populated objects for saveToJWT fields
const cookieCacheFields = getFieldsToSign({
  collectionConfig: userCollection?.config,
  email: user.email,
  user: user as TypedUser  // Type cast hides shape mismatch
});

// 3. Pass to setCookieCache — populated objects end up in the cookie
await setCookieCache(ctx, {
  session: res.session,
  user: cookieCacheFields as any  // 'as any' hides that this may contain nested objects
}, !!dontRememberMe);
```

`getFieldsToSign` filters fields based on `saveToJWT`, but it does **not** flatten populated relationship objects. A field like `organization` with `saveToJWT: true` will include the entire populated organization document in the cookie, not just the ID.

#### Band-Aid: `applySaveToJwtReturned`

The function `applySaveToJwtReturned` attempts to suppress fields from the cookie cache by mirroring Payload's `saveToJWT: false` flags into Better Auth's `additionalFields.returned: false`. However:

1. It only suppresses fields explicitly marked `saveToJWT: false` — it does nothing about fields that ARE included but contain the wrong shape
2. It doesn't handle the case where a field IS returned but should be a flat ID, not a populated object
3. It relies on the BA `returned: false` mechanism, which only controls BA's own output — not what `getFieldsToSign` includes

**Impact:**
- **Cookie size:** Populated relationship objects in cookies can exceed browser size limits (4KB), causing silent authentication failures
- **Type safety:** `as any` casts throughout the chain hide the fact that cookie data doesn't match BA's expected types
- **Security:** Populated relationship objects may contain sensitive fields (organization billing info, team metadata) that shouldn't be in client-accessible cookies
- **Client confusion:** Frontend code expecting `user.organizationId` (string) may receive `user.organization` (object), causing runtime errors

**Fix:** Enforce a consistent data shape contract:

1. **Use `depth: 0` for all adapter operations** — or strip populated objects in `transformOutput`
2. **Add a `flattenRelationships` step** in `transformOutput` that converts any populated relationship object to its scalar ID
3. **Set explicit `depth: 0`** in `better-auth-strategy.ts` and `refresh-token.ts` `findByID` calls
4. **Remove `as any` casts** — fix the types to reflect the actual data shape
5. **Validate cookie data shape** before passing to `setCookieCache` — ensure all relationship fields are scalar IDs, not objects

---

## P2 - Medium Priority Issues

These issues affect robustness, developer experience, or have limited security impact.

### P2-1: `afterLogout` Swallows Session Delete Errors

**File:** `plugin/lib/build-collections/users/hooks/after-logout.ts:77-83`

Empty `catch {}` block on session deletion. If the delete fails, the session record persists in the database but cookies are cleared. An attacker who captured the session token could still use it directly against Better Auth's API.

### P2-2: `onVerifiedChange` Only Syncs `true`, Never Syncs `false`

**File:** `plugin/lib/build-collections/users/hooks/on-verified-change.ts`

The hook only fires when `_verified` or `emailVerified` transitions to `true`. If an admin revokes verification by setting `_verified = false`, the `emailVerified` field remains `true`, and Better Auth still considers the email verified.

### P2-3: Verification Deletion Uses Fragile `like` Query

**File:** `plugin/lib/build-collections/users/hooks/before-delete.ts:51-58`

```typescript
where: { value: { like: `"${userId}"` } }
```

Uses `like` against JSON-stringified values. With numeric IDs, userId `"1"` matches `"10"`, `"12"`, `"100"`, etc. Could delete verification records belonging to other users.

### P2-4: Password Verification Triggers Full Login (Side Effects)

**File:** `plugin/lib/build-collections/utils/payload-access.ts:85-91`

The access control function calls `req.payload.login()` to verify the current password. This triggers the full afterLogin hook, creating an orphaned Better Auth session and potentially overwriting the user's current session cookies. Password verification should use a direct hash comparison instead.

### P2-5: Timing Attack in Password Verification

**File:** `plugin/lib/sanitize-better-auth-options/utils/password.ts:89`

```typescript
return storedHash === computedHash;
```

Direct string comparison is vulnerable to timing attacks. Should use `crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(computedHash))`.

### P2-6: `normalizeData` Crashes on Non-String `role` Values

**File:** `adapter/transform/index.ts:312-315`

```typescript
if (key === "role" || key === "roles") {
  return value.split(",").map((role: string) => role.trim().toLowerCase());
}
```

No type guard before calling `.split()`. If `value` is already an array (as Payload stores it), this throws `TypeError: value.split is not a function`. Also applies unconditionally to any field named "role" in any model.

### P2-7: `convertSort` and `convertSelect` Miss Field Name Mapping Layer

**File:** `adapter/transform/index.ts:840-878`

`convertSort` and `convertSelect` use `getFieldName` (schema-level) but not `getPayloadFieldName` (collection-level), unlike `convertWhereClause` which uses both. If a field's schema name differs from the Payload field name, sort and select operations reference the wrong field.

### P2-8: Date/Relationship Fields Without Custom `fieldName` Not Transformed in Output

**File:** `adapter/transform/index.ts:510-525`

The `transformOutput` function only transforms date and relationship fields that have a custom `fieldName` mapping. The detection logic:
```typescript
const originalDateFieldKey = Object.keys(dateFields).find(
  (k) => dateFields[k].fieldName === key
);
```
This fails when `fieldName` is `undefined` (non-renamed fields), because `undefined === "createdAt"` is false. Non-renamed dates remain as ISO strings instead of Date objects, and non-renamed relationship fields are not normalized.

### P2-9: `originalAfter` Middleware Not Awaited — PARTIALLY FIXED

**File:** `plugin/lib/sanitize-better-auth-options/utils/admin-after-role-middleware.ts:28-30`

```typescript
if (typeof originalAfter === "function") {
  originalAfter(ctx); // Missing await
}
```

The same pattern appeared in `use-admin-invite-after-email-sign-up-middleware.ts` (lines 23, 40, 46, 75). Async middleware results are fire-and-forget; errors become unhandled promise rejections.

**Partial Resolution:** The replacement `admin-invite-after-signup-middleware.ts` correctly `await`s all `originalAfter(ctx)` calls. The issue in `admin-after-role-middleware.ts` remains unfixed.

### P2-10: 2FA Secret Used as Admin Panel Title

**File:** `plugin/lib/build-collections/two-factors.ts:62-66`

The TOTP secret is set as `useAsTitle`, exposing it in admin panel list views, search results, and relationship dropdowns.

### P2-11: JWKS Private Key Not Hidden in Admin Panel

**File:** `plugin/lib/build-collections/jwks.ts:33-35`

The private key field has no `hidden: true` or `readOnly: true` admin config. Cryptographic keys are visible and editable in the admin panel.

### P2-12: Missing `references.model` in SSO, API Key, and OIDC Plugin Configurators

**Files:**
- `plugin/lib/sanitize-better-auth-options/sso-plugin.ts`
- `plugin/lib/sanitize-better-auth-options/api-key-plugin.ts`
- `plugin/lib/sanitize-better-auth-options/oidc-plugin.ts`

These configurators set `modelName` and `fields.userId.fieldName` but do NOT set `fields.userId.references.model`. The passkey and twoFactor plugins do set all three. This inconsistency means the userId foreign key for SSO providers, API keys, and all OIDC entities may reference the wrong collection when custom slugs are used.

### P2-13: `set-admin-role` Replaces Roles Instead of Merging — FIXED (Endpoint Removed)

**File:** `plugin/lib/build-collections/users/endpoints/set-admin-role.ts` (DELETED)

Previously, the `set-admin-role` endpoint used `data: { role: [role] }`, causing a user with `["user", "editor"]` who accepts an admin invite for `"admin"` to lose their existing roles entirely.

**Resolution:** The `set-admin-role` endpoint has been deleted. Role assignment now happens in the after-signup middleware via the adapter's `update` method. The current implementation sets the invited role directly; role merging can be added if needed in a future iteration.

### P2-14: `refreshToken` Uses `headers.set()` Instead of `headers.append()` for Set-Cookie

**File:** `plugin/lib/build-collections/users/endpoints/refresh-token.ts:112`

`response.headers.set("Set-Cookie", ...)` replaces any existing Set-Cookie header. When `setCookieCache` is called multiple times, only the last cookie survives.

### P2-15: Cookie Deletion Doesn't Specify `domain` Attribute

**File:** `plugin/lib/build-collections/users/hooks/after-logout.ts:98-103`

If cookies were originally set with a specific `domain` (e.g., `.example.com`), deletion without that `domain` attribute fails. Browsers require exact attribute matches for cookie deletion.

### P2-16: `organizationRole.organizationId` Reference Not Configured

**File:** `plugin/lib/sanitize-better-auth-options/organizations-plugin.ts:159-163`

Only `modelName` is set for organizationRole. The `organizationId` field name and `references.model` are not configured, which means custom collection slugs won't be reflected.

### P2-17: Auth Strategy Doesn't Check if User Is Banned

**File:** `plugin/lib/build-collections/users/better-auth-strategy.ts:28-31`

The strategy fetches the user by ID and returns it without checking `user.banned`, `user.locked`, or `user._status`. A banned user with a valid session continues to authenticate until the session expires.

### P2-18: Hard Next.js Dependency in Hooks

**Files:** `users/hooks/after-login.ts:7-8`, `users/hooks/after-logout.ts:1`

```typescript
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
```

These imports lock the plugin to Next.js. The `next/dist/compiled/...` path is an internal unstable import that can break across Next.js versions.

### P2-19: `Math.random()` Used for Password Generation

**File:** `plugin/lib/sanitize-better-auth-options/utils/ensure-password-set-before-create.ts:20-27`

`Math.random()` is cryptographically insecure. While these are "filler" passwords for social-login users, `crypto.randomBytes()` should be used for any credential material.

### P2-20: `beforeDelete` Error Message Says "afterDelete"

**File:** `plugin/lib/build-collections/users/hooks/before-delete.ts:68`

```typescript
console.error("Error in user afterDelete hook:", error);
```

Minor but misleading during debugging.

---

## P3 - Low Priority Issues

These are performance issues, code quality concerns, or very unlikely edge cases.

### P3-1: `resolvePayloadClient()` Called on Every Adapter Operation

**File:** `adapter/index.ts:94-105`

If `payloadClient` is a function, it's re-invoked on every database operation. Should cache after first resolution.

### P3-2: `isPayloadRelationship` Calls `flattenAllFields` on Every Field

**File:** `adapter/transform/index.ts:70-82`

`flattenAllFields` recurses through all collection fields on every call. For a document with 20 fields, this means 20 recursive traversals per operation. Should cache per collection.

### P3-3: `parseInt` vs `Number` Inconsistency for ID Parsing

**File:** `adapter/transform/index.ts:255` vs `adapter/transform/index.ts:685`

`normalizeData` uses `parseInt("123abc", 10)` = `123` (silent truncation), while `convertWhereValue` uses `Number("123abc")` = `NaN`. Inconsistent behavior for malformed IDs.

### P3-4: `like` Operator May Not Work on MongoDB

**File:** `adapter/transform/index.ts:645-648`

`starts_with` and `ends_with` use `like` with SQL `%` wildcards. MongoDB adapter compatibility is uncertain.

### P3-5: All Date Fields Labeled as "updatedAt"

Multiple collection builders (accounts, sessions, verifications, teams, oauth-*, api-keys) apply `label: "general:updatedAt"` to ALL date fields, including `createdAt`. This is a minor UI issue in the admin panel.

### P3-6: `deviceCode` Collection Has Wrong Descriptions

**File:** `plugin/lib/build-collections/device-code.ts:33-38, 56-57`

Descriptions copied from team-members collection: "The user that is a member of the team" and "Device codes of an organization team."

### P3-7: `deviceCode` Missing `collectionOverrides` Support

Unlike all other collection builders, deviceCode doesn't support `collectionOverrides`.

### P3-8: `subscriptions` Collection Missing `admin.hidden`

**File:** `plugin/lib/build-collections/subscriptions.ts:89-101`

Always visible in admin panel even when `hidePluginCollections` is true.

### P3-9: Auth Strategy Silently Returns `{ user: null }` for All Errors

**File:** `plugin/lib/build-collections/users/better-auth-strategy.ts:42-44`

Database outages, network failures, and malformed tokens all produce the same silent "not authenticated" response. No logging.

### P3-10: No `betterAuth` Property Validation in `getPayloadAuth`

**File:** `plugin/lib/get-payload-auth.ts:8-11`

The function casts the payload instance to include `betterAuth` without verifying it exists. Produces cryptic errors on misconfiguration.

### P3-11: Role Format Inconsistency Between Admin and Non-Admin Routes

The admin role middleware converts roles between array and comma-separated string only for `/admin` routes. Non-admin routes may receive inconsistent formats.

### P3-12: User Options Object Mutated in Place

**File:** `plugin/index.ts:54`

`pluginOptions.betterAuthOptions = sanitizedBetterAuthOptions` mutates the user's original config. The shallow copy in sanitization shares nested object references, so nested mutations affect the original.

### P3-13: `config` Parameter Accepts Promise But Is Never Used

**File:** `plugin/lib/sanitize-better-auth-options/index.ts:44`

Dead parameter in the type signature.

---

## Architectural Concerns

### Data Shape Boundary Violation

The most fundamental architectural issue is the lack of a clean data shape contract between Payload and Better Auth. Payload returns populated relationship documents (objects with nested fields), while Better Auth expects flat scalar IDs. The adapter transform layer creates dual representations instead of enforcing a single canonical shape, and consumer code (auth strategy, refresh endpoint) bypasses the adapter entirely, calling Payload's local API without depth control. This allows populated objects to leak into Better Auth's session cache, cookie data, and API responses. See P1-13 for full details.

### Error Swallowing Pattern

The adapter systematically catches and silently handles errors:
- `create` returns `null as R`
- `findMany` returns `[] as R[]`
- `update` returns `null`
- `delete` swallows silently
- `count` returns `0`

This makes debugging extremely difficult. A misconfigured collection slug, a constraint violation, or a connection failure all produce zero-error behavior with silently wrong data.

### Inconsistent Collection Override Patterns

Three different patterns are used:
1. **Users:** `{ ...existing, slug, admin, access }` - existing first, plugin overrides specific keys
2. **Accounts:** `{ slug, admin, access, ..., ...existing }` - existing LAST, overwrites everything
3. **Sessions/Teams/etc:** `{ ...existing, slug, admin: { ..., ...existing.admin } }` - mixed

This inconsistency makes the override behavior unpredictable for users.

---

## Recommendations

### Immediate Actions (P0)
1. ~~Fix `allowedFields.push()` to use a local copy~~ **DONE** — uses local `effectiveAllowedFields` variable
2. ~~Fix `baModelKey.user` -> `baModelKey.organization` in organizations-plugin.ts~~ **DONE** — fixed with regression test
3. ~~Add authentication checks to invite endpoints~~ **DONE** — endpoints hardened with auth + BA session checks; `set-admin-role` eliminated
4. ~~Add atomic token consumption with expiration to set-admin-role~~ **DONE** — endpoint removed; token consumed atomically in after-signup middleware
5. ~~Stop dropping `null` values in transformInput~~ **DONE** — only `undefined` is skipped, `null` passes through

### Short-Term (P1)
6. Rewrite `convertWhereClause` to correctly interpret sequential connectors
7. Add relationship field ID conversion in where clauses
8. Fix pagination math for non-aligned offsets
9. Fix accounts collection override pattern (spread existing first, not last)
10. Fix login method detection logic
11. Re-throw errors from adapter `create()` instead of returning null
12. Expand cascade delete to cover all plugin collections
13. ~~Handle social sign-up path in admin invite after middleware~~ **DONE** — after-signup middleware now handles both email and OAuth callbacks
14. Allow unsupported plugins to pass through (or throw a descriptive error)
15. Respect user-provided password hashing functions
16. Enforce consistent data shape boundary — depth 0 everywhere, flatten relationships in transformOutput, explicit depth in strategy/endpoint findByID calls

### Medium-Term (P2)
17. Implement proper transactions using Payload's database adapter
18. Abstract cookie operations to support non-Next.js environments
19. Add banned-user check in auth strategy
20. Use `crypto.timingSafeEqual` for password verification
21. Add role-guarding type to `normalizeData`
22. Apply consistent field name mapping across sort/select/where
23. Fix date/relationship field detection in transformOutput
24. Await all async middleware (partially fixed in admin-invite middleware; `admin-after-role-middleware.ts` still affected)
25. Hide sensitive fields (2FA secrets, JWKS private keys) in admin UI
26. Add missing `references.model` configurations for SSO, API Key, OIDC plugins

### Long-Term (Architecture)
27. Standardize collection override patterns (document the contract)
28. Add a comprehensive error reporting system instead of swallowing errors
29. Add startup-time validation for required config (baseURL, secret, social provider credentials)
30. Add runtime validation that `defaultRole` exists in `roles` array
31. Enforce data shape contract with schema validation at adapter boundary
