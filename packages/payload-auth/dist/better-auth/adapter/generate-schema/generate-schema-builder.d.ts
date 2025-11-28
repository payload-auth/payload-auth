/**
 * This module generates PayloadCMS collection configurations based on the Better Auth schema.
 *
 * The generated collection configs include:
 * - Users: For user management with proper auth configuration
 * - Sessions: For maintaining user sessions
 * - Accounts: For OAuth provider accounts
 * - VerificationTokens: For email verification or social sign in
 *
 * Each collection is properly formatted with:
 * - Appropriate field types (text, relationship, checkbox, etc.)
 * - Admin configuration for better UI experience
 * - Auth configuration for the Users collection
 * - Proper field relationships between collections
 *
 * Users can copy these generated collection configs to their PayloadCMS project
 * and add authentication strategies as needed.
 */
import type { BetterAuthOptions } from 'better-auth';
export declare const generateSchemaBuilderStage: ({ BAOptions, code }: {
    code: string;
    BAOptions: BetterAuthOptions;
}) => Promise<string>;
//# sourceMappingURL=generate-schema-builder.d.ts.map