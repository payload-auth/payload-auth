/**
 * Custom implementation of password hashing that matches Payload's format
 *
 * Instead of using better-auth's scrypt, this uses pbkdf2 with the same
 * parameters as Payload CMS
 *
 * @param password The password to hash
 * @returns A string in the format {salt}:{hash}
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Verifies a password against a stored hash
 *
 * This function is flexible and can handle:
 * 1. A combined string in format {salt}:{hash} (for account passwords)
 * 2. When salt and hash need to be combined from user records
 *
 * @param params Object containing the hash and password
 * @returns Boolean indicating if the password matches
 */
export declare const verifyPassword: ({ hash, password, salt }: {
    hash: string;
    password: string;
    salt?: string;
}) => Promise<boolean>;
//# sourceMappingURL=password.d.ts.map