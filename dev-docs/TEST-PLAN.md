# Payload Better Auth Plugin — Comprehensive Test Plan

**Date:** February 25, 2026
**Purpose:** Catalog all existing tests and define all tests needed for TDD. This document serves as the roadmap for bringing the plugin to production-grade reliability.

---

## Table of Contents

1. [Test Infrastructure](#test-infrastructure)
2. [Existing Tests — Inventory](#existing-tests--inventory)
3. [Test Gaps — What's Missing](#test-gaps--whats-missing)
4. [TDD Roadmap — Priority Order](#tdd-roadmap--priority-order)

---

## Test Infrastructure

### Framework & Configuration
- **Framework:** Vitest
- **Config:** `packages/payload-auth/vitest.config.ts`
- **Test pattern:** `src/**/*.test.ts`

### Test Types

| Type | Description | Requirements |
|------|-------------|--------------|
| **Unit** | Mocked dependencies, fast, no DB | None |
| **Integration** | Real Payload + Postgres, full lifecycle | Running PostgreSQL via Docker |

### Running Tests

```bash
# Unit tests only (no DB needed)
cd packages/payload-auth && pnpm test

# Integration tests (requires Postgres)
docker compose up -d postgres
cd packages/payload-auth && pnpm test
```

### Dev Environment
- **Config file:** `src/better-auth/adapter/tests/dev/index.ts`
- Exports `getPayload()` and `betterAuthPluginOptions` for integration tests
- Uses a shared Postgres database with automatic cleanup in beforeAll/afterAll

---

## Existing Tests — Inventory

### Summary

| # | File | Type | Cases | Status | Covers |
|---|------|------|-------|--------|--------|
| 1 | `adapter/tests/adapter.test.ts` | Integration | 4+ | Passing | Adapter CRUD, ID types, auth flow |
| 2 | `adapter/tests/transform.test.ts` | Unit | 32 | Passing | Transform layer, where clauses, P0-5 |
| 3 | `adapter/tests/null-handling.test.ts` | Integration | 3 | Passing | P0-5 null value handling |
| 4 | `plugin/tests/payload-access.test.ts` | Unit | 31 | Passing | Access control, P0-1 regression |
| 5 | `plugin/tests/organizations-plugin.test.ts` | Unit | 11 | Passing | Org schema, P0-2 regression |
| 6 | `plugin/tests/endpoint-auth.test.ts` | Integration | 4 | Passing | P0-3 endpoint auth guards |
| 7 | `plugin/tests/set-admin-role.test.ts` | Integration | 6 | Passing | P0-4 token consumption |
| 8 | `plugin/tests/set-login-methods.test.ts` | Unit | 9 | **Red (TDD)** | P1-5 login method detection |
| 9 | `plugin/tests/admin-role-middleware.test.ts` | Unit | 16 | **Red (TDD)** | #112/#128 role handling, P2-9 |
| 10 | `plugin/tests/better-auth-strategy.test.ts` | Unit | 10 | **Red (TDD)** | P2-17 banned user check |
| 11 | `plugin/tests/before-delete-hook.test.ts` | Unit | 9 | **Red (TDD)** | P1-7 cascade delete |
| 12 | `plugin/tests/after-logout-hook.test.ts` | Unit | 8 | **Red (TDD)** | P2-1 error handling, cookies |
| 13 | `plugin/tests/role-handling.test.ts` | Integration | 5 | **Red (TDD)** | #112/#128 role round-trip |

**Total: 13 files, ~148 test cases (7 passing, 6 red/TDD)**

---

### Detailed Breakdown

#### 1. `adapter/tests/adapter.test.ts` — Adapter Integration

Tests the full adapter lifecycle with a real Postgres database.

| Test | Description |
|------|-------------|
| Base collections adapter tests | Adapter CRUD operations with string IDs |
| Number ID adapter tests | Adapter CRUD with numeric IDs |
| Signup and signin flow | End-to-end auth via Better Auth API |
| Session retrieval | Session lookup after authentication |

**Coverage gaps:** No tests for `findMany` pagination, `updateMany`, `deleteMany`, `count`, or `transaction` behavior.

---

#### 2. `adapter/tests/transform.test.ts` — Transform Layer

Comprehensive unit tests for the data transformation layer.

| Area | Tests |
|------|-------|
| `transformInput` | Null/undefined handling (P0-5 fix), field clearing |
| `convertWhereClause` | All operators (eq, ne, gt, gte, lt, lte, contains, in, starts_with, ends_with) |
| `convertWhereClause` | ID type conversion (string → number) |
| `convertWhereClause` | Edge cases (empty arrays, undefined input) |
| `singleIdQuery` | ID extraction from query objects |
| `convertSort` | Sort directive conversion (asc/desc) |
| `convertSelect` | Field projection mapping |
| `getCollectionSlug` | Model → slug resolution |
| `getFieldName` | Field name mapping |

**Coverage gaps:** No tests for `transformOutput`, `normalizeDocumentIds`, `normalizeData` role handling, AND/OR connector semantics (P1-1), relationship ID conversion in where clauses (P1-2), or `convertSort`/`convertSelect` field name mapping (P2-7).

---

#### 3. `adapter/tests/null-handling.test.ts` — Null Values Integration

| Test | Description |
|------|-------------|
| Set field to null | Clearing a nullable field via adapter update |
| Undefined skips update | Undefined values don't modify the field |
| End-to-end via BA API | Null handling through Better Auth signup + update |

---

#### 4. `plugin/tests/payload-access.test.ts` — Access Control

The most comprehensive test file (31 cases). Covers all access control functions.

| Area | Tests |
|------|-------|
| `hasAdminRoles` | Array, string, comma-separated role formats |
| `isAdminWithRoles` | Admin role matching |
| `isAdminOrCurrentUserWithRoles` | Admin check + current user constraint |
| `isAdminOrCurrentUserUpdateWithAllowedFields` | Field-level access, password verification |
| P0-1 regression | Array mutation bug fix — allowedFields isolation |
| P0-1 regression | Password verification persistence across requests |

---

#### 5. `plugin/tests/organizations-plugin.test.ts` — Organization Schema

| Test | Description |
|------|-------------|
| Team schema references | organizationId → organization collection (P0-2) |
| Member schema references | userId, organizationId fields |
| Invitation schema references | userId, organizationId fields |
| Team-member references | userId, teamId fields |
| Custom slug handling | Custom collection slugs reflected in schemas |

---

#### 6. `plugin/tests/endpoint-auth.test.ts` — Endpoint Auth Guards

| Test | Description |
|------|-------------|
| Generate invite — unauth | Returns 401 for unauthenticated |
| Generate invite — non-admin | Returns 403 for non-admin |
| Send invite — unauth | Returns 401 for unauthenticated |
| Send invite — non-admin | Returns 403 for non-admin |

---

#### 7. `plugin/tests/set-admin-role.test.ts` — Token Consumption

| Test | Description |
|------|-------------|
| Missing token | Rejects request without token |
| Invalid token | Rejects request with invalid token |
| Unauthenticated | Rejects unauthenticated request |
| Valid token consumption | Token used once, then deleted |
| Redirect validation | Blocks absolute URLs (open redirect) |
| Valid redirect | Allows relative paths |

---

#### 8. `plugin/tests/set-login-methods.test.ts` — Login Method Detection (TDD)

| Test | Status | Description |
|------|--------|-------------|
| emailPassword enabled | Passing | Detects enabled email/password |
| emailPassword disabled | **Red** | `{ enabled: false }` should NOT be detected (P1-5) |
| emailPassword absent | **Red** | Object without `enabled` should NOT be detected |
| Social providers | Passing | Detects Google, GitHub, etc. |
| Multiple providers | Passing | Lists all enabled social providers |
| Empty config | Passing | Returns empty array |

---

#### 9. `plugin/tests/admin-role-middleware.test.ts` — Role Middleware (TDD)

| Test | Status | Description |
|------|--------|-------------|
| Before: array → string on /admin | Passing | Converts role array to comma-separated |
| Before: non-admin path | Passing | No conversion on non-admin paths |
| Before: string role | Passing | Idempotent for already-string roles |
| Before: null session | Passing | Handles missing session gracefully |
| Before: preserves existing hooks | Passing | Calls original before middleware |
| After: string → array on /admin | Passing | Converts comma-separated back to array |
| After: array input | **Red** | `.split(",")` crashes on array (#112/#128) |
| After: single role | Passing | Handles single role correctly |
| After: whitespace trimming | Passing | Trims whitespace around roles |
| After: empty string filtering | Passing | Removes empty strings |
| After: P2-9 await | **Red** | `originalAfter` not awaited |
| After: non-admin path | Passing | No conversion on non-admin paths |

---

#### 10. `plugin/tests/better-auth-strategy.test.ts` — Auth Strategy (TDD)

| Test | Status | Description |
|------|--------|-------------|
| Valid session → user | Passing | Returns authenticated user |
| No session | Passing | Returns `{ user: null }` |
| No userId | Passing | Returns `{ user: null }` |
| findByID null | Passing | Returns `{ user: null }` |
| getSession throws | Passing | Returns `{ user: null }` |
| findByID throws | Passing | Returns `{ user: null }` |
| Banned user | **Red** | Should return null (P2-17) |
| Expired ban | **Red** | Should allow authentication |
| Default user slug | Passing | Uses "users" when slug not specified |

---

#### 11. `plugin/tests/before-delete-hook.test.ts` — Cascade Delete (TDD)

| Test | Status | Description |
|------|--------|-------------|
| Deletes accounts | Passing | Cascades to accounts collection |
| Deletes sessions | Passing | Cascades to sessions collection |
| Deletes verifications | Passing | Cascades to verifications collection |
| Deletes passkeys | **Red** | Missing cascade (P1-7) |
| Deletes twoFactors | **Red** | Missing cascade (P1-7) |
| Delete failure | Passing | Doesn't crash on delete error |
| Transaction usage | Passing | Uses req context |
| P2-3 query fragility | Docs only | Documents fragile `like` pattern |

---

#### 12. `plugin/tests/after-logout-hook.test.ts` — Logout Hook (TDD)

| Test | Status | Description |
|------|--------|-------------|
| Clears BA cookies | Passing | Clears session_token, session_data, dont_remember |
| Multi-session cookies | Passing | Clears indexed cookies |
| Session DB deletion | Passing | Deletes session record by token |
| Missing token | Passing | Doesn't crash without token |
| Delete failure (P2-1) | Passing | Doesn't crash on delete error |
| __Secure- cookies | Passing | Sets secure flag on __Secure- prefixed cookies |

---

#### 13. `plugin/tests/role-handling.test.ts` — Role Round-Trip Integration (TDD)

| Test | Status | Description |
|------|--------|-------------|
| Array storage | Pending | Role stored as array in Payload |
| Round-trip | Pending | Role survives BA adapter round-trip |
| Single role array | Pending | Single role as single-element array |
| Session role format | Pending | BA session has accessible role field |

---

## Test Gaps — What's Missing

### Priority 1: Critical Missing Tests

These tests are needed to verify fixes for high-severity issues and cover critical untested paths.

#### T1. Adapter Data Shape Contract Tests (P1-13)

**New file:** `adapter/tests/data-shape.test.ts`

Tests to verify that the adapter always returns flat scalar IDs, never populated relationship objects.

| Test | Audit Ref | Description |
|------|-----------|-------------|
| `create` returns flat IDs | P1-13 | No populated objects in create response |
| `findOne` returns flat IDs | P1-13 | Relationship fields are scalar strings |
| `findMany` returns flat IDs | P1-13 | All documents have flat relationship IDs |
| `update` returns flat IDs | P1-13 | Updated document has flat IDs |
| No populated objects in output | P1-13 | Verify no objects with `.id` properties in relationship fields |
| Join fields are flattened | P1-13 | `{ docs: [...] }` → plain arrays |
| Consistent shape across ops | P1-13 | Same document returns same shape from create/find/update |

#### T2. Cookie Cache Shape Validation (P1-13)

**New file:** `plugin/tests/cookie-cache-shape.test.ts`

Tests that cookie cache data matches Better Auth's expected types.

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Cookie user has flat IDs | P1-13 | No populated relationship objects in cookie user data |
| Cookie session has flat IDs | P1-13 | No populated relationship objects in cookie session data |
| `prepareSessionData` flattens relationships | P1-13 | `getFieldsToSign` output is flat |
| `applySaveToJwtReturned` suppresses joins | P1-13 | Join fields marked as non-returned |
| Cookie data within size limit | P1-13 | Serialized cookie data < 4KB |
| Refresh token response has flat user | P1-13 | Response body user object has flat IDs |

#### T3. WHERE Clause AND/OR Semantics (P1-1)

**Add to:** `adapter/tests/transform.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Sequential AND | P1-1 | `[{a, AND}, {b, AND}]` → `{ and: [{a}, {b}] }` |
| Sequential OR | P1-1 | `[{a, OR}, {b}]` → `{ or: [{a}, {b}] }` |
| Mixed AND/OR | P1-1 | `[{a}, {b, OR}, {c}]` → correct grouping |
| OR with 3+ conditions | P1-1 | Complex chains of alternating connectors |
| Single condition | P1-1 | No wrapping needed |

#### T4. Relationship ID Conversion in WHERE Clauses (P1-2)

**Add to:** `adapter/tests/transform.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| `userId` string → number | P1-2 | On numeric ID databases |
| `organizationId` string → number | P1-2 | Relationship field conversion |
| Non-relationship field unchanged | P1-2 | Regular fields not converted |
| Array of relationship IDs | P1-2 | `{ in: ["1", "2"] }` → `{ in: [1, 2] }` |

#### T5. Pagination Math (P1-3)

**Add to:** `adapter/tests/adapter.test.ts` or new `adapter/tests/pagination.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Aligned offset | P1-3 | `offset=10, limit=5` → correct slice |
| Unaligned offset | P1-3 | `offset=7, limit=5` → items 8-12 |
| Zero offset | P1-3 | `offset=0, limit=10` → first 10 items |
| Large offset | P1-3 | Offset beyond data returns empty |
| Limit 1 | P1-3 | Single-item pagination |

#### T6. Accounts Collection Override Pattern (P1-4)

**New file:** `plugin/tests/accounts-collection-override.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Custom access preserved | P1-4 | User access controls merged, not replaced |
| Plugin access retained | P1-4 | Plugin access guards survive override |
| Custom fields merged | P1-4 | Both plugin and user fields present |
| Custom hooks merged | P1-4 | Both plugin and user hooks present |

#### T7. Adapter Error Handling (P1-6)

**New file:** `adapter/tests/error-handling.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| `create` throws on error | P1-6 | Should not return `null as R` |
| `findOne` throws on error | P1-6 | Should not silently return null |
| `findMany` throws on error | P1-6 | Should not return `[] as R[]` |
| `update` throws on error | P1-6 | Should not silently swallow |
| `delete` throws on error | P1-6 | Should not silently swallow |
| Error includes model name | P1-6 | Error message identifies the operation and model |

#### T8. Admin Invite Social Sign-Up (P1-8)

**New file:** `plugin/tests/admin-invite-social-signup.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Social sign-up with invite token | P1-8 | Invited role applied for social providers |
| Email sign-up with invite token | P1-8 | Invited role applied (baseline) |
| Sign-up without invite token | P1-8 | Default role assigned |
| After middleware runs for /sign-in/social | P1-8 | Hook not short-circuited |

---

### Priority 2: Important Missing Tests

These tests cover medium-severity issues and improve overall confidence.

#### T9. `transformOutput` Tests

**Add to:** `adapter/tests/transform.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| `normalizeDocumentIds` — primitive ID | P1-13 | String/number converted correctly |
| `normalizeDocumentIds` — object with ID | P1-13 | Extracts flat ID from populated object |
| `normalizeDocumentIds` — array of IDs | P1-13 | Maps array to flat IDs |
| `normalizeData` — role array passthrough | P2-6 | Array role not re-split |
| `normalizeData` — role string split | P2-6 | Comma-separated string → array |
| Date field conversion (no custom name) | P2-8 | ISO string → Date for default field names |
| Date field conversion (custom name) | P2-8 | ISO string → Date for renamed fields |
| Relationship field (no custom name) | P2-8 | ID normalized for default field names |

#### T10. Refresh Token Endpoint (P2-14)

**New file:** `plugin/tests/refresh-token.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| No session token → fallback to Payload refresh | — | Falls back to `refreshOperation` |
| Valid BA session → returns user | — | Returns user data with cookie |
| Multiple Set-Cookie headers | P2-14 | `append` not `set` for cookies |
| Response user has flat IDs | P1-13 | No populated relationship objects |
| Cookie cache data shape | P1-13 | Flat scalar IDs in cookie |

#### T11. Unsupported Plugin Handling (P1-9)

**New file:** `plugin/tests/unsupported-plugins.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Custom plugin passes through | P1-9 | Non-allowlisted plugins not stripped |
| Warning logged for unsupported | P1-9 | Console warning emitted |
| Supported plugins preserved | P1-9 | Known plugins not affected |

#### T12. `convertSort` / `convertSelect` Field Mapping (P2-7)

**Add to:** `adapter/tests/transform.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Sort with renamed field | P2-7 | Uses Payload field name, not schema name |
| Select with renamed field | P2-7 | Uses Payload field name, not schema name |
| Sort/select with default name | P2-7 | Passthrough when names match |

#### T13. Auth Strategy Depth Control

**Add to:** `plugin/tests/better-auth-strategy.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| findByID uses depth 0 | P1-13 | Explicit depth parameter |
| User result has flat IDs | P1-13 | No populated relationships |
| Strategy user has `collection` field | — | Metadata field set |
| Strategy user has `_strategy` field | — | Strategy identifier set |

---

### Priority 3: Nice-to-Have Tests

These tests cover edge cases, performance concerns, and low-severity issues.

#### T14. Transaction Behavior (P1-11)

**New file:** `adapter/tests/transaction.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Transaction callback executed | P1-11 | Callback receives adapter |
| Transaction rollback on error | P1-11 | Changes reverted on failure |
| Nested operations in transaction | P1-11 | Multi-step operation is atomic |

#### T15. Password Hashing Override (P1-10)

**New file:** `plugin/tests/password-hashing.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Custom hash function used | P1-10 | User-provided hash not overwritten |
| Custom verify function used | P1-10 | User-provided verify not overwritten |
| Default hashing works | P1-10 | Plugin defaults apply when no custom |

#### T16. Admin UI Sensitive Field Hiding

**New file:** `plugin/tests/admin-ui-fields.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| 2FA secret hidden | P2-10 | Not used as title, hidden in admin |
| JWKS private key hidden | P2-11 | Hidden and read-only in admin |
| 2FA secret not in useAsTitle | P2-10 | Different field used as title |

#### T17. Collection Override Consistency

**New file:** `plugin/tests/collection-override-patterns.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| Users: plugin overrides specific keys | Arch | Plugin access/hooks win |
| Accounts: plugin overrides specific keys | P1-4 | Plugin access/hooks win (fix) |
| Sessions: consistent pattern | Arch | Same override behavior |
| All builders: custom fields preserved | Arch | User fields not lost |
| All builders: custom hooks preserved | Arch | User hooks not lost |

#### T18. `references.model` Configuration

**New file:** `plugin/tests/references-model.test.ts`

| Test | Audit Ref | Description |
|------|-----------|-------------|
| SSO: userId references user collection | P2-12 | Correct FK target |
| API Key: userId references user collection | P2-12 | Correct FK target |
| OIDC: userId references user collection | P2-12 | Correct FK target |
| Custom slug reflected in references | P2-12 | References updated for custom slugs |

#### T19. Performance — Caching

| Test | Audit Ref | Description |
|------|-----------|-------------|
| `resolvePayloadClient` cached | P3-1 | Only resolved once |
| `isPayloadRelationship` field cache | P3-2 | `flattenAllFields` not called repeatedly |

---

## TDD Roadmap — Priority Order

This is the recommended order for implementing fixes with TDD. Each step: write/verify failing tests → implement fix → verify passing tests.

### Phase 1: Existing Red Tests → Green

These tests already exist. Fix the source code to make them pass.

| # | Issue | Test File | Key Failing Tests |
|---|-------|-----------|-------------------|
| 1 | P1-5 | `set-login-methods.test.ts` | `emailAndPassword: { enabled: false }` detection |
| 2 | #112/#128 | `admin-role-middleware.test.ts` | Array role handling in `adminAfterRoleMiddleware` |
| 3 | P2-9 | `admin-role-middleware.test.ts` | `originalAfter` not awaited |
| 4 | P2-17 | `better-auth-strategy.test.ts` | Banned user check |
| 5 | P1-7 | `before-delete-hook.test.ts` | Passkey/twoFactor cascade delete |
| 6 | #112/#128 | `role-handling.test.ts` | Integration role round-trip |

### Phase 2: Data Shape Boundary (P1-13)

New tests + fixes for the most architecturally significant issue.

| # | Test | Description |
|---|------|-------------|
| 7 | T1 — Adapter data shape | Write tests, then enforce depth 0 / flatten relationships |
| 8 | T2 — Cookie cache shape | Write tests, then fix `prepareSessionData` and refresh endpoint |
| 9 | T9 — `transformOutput` | Write tests for `normalizeDocumentIds`, then fix dual representation |
| 10 | T13 — Strategy depth | Write tests, then add `depth: 0` to `findByID` calls |

### Phase 3: Remaining P1 Fixes

| # | Issue | Test | Description |
|---|-------|------|-------------|
| 11 | P1-1 | T3 — WHERE AND/OR | Fix connector semantics |
| 12 | P1-2 | T4 — Relationship ID WHERE | Add FK ID conversion |
| 13 | P1-3 | T5 — Pagination | Fix offset/limit math |
| 14 | P1-4 | T6 — Accounts override | Fix spread order |
| 15 | P1-6 | T7 — Error handling | Stop swallowing errors |
| 16 | P1-8 | T8 — Social invite | Handle social sign-up path |
| 17 | P1-9 | T11 — Unsupported plugins | Allow custom plugins |

### Phase 4: P2 Hardening

| # | Issue | Test | Description |
|---|-------|------|-------------|
| 18 | P2-7 | T12 — Sort/select mapping | Fix field name mapping |
| 19 | P2-14 | T10 — Refresh token | Fix Set-Cookie append |
| 20 | P1-10 | T15 — Password hashing | Respect custom hash/verify |
| 21 | P1-11 | T14 — Transaction | Implement real transactions |
| 22 | P2-10/11 | T16 — Admin UI | Hide sensitive fields |
| 23 | P2-12 | T18 — References | Fix FK references |

### Phase 5: Architecture & Polish

| # | Test | Description |
|---|------|-------------|
| 24 | T17 — Collection overrides | Standardize all builders |
| 25 | T19 — Performance caching | Add caching where needed |

---

## Conventions

### Test File Naming
- Unit tests: `<feature>.test.ts` in the closest `tests/` directory
- Integration tests: `<feature>.test.ts` in `adapter/tests/` or `plugin/tests/`
- Test files mirror source structure where possible

### Test Structure
```typescript
describe("FeatureName", () => {
  // Setup
  beforeAll(async () => { /* create test data */ });
  afterAll(async () => { /* cleanup */ });

  it("describes expected behavior", async () => {
    // Arrange → Act → Assert
  });

  // Group related tests
  describe("edge case category", () => {
    it("handles specific edge case", () => { ... });
  });
});
```

### TDD Red-Green Pattern
1. **Red:** Write test that describes expected behavior → verify it fails
2. **Green:** Write minimal code to make the test pass
3. **Refactor:** Clean up without changing behavior → verify still passes
4. **Commit:** One commit per red→green cycle with descriptive message

### Mocking Guidelines
- **Unit tests:** Mock all external dependencies (`getPayloadAuth`, `next/headers`, collection helpers)
- **Integration tests:** Use real Payload instance, real DB, real Better Auth API
- **Never mock** the function under test — only its dependencies
- **Prefer spies** over mocks when you need to verify calls but want real behavior
