/**
 * Generates a verification URL for email verification
 *
 * This utility function creates a JWT token containing the user's email and
 * expiration information, signs it with the provided secret, and constructs
 * a verification URL with the token as a query parameter.
 *
 * @param userEmail - The email address of the user to verify
 * @param secret - The secret used to sign the JWT
 * @param expiresIn - Duration in seconds for token expiration (default: 3600)
 * @param verifyRouteUrl - The base URL for the verification endpoint
 * @param callbackURL - Optional callback URL after verification (default: "/")
 * @returns The complete verification URL with token
 *
 * @example
 * const url = await generateVerifyEmailUrl({
 *   userEmail: 'user@example.com',
 *   secret: 'your-secret-key',
 *   verifyRouteUrl: 'https://your-app.com/api/auth/verify-email',
 *   callbackURL: '/profile'
 * });
 */
export declare const generateVerifyEmailUrl: ({ userEmail, secret, expiresIn, verifyRouteUrl, callbackURL }: {
    userEmail: string;
    secret: string;
    expiresIn?: number;
    verifyRouteUrl: string;
    callbackURL?: string;
}) => Promise<string>;
//# sourceMappingURL=generate-verify-email-url.d.ts.map