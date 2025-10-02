import { SignJWT } from "jose";
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
 */ export const generateVerifyEmailUrl = async ({ userEmail, secret, expiresIn = 3600, verifyRouteUrl, callbackURL = '/' })=>{
    if (!userEmail) {
        throw new Error('userEmail is required to generate a verification URL');
    }
    if (!secret) {
        throw new Error('secret is required to sign the JWT token');
    }
    if (!verifyRouteUrl) {
        throw new Error('verifyRouteUrl is required to generate a verification URL');
    }
    // Create and sign the JWT token
    const jwt = await new SignJWT({
        email: userEmail,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
    }).setProtectedHeader({
        alg: 'HS256'
    }).sign(new TextEncoder().encode(secret));
    // Build the verification URL
    const verifyUrl = `${verifyRouteUrl}?token=${jwt}${callbackURL ? `&callbackURL=${encodeURIComponent(callbackURL)}` : ''}`;
    return verifyUrl;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZW5lcmF0ZS12ZXJpZnktZW1haWwtdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNpZ25KV1QgfSBmcm9tICdqb3NlJ1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHZlcmlmaWNhdGlvbiBVUkwgZm9yIGVtYWlsIHZlcmlmaWNhdGlvblxuICpcbiAqIFRoaXMgdXRpbGl0eSBmdW5jdGlvbiBjcmVhdGVzIGEgSldUIHRva2VuIGNvbnRhaW5pbmcgdGhlIHVzZXIncyBlbWFpbCBhbmRcbiAqIGV4cGlyYXRpb24gaW5mb3JtYXRpb24sIHNpZ25zIGl0IHdpdGggdGhlIHByb3ZpZGVkIHNlY3JldCwgYW5kIGNvbnN0cnVjdHNcbiAqIGEgdmVyaWZpY2F0aW9uIFVSTCB3aXRoIHRoZSB0b2tlbiBhcyBhIHF1ZXJ5IHBhcmFtZXRlci5cbiAqXG4gKiBAcGFyYW0gdXNlckVtYWlsIC0gVGhlIGVtYWlsIGFkZHJlc3Mgb2YgdGhlIHVzZXIgdG8gdmVyaWZ5XG4gKiBAcGFyYW0gc2VjcmV0IC0gVGhlIHNlY3JldCB1c2VkIHRvIHNpZ24gdGhlIEpXVFxuICogQHBhcmFtIGV4cGlyZXNJbiAtIER1cmF0aW9uIGluIHNlY29uZHMgZm9yIHRva2VuIGV4cGlyYXRpb24gKGRlZmF1bHQ6IDM2MDApXG4gKiBAcGFyYW0gdmVyaWZ5Um91dGVVcmwgLSBUaGUgYmFzZSBVUkwgZm9yIHRoZSB2ZXJpZmljYXRpb24gZW5kcG9pbnRcbiAqIEBwYXJhbSBjYWxsYmFja1VSTCAtIE9wdGlvbmFsIGNhbGxiYWNrIFVSTCBhZnRlciB2ZXJpZmljYXRpb24gKGRlZmF1bHQ6IFwiL1wiKVxuICogQHJldHVybnMgVGhlIGNvbXBsZXRlIHZlcmlmaWNhdGlvbiBVUkwgd2l0aCB0b2tlblxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCB1cmwgPSBhd2FpdCBnZW5lcmF0ZVZlcmlmeUVtYWlsVXJsKHtcbiAqICAgdXNlckVtYWlsOiAndXNlckBleGFtcGxlLmNvbScsXG4gKiAgIHNlY3JldDogJ3lvdXItc2VjcmV0LWtleScsXG4gKiAgIHZlcmlmeVJvdXRlVXJsOiAnaHR0cHM6Ly95b3VyLWFwcC5jb20vYXBpL2F1dGgvdmVyaWZ5LWVtYWlsJyxcbiAqICAgY2FsbGJhY2tVUkw6ICcvcHJvZmlsZSdcbiAqIH0pO1xuICovXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVWZXJpZnlFbWFpbFVybCA9IGFzeW5jICh7XG4gIHVzZXJFbWFpbCxcbiAgc2VjcmV0LFxuICBleHBpcmVzSW4gPSAzNjAwLFxuICB2ZXJpZnlSb3V0ZVVybCxcbiAgY2FsbGJhY2tVUkwgPSAnLydcbn06IHtcbiAgdXNlckVtYWlsOiBzdHJpbmdcbiAgc2VjcmV0OiBzdHJpbmdcbiAgZXhwaXJlc0luPzogbnVtYmVyXG4gIHZlcmlmeVJvdXRlVXJsOiBzdHJpbmdcbiAgY2FsbGJhY2tVUkw/OiBzdHJpbmdcbn0pOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBpZiAoIXVzZXJFbWFpbCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlckVtYWlsIGlzIHJlcXVpcmVkIHRvIGdlbmVyYXRlIGEgdmVyaWZpY2F0aW9uIFVSTCcpXG4gIH1cblxuICBpZiAoIXNlY3JldCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VjcmV0IGlzIHJlcXVpcmVkIHRvIHNpZ24gdGhlIEpXVCB0b2tlbicpXG4gIH1cblxuICBpZiAoIXZlcmlmeVJvdXRlVXJsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd2ZXJpZnlSb3V0ZVVybCBpcyByZXF1aXJlZCB0byBnZW5lcmF0ZSBhIHZlcmlmaWNhdGlvbiBVUkwnKVxuICB9XG5cbiAgLy8gQ3JlYXRlIGFuZCBzaWduIHRoZSBKV1QgdG9rZW5cbiAgY29uc3Qgand0ID0gYXdhaXQgbmV3IFNpZ25KV1Qoe1xuICAgIGVtYWlsOiB1c2VyRW1haWwsXG4gICAgaWF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICBleHA6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgZXhwaXJlc0luXG4gIH0pXG4gICAgLnNldFByb3RlY3RlZEhlYWRlcih7IGFsZzogJ0hTMjU2JyB9KVxuICAgIC5zaWduKG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZWNyZXQpKVxuXG4gIC8vIEJ1aWxkIHRoZSB2ZXJpZmljYXRpb24gVVJMXG4gIGNvbnN0IHZlcmlmeVVybCA9IGAke3ZlcmlmeVJvdXRlVXJsfT90b2tlbj0ke2p3dH0ke2NhbGxiYWNrVVJMID8gYCZjYWxsYmFja1VSTD0ke2VuY29kZVVSSUNvbXBvbmVudChjYWxsYmFja1VSTCl9YCA6ICcnfWBcblxuICByZXR1cm4gdmVyaWZ5VXJsXG59XG4iXSwibmFtZXMiOlsiU2lnbkpXVCIsImdlbmVyYXRlVmVyaWZ5RW1haWxVcmwiLCJ1c2VyRW1haWwiLCJzZWNyZXQiLCJleHBpcmVzSW4iLCJ2ZXJpZnlSb3V0ZVVybCIsImNhbGxiYWNrVVJMIiwiRXJyb3IiLCJqd3QiLCJlbWFpbCIsImlhdCIsIk1hdGgiLCJmbG9vciIsIkRhdGUiLCJub3ciLCJleHAiLCJzZXRQcm90ZWN0ZWRIZWFkZXIiLCJhbGciLCJzaWduIiwiVGV4dEVuY29kZXIiLCJlbmNvZGUiLCJ2ZXJpZnlVcmwiLCJlbmNvZGVVUklDb21wb25lbnQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLE9BQU8sUUFBUSxPQUFNO0FBRTlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQkMsR0FDRCxPQUFPLE1BQU1DLHlCQUF5QixPQUFPLEVBQzNDQyxTQUFTLEVBQ1RDLE1BQU0sRUFDTkMsWUFBWSxJQUFJLEVBQ2hCQyxjQUFjLEVBQ2RDLGNBQWMsR0FBRyxFQU9sQjtJQUNDLElBQUksQ0FBQ0osV0FBVztRQUNkLE1BQU0sSUFBSUssTUFBTTtJQUNsQjtJQUVBLElBQUksQ0FBQ0osUUFBUTtRQUNYLE1BQU0sSUFBSUksTUFBTTtJQUNsQjtJQUVBLElBQUksQ0FBQ0YsZ0JBQWdCO1FBQ25CLE1BQU0sSUFBSUUsTUFBTTtJQUNsQjtJQUVBLGdDQUFnQztJQUNoQyxNQUFNQyxNQUFNLE1BQU0sSUFBSVIsUUFBUTtRQUM1QlMsT0FBT1A7UUFDUFEsS0FBS0MsS0FBS0MsS0FBSyxDQUFDQyxLQUFLQyxHQUFHLEtBQUs7UUFDN0JDLEtBQUtKLEtBQUtDLEtBQUssQ0FBQ0MsS0FBS0MsR0FBRyxLQUFLLFFBQVFWO0lBQ3ZDLEdBQ0dZLGtCQUFrQixDQUFDO1FBQUVDLEtBQUs7SUFBUSxHQUNsQ0MsSUFBSSxDQUFDLElBQUlDLGNBQWNDLE1BQU0sQ0FBQ2pCO0lBRWpDLDZCQUE2QjtJQUM3QixNQUFNa0IsWUFBWSxHQUFHaEIsZUFBZSxPQUFPLEVBQUVHLE1BQU1GLGNBQWMsQ0FBQyxhQUFhLEVBQUVnQixtQkFBbUJoQixjQUFjLEdBQUcsSUFBSTtJQUV6SCxPQUFPZTtBQUNULEVBQUMifQ==