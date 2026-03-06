# Audit Report Review — Verification & New Findings

**Date:** March 5, 2026
**Scope:** Verification of all 51 audit items from `AUDIT-REPORT.md` against current source code, plus deep codebase review for new issues.
**Branch:** `feat/overhaul` @ commit `30f55f6`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Audit Fix Verification](#audit-fix-verification)
3. [Regression Found](#regression-found)
4. [New Issues](#new-issues)
5. [Recommendations](#recommendations)

---

## Executive Summary

All 51 items from the original audit report were verified against the current codebase. **50 of 51 fixes are properly implemented.** One regression was found in the API key plugin configurator (P2-12), where the `userId.references.model` configuration was removed during the BA v1.5 upgrade.

A deep security and correctness review uncovered **11 new issues** not covered in the original audit: 3 high severity, 5 medium, and 3 low.

---

## Audit Fix Verification

### P0 — Critical (5/5 FIXED)

| ID | Issue | Status | Verified |
|----|-------|--------|----------|
| P0-1 | Shared `allowedFields` array mutation bypasses password verification | FIXED | `effectiveAllowedFields = [...allowedFields, ...]` at `payload-access.ts:96` |
| P0-2 | Team `organizationId` references wrong model | FIXED | References `baModelKey.organization` at `organizations-plugin.ts:111` |
| P0-3 | Admin invite endpoints unauthenticated | FIXED | `req.user` + admin role + BA session checks in both endpoints; `set-admin-role.ts` deleted |
| P0-4 | Invite token race condition | FIXED | `set-admin-role.ts` deleted; atomic token consumption in after-signup middleware |
| P0-5 | `transformInput` drops `null` values | FIXED | Guard changed to `if (value === undefined)` at `transform/index.ts:364` |

### P1 — High (13/13 FIXED or MITIGATED)

| ID | Issue | Status | Verified |
|----|-------|--------|----------|
| P1-1 | WHERE clause AND/OR connector semantics | NOT A BUG | Matches official BA adapter behavior |
| P1-2 | Relationship field IDs not type-converted in WHERE | FIXED | `convertWhereValue` accepts `model` param, checks `isRelationshipField()` |
| P1-3 | `findMany` pagination wrong for unaligned offsets | FIXED | `page: 1, limit: offset+limit`, then `docs.slice(offset, offset+limit)` |
| P1-4 | Accounts `existingCollection` override destroys guards | FIXED | `...existingAccountCollection` spread at beginning of object |
| P1-5 | `setLoginMethods` incorrect detection | FIXED | Checks `betterAuthOptions?.emailAndPassword?.enabled` |
| P1-6 | Adapter returns `null as R` on error | FIXED | All 8 methods re-throw non-404 errors |
| P1-7 | Incomplete cascade delete | FIXED | Covers accounts, sessions, verifications, passkeys, twoFactor, apiKeys, ssoProviders, oauthApplications, oauthAccessTokens, oauthConsents, members, invitations |
| P1-8 | Admin invite role not applied for OAuth | FIXED | After-signup middleware handles `/sign-up/email` and `/callback/*` |
| P1-9 | Unsupported plugins silently stripped | FIXED | All plugins kept; only supported ones configured |
| P1-10 | Password hashing silently overwritten | FIXED | Override code removed entirely |
| P1-11 | Transaction is no-op | MITIGATED | try/catch with error propagation; true atomicity requires BA adapter interface changes |
| P1-12 | `afterLogin` hook no error handling | FIXED | Hook deleted entirely |
| P1-13 | Data shape disconnect / depth issues | FIXED | `PAYLOAD_QUERY_DEPTH = 0`; `depth: 0` in strategy and refresh endpoint |

### P2 — Medium (19/20 FIXED — 1 REGRESSION)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| P2-1 | `afterLogout` swallows errors | FIXED | Catch block logs with `console.error` |
| P2-2 | `onVerifiedChange` only syncs true | N/A | File never existed |
| P2-3 | Verification deletion uses fragile `like` | FIXED | Changed to `contains` with JSON-quoted userId |
| P2-4 | Password verification triggers full login | KNOWN LIMITATION | Documented; `afterLogin` hook deleted so primary side effect gone |
| P2-5 | Timing attack in password verification | N/A | File removed; BA manages bcrypt internally |
| P2-6 | `normalizeData` crashes on non-string role | FIXED | Handles array, string, and other types |
| P2-7 | `convertSort`/`convertSelect` miss field mapping | FIXED | Both accept `payload` param; apply collection-level mapping |
| P2-8 | Date/relationship fields without `fieldName` not transformed | FIXED | Detection uses `(dateFields[k].fieldName \|\| k) === key` |
| P2-9 | `originalAfter` middleware not awaited | FIXED | `await originalAfter(ctx)` in both middleware files |
| P2-10 | 2FA secret used as admin panel title | FIXED | `useAsTitle` set to `userId` field |
| P2-11 | JWKS private key not hidden | FIXED | `hidden: true` in admin config |
| P2-12 | Missing `references.model` in SSO, API Key, OIDC | **REGRESSION** | See [Regression Found](#regression-found) |
| P2-13 | `set-admin-role` replaces roles | FIXED | Endpoint removed |
| P2-14 | `refreshToken` uses `headers.set()` | FIXED | Changed to `headers.append()` |
| P2-15 | Cookie deletion doesn't specify domain | KNOWN LIMITATION | Next.js `cookies()` API limitation |
| P2-16 | `organizationRole.organizationId` reference missing | FIXED | `fieldName` and `references.model` configured |
| P2-17 | Auth strategy doesn't check banned | FIXED | Checks `user.banned \|\| user.locked` |
| P2-18 | Hard Next.js dependency in hooks | PARTIALLY FIXED | `afterLogin` deleted; `afterLogout` still imports `next/headers` |
| P2-19 | `Math.random()` for password generation | N/A | File removed |
| P2-20 | `beforeDelete` error message says "afterDelete" | FIXED | Corrected during P1-7 rewrite |

### P3 — Low (13/13 FIXED or NOT A BUG)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| P3-1 | `resolvePayloadClient()` called every operation | FIXED | `cachedPayload` variable caches resolved client |
| P3-2 | `isPayloadRelationship` calls `flattenAllFields` repeatedly | FIXED | `flattenedFieldsCache` Map per collection slug |
| P3-3 | `parseInt` vs `Number` inconsistency | FIXED | Standardized to `Number()` |
| P3-4 | `like` operator may not work on MongoDB | NOT A BUG | Payload abstracts across adapters |
| P3-5 | All date fields labeled "updatedAt" | FIXED | Conditions check `fieldName === "createdAt"` or `"updatedAt"` |
| P3-6 | `deviceCode` has wrong descriptions | FIXED | Correct descriptions for device authorization flow |
| P3-7 | `deviceCode` missing `collectionOverrides` | FIXED | `pluginCollectionOverrides?.deviceCode` support added |
| P3-8 | `subscriptions` missing `admin.hidden` | FIXED | `hidden: pluginOptions.hidePluginCollections ?? false` |
| P3-9 | Auth strategy silently returns `{ user: null }` | FIXED | `console.error` added in catch block |
| P3-10 | No `betterAuth` property validation | FIXED | Throws descriptive error if `payload.betterAuth` is falsy |
| P3-11 | Role format inconsistency | NOT A BUG | Intentional bridge between BA string and Payload array formats |
| P3-12 | User options object mutated in place | FIXED | `pluginOptions.betterAuthOptions` no longer overwritten |
| P3-13 | `config` parameter accepts Promise but unused | FIXED | Dead parameter removed from signature |

---

## Regression Found

### P2-12 REGRESSION: API Key Plugin Missing `userId.references.model`

**File:** `plugin/lib/sanitize-better-auth-options/api-key-plugin.ts`
**Severity:** Medium
**Introduced in:** Commit `30f55f6` (BA v1.5 upgrade)

The API key plugin configurator was stripped down to only setting `modelName`. The `userId.fieldName` and `userId.references.model` configurations that were added for the original P2-12 fix have been removed.

**Current code:**
```typescript
export function configureApiKeyPlugin(plugin: any, resolvedSchemas: BetterAuthSchemas): void {
  const model = baModelKey.apikey;
  set(plugin, `schema.${model}.modelName`, getSchemaCollectionSlug(resolvedSchemas, model));
  // Missing: userId.fieldName and userId.references.model
}
```

**Comparison:** The SSO and OIDC plugins still have their full `references.model` configurations. The API key plugin is the only one missing it.

**Impact:** When custom collection slugs are used, the API key `userId` foreign key won't resolve to the correct users collection. Default slugs are unaffected.

**Fix:** Re-add the `userId` configuration:
```typescript
set(plugin, `schema.${model}.fields.userId.fieldName`,
  getSchemaFieldName(resolvedSchemas, model, "userId"));
set(plugin, `schema.${model}.fields.userId.references.model`,
  getSchemaCollectionSlug(resolvedSchemas, baModelKey.user));
```

---

## New Issues

Issues discovered during deep codebase review that were not covered in the original audit report.

### HIGH Severity

#### NEW-1: `callbackURL` Open Redirect in Email Verification

**File:** `plugin/helpers/generate-verify-email-url.ts:62`
**Type:** Security — Open Redirect

The `callbackURL` parameter is URL-encoded into the verification link but never validated:

```typescript
const verifyUrl = `${verifyRouteUrl}?token=${jwt}${callbackURL ? `&callbackURL=${encodeURIComponent(callbackURL)}` : ""}`;
```

If an attacker controls `callbackURL` (e.g. via a query parameter during signup), they can set it to `https://evil.com`. Users clicking the verification email will be redirected to a phishing site after verifying their email.

**Impact:** Phishing attacks via email verification links. Users trust the email because it comes from the legitimate application.

**Fix:** Validate that `callbackURL` is a relative URL (starts with `/` and not `//`) or matches the application's configured `baseURL` origin before embedding it.

---

#### NEW-2: Admin Invite Tokens Never Expire

**File:** `plugin/lib/sanitize-better-auth-options/utils/require-admin-invite-for-sign-up-middleware.ts:48-51`
**Type:** Security — Missing Expiration

The before-signup middleware checks if a token exists but never checks an expiration timestamp:

```typescript
const isValidAdminInvitation = await ctx.context.adapter.count({
  model: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
  where: [query]
});
```

Admin invite tokens remain valid indefinitely. If a token is leaked via logs, email archives, browser history, or shared links, it can be used at any time in the future to create an admin account.

**Impact:** Privilege escalation via leaked or old invite tokens.

**Fix:** Add a `createdAt` threshold or `expiresAt` field to the invitation model and include it in the query. A reasonable default would be 7 days.

---

#### NEW-3: `beforeDelete` Hook Swallows Errors, Allows Orphaned Records

**File:** `plugin/lib/build-collections/users/hooks/before-delete.ts:115-119`
**Type:** Data Integrity — Orphaned Records

If any cascade delete fails (sessions, accounts, verifications, etc.), the error is caught and logged but the hook returns without re-throwing:

```typescript
catch (error) {
  await killTransaction(req);
  console.error("Error in user beforeDelete hook:", error);
  return; // User deletion proceeds despite cascade failure
}
```

The user record is still deleted, leaving orphaned auth records that reference a non-existent user. These orphans can cause errors in session lookups, account queries, and admin UI views.

**Impact:** Database integrity violations. Orphaned sessions could theoretically be used to authenticate as a deleted user if the session lookup doesn't join to the users table.

**Fix:** Re-throw the error after logging so the user deletion is aborted when cascade deletes fail. The transaction rollback (`killTransaction`) is already called, so re-throwing will prevent the parent delete from committing.

---

### MEDIUM Severity

#### NEW-4: Invite Token Race Condition (Find-then-Delete Pattern)

**File:** `plugin/lib/sanitize-better-auth-options/utils/admin-invite-after-signup-middleware.ts:52-81`
**Type:** Security — Race Condition

The after-signup middleware performs `findOne` then `delete` as two separate adapter operations:

```typescript
const adminInvitation = await adapter.findOne({ model: slug, where: [...] });
// ... validation ...
await adapter.delete({ model: slug, where: [{ field: "id", value: adminInvitation.id }] });
```

Between these calls, a concurrent request could find the same token. Since the adapter's `transaction()` method cannot provide true atomicity (P1-11 limitation), the race window exists.

**Impact:** A single invite token could potentially be used by two concurrent signup requests to grant admin roles to both users. The window is small (milliseconds), making exploitation difficult but not impossible.

**Mitigation:** The window is much smaller than the original P0-4 issue (which had a multi-step endpoint). A `deleteOne`-returning-deleted-doc pattern or a database-level unique constraint with `DELETE ... RETURNING` would eliminate it entirely.

---

#### NEW-5: `findMany` Performance for Large Offsets

**File:** `adapter/index.ts:407-426`
**Type:** Performance

The P1-3 pagination fix fetches `offset + limit` records and then slices:

```typescript
const fetchLimit = offset + limit;
// ...
limit: fetchLimit,
// ...
docs: res.docs.slice(offset, offset + limit),
```

For large offsets (e.g. `offset: 10000, limit: 10`), this fetches 10,010 records from the database, loads them all into memory, and discards 10,000. With large datasets this causes significant memory pressure and slow queries.

**Impact:** Performance degradation with large result sets. Better Auth's internal pagination may not hit large offsets in practice, but any plugin or custom code using the adapter directly could.

**Fix:** Compute the correct Payload `page` number: `Math.floor(offset / limit) + 1`. Handle the remainder case where `offset % limit !== 0` by fetching two pages and merging. This keeps the fetch size proportional to `limit`, not `offset + limit`.

---

#### NEW-6: Nullish Coalescing on Boolean in `get-ip.ts`

**File:** `plugin/helpers/get-ip.ts:11-14`
**Type:** Code Quality — Operator Misuse

```typescript
if (
  (process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development") ??
  false
) {
```

The `??` (nullish coalescing) operator is applied to a boolean expression. Since `===` always returns `true` or `false` (never `null`/`undefined`), the `?? false` is a no-op. The condition works correctly in practice, but the operator is semantically wrong — it should be `||` if a fallback is intended, or removed entirely.

**Impact:** None in practice. Code quality concern only.

**Fix:** Remove `?? false` — the boolean expression is self-sufficient.

---

#### NEW-7: Cookie Token Format Not Validated in `after-logout.ts`

**File:** `plugin/lib/build-collections/users/hooks/after-logout.ts:68`
**Type:** Correctness — Edge Case

```typescript
const [token] = rawCookieValue.split(".");
```

If `rawCookieValue` doesn't contain a dot (malformed or unsigned cookie), `token` becomes the entire cookie value. The subsequent session query uses this wrong value, fails to find a match, and the database session is never deleted.

**Impact:** Session records accumulate in the database for users with malformed cookies. Sessions expire naturally but are not cleaned up on logout.

**Fix:** Validate that the split produces at least 2 parts before proceeding:
```typescript
const parts = rawCookieValue.split(".");
if (parts.length < 2) return;
const [token] = parts;
```

---

#### NEW-8: Hard Next.js Dependency in `after-logout.ts`

**File:** `plugin/lib/build-collections/users/hooks/after-logout.ts:1`
**Type:** Architecture — Framework Coupling

```typescript
import { cookies } from "next/headers";
```

This import crashes at module load time for any non-Next.js project (Express, Fastify, Hono, standalone Payload). The audit noted this as P2-18 "PARTIALLY FIXED" — the `afterLogin` hook was deleted but `afterLogout` remains tied to Next.js.

**Impact:** The plugin is unusable outside Next.js. Any project using Payload with a different framework will fail.

**Fix:** Abstract cookie operations behind a framework-agnostic interface, or use Payload's `req`/`res` objects (which are framework-independent) for cookie management. This is a non-trivial architectural change.

---

### LOW Severity

#### NEW-9: No Role Hierarchy Enforcement on Invite Generation

**File:** `plugin/lib/build-collections/users/endpoints/generate-invite-url.ts:71`
**Type:** Security — Authorization Gap

The endpoint validates that the requested role exists in the configured roles list:

```typescript
if (!roles.some((role) => role.value === body.role.value)) {
  return Response.json({ message: "Invalid role" }, { status: 400 });
}
```

But it doesn't check whether the requesting admin has sufficient privilege to grant that role. An admin with a lower-privilege role (e.g. "editor") could generate invite links for a higher-privilege role (e.g. "super-admin") if both exist in the roles configuration.

**Impact:** Privilege escalation in systems with role hierarchies. Not an issue for flat role models where all admins are equal.

---

#### NEW-10: Body Validation Without Schema in `generate-invite-url.ts`

**File:** `plugin/lib/build-collections/users/endpoints/generate-invite-url.ts:52-76`
**Type:** Code Quality — Input Validation

The request body is cast with `as` and validated with basic `typeof`/`in` checks:

```typescript
const body = req.data as { role: { label: string; value: string } };
if (!body) { ... }
if (typeof body !== "object" || !("role" in body)) { ... }
```

If `body.role` is truthy but not an object with a `.value` property, the `roles.some()` check throws at runtime. The sibling endpoint `send-invite-url.ts` already uses Zod for body validation.

**Fix:** Use Zod schema validation consistent with `send-invite-url.ts`.

---

#### NEW-11: Unresolved `TODO` in User Collection Builder

**File:** `plugin/lib/build-collections/users/index.ts:70`
**Type:** Code Quality — Incomplete Design

```typescript
// TODO: REVIEW THIS
const allowedFields = pluginOptions.users?.allowedFields ?? ["name"];
```

The hardcoded default of `["name"]` may not match all user schemas. If a user adds custom fields to their user collection (e.g. `phone`, `avatar`), those fields won't be in the allowed list and users won't be able to update them through the standard access control path.

---

## Recommendations

### Immediate (Before Release)

1. **Fix P2-12 regression** — Re-add `userId.fieldName` and `userId.references.model` to the API key plugin configurator
2. **Fix NEW-1** — Validate `callbackURL` in email verification URL generation (open redirect)
3. **Fix NEW-2** — Add expiration check to admin invite token validation
4. **Fix NEW-3** — Re-throw errors in `beforeDelete` hook to prevent orphaned records

### Short-Term

5. **Fix NEW-4** — Consider a `deleteOne`-returning-doc pattern for invite token consumption
6. **Fix NEW-7** — Validate cookie token format before session deletion
7. **Fix NEW-10** — Add Zod validation to `generate-invite-url` endpoint body
8. **Fix NEW-6** — Remove no-op `?? false` in `get-ip.ts`

### Medium-Term (Architecture)

9. **Fix NEW-8** — Abstract cookie operations for framework independence (P2-18 continuation)
10. **Fix NEW-5** — Improve `findMany` pagination math for large offsets
11. **Fix NEW-11** — Resolve the allowed fields TODO with a dynamic default based on schema
12. **Fix NEW-9** — Consider role hierarchy enforcement if multi-tier admin roles are supported
