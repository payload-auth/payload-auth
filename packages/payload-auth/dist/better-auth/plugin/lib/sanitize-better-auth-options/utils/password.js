import crypto from "crypto";
/**
 * Mimics Payload's internal password hashing using pbkdf2
 *
 * This generates a hash compatible with Payload's internal auth system
 * so that passwords set via better-auth can be used with Payload admin panel
 */ function pbkdf2Promisified(password, salt) {
    return new Promise((resolve, reject)=>crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (err, hashRaw)=>err ? reject(err) : resolve(hashRaw)));
}
/**
 * Generates random bytes for the salt
 */ function randomBytes() {
    return new Promise((resolve, reject)=>crypto.randomBytes(32, (err, saltBuffer)=>err ? reject(err) : resolve(saltBuffer)));
}
/**
 * Custom implementation of password hashing that matches Payload's format
 *
 * Instead of using better-auth's scrypt, this uses pbkdf2 with the same
 * parameters as Payload CMS
 *
 * @param password The password to hash
 * @returns A string in the format {salt}:{hash}
 */ export const hashPassword = async (password)=>{
    const saltBuffer = await randomBytes();
    const salt = saltBuffer.toString('hex');
    const hashRaw = await pbkdf2Promisified(password, salt);
    const hash = hashRaw.toString('hex');
    return `${salt}:${hash}`;
};
/**
 * Verifies a password against a stored hash
 *
 * This function is flexible and can handle:
 * 1. A combined string in format {salt}:{hash} (for account passwords)
 * 2. When salt and hash need to be combined from user records
 *
 * @param params Object containing the hash and password
 * @returns Boolean indicating if the password matches
 */ export const verifyPassword = async ({ hash, password, salt })=>{
    let saltValue;
    let storedHash;
    // If salt is provided separately (from user record), use it with the hash
    if (salt) {
        saltValue = salt;
        storedHash = hash;
    } else {
        // Otherwise, split the combined format (from account.password)
        const parts = hash.split(':');
        if (parts.length !== 2) {
            return false;
        }
        ;
        [saltValue, storedHash] = parts;
    }
    if (!saltValue || !storedHash) {
        return false;
    }
    const hashRaw = await pbkdf2Promisified(password, saltValue);
    const computedHash = hashRaw.toString('hex');
    return storedHash === computedHash;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL3Nhbml0aXplLWJldHRlci1hdXRoLW9wdGlvbnMvdXRpbHMvcGFzc3dvcmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nXG5cbi8qKlxuICogTWltaWNzIFBheWxvYWQncyBpbnRlcm5hbCBwYXNzd29yZCBoYXNoaW5nIHVzaW5nIHBia2RmMlxuICpcbiAqIFRoaXMgZ2VuZXJhdGVzIGEgaGFzaCBjb21wYXRpYmxlIHdpdGggUGF5bG9hZCdzIGludGVybmFsIGF1dGggc3lzdGVtXG4gKiBzbyB0aGF0IHBhc3N3b3JkcyBzZXQgdmlhIGJldHRlci1hdXRoIGNhbiBiZSB1c2VkIHdpdGggUGF5bG9hZCBhZG1pbiBwYW5lbFxuICovXG5mdW5jdGlvbiBwYmtkZjJQcm9taXNpZmllZChwYXNzd29yZDogc3RyaW5nLCBzYWx0OiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICBjcnlwdG8ucGJrZGYyKHBhc3N3b3JkLCBzYWx0LCAyNTAwMCwgNTEyLCAnc2hhMjU2JywgKGVyciwgaGFzaFJhdykgPT4gKGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZShoYXNoUmF3KSkpXG4gIClcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgcmFuZG9tIGJ5dGVzIGZvciB0aGUgc2FsdFxuICovXG5mdW5jdGlvbiByYW5kb21CeXRlcygpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gY3J5cHRvLnJhbmRvbUJ5dGVzKDMyLCAoZXJyLCBzYWx0QnVmZmVyKSA9PiAoZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHNhbHRCdWZmZXIpKSkpXG59XG5cbi8qKlxuICogQ3VzdG9tIGltcGxlbWVudGF0aW9uIG9mIHBhc3N3b3JkIGhhc2hpbmcgdGhhdCBtYXRjaGVzIFBheWxvYWQncyBmb3JtYXRcbiAqXG4gKiBJbnN0ZWFkIG9mIHVzaW5nIGJldHRlci1hdXRoJ3Mgc2NyeXB0LCB0aGlzIHVzZXMgcGJrZGYyIHdpdGggdGhlIHNhbWVcbiAqIHBhcmFtZXRlcnMgYXMgUGF5bG9hZCBDTVNcbiAqXG4gKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIHRvIGhhc2hcbiAqIEByZXR1cm5zIEEgc3RyaW5nIGluIHRoZSBmb3JtYXQge3NhbHR9OntoYXNofVxuICovXG5leHBvcnQgY29uc3QgaGFzaFBhc3N3b3JkID0gYXN5bmMgKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBzYWx0QnVmZmVyID0gYXdhaXQgcmFuZG9tQnl0ZXMoKVxuICBjb25zdCBzYWx0ID0gc2FsdEJ1ZmZlci50b1N0cmluZygnaGV4JylcblxuICBjb25zdCBoYXNoUmF3ID0gYXdhaXQgcGJrZGYyUHJvbWlzaWZpZWQocGFzc3dvcmQsIHNhbHQpXG4gIGNvbnN0IGhhc2ggPSBoYXNoUmF3LnRvU3RyaW5nKCdoZXgnKVxuXG4gIHJldHVybiBgJHtzYWx0fToke2hhc2h9YFxufVxuXG4vKipcbiAqIFZlcmlmaWVzIGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBmbGV4aWJsZSBhbmQgY2FuIGhhbmRsZTpcbiAqIDEuIEEgY29tYmluZWQgc3RyaW5nIGluIGZvcm1hdCB7c2FsdH06e2hhc2h9IChmb3IgYWNjb3VudCBwYXNzd29yZHMpXG4gKiAyLiBXaGVuIHNhbHQgYW5kIGhhc2ggbmVlZCB0byBiZSBjb21iaW5lZCBmcm9tIHVzZXIgcmVjb3Jkc1xuICpcbiAqIEBwYXJhbSBwYXJhbXMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGhhc2ggYW5kIHBhc3N3b3JkXG4gKiBAcmV0dXJucyBCb29sZWFuIGluZGljYXRpbmcgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGNvbnN0IHZlcmlmeVBhc3N3b3JkID0gYXN5bmMgKHsgaGFzaCwgcGFzc3dvcmQsIHNhbHQgfTogeyBoYXNoOiBzdHJpbmc7IHBhc3N3b3JkOiBzdHJpbmc7IHNhbHQ/OiBzdHJpbmcgfSk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICBsZXQgc2FsdFZhbHVlOiBzdHJpbmdcbiAgbGV0IHN0b3JlZEhhc2g6IHN0cmluZ1xuXG4gIC8vIElmIHNhbHQgaXMgcHJvdmlkZWQgc2VwYXJhdGVseSAoZnJvbSB1c2VyIHJlY29yZCksIHVzZSBpdCB3aXRoIHRoZSBoYXNoXG4gIGlmIChzYWx0KSB7XG4gICAgc2FsdFZhbHVlID0gc2FsdFxuICAgIHN0b3JlZEhhc2ggPSBoYXNoXG4gIH0gZWxzZSB7XG4gICAgLy8gT3RoZXJ3aXNlLCBzcGxpdCB0aGUgY29tYmluZWQgZm9ybWF0IChmcm9tIGFjY291bnQucGFzc3dvcmQpXG4gICAgY29uc3QgcGFydHMgPSBoYXNoLnNwbGl0KCc6JylcbiAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgO1tzYWx0VmFsdWUsIHN0b3JlZEhhc2hdID0gcGFydHMgYXMgW3N0cmluZywgc3RyaW5nXVxuICB9XG5cbiAgaWYgKCFzYWx0VmFsdWUgfHwgIXN0b3JlZEhhc2gpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IGhhc2hSYXcgPSBhd2FpdCBwYmtkZjJQcm9taXNpZmllZChwYXNzd29yZCwgc2FsdFZhbHVlKVxuICBjb25zdCBjb21wdXRlZEhhc2ggPSBoYXNoUmF3LnRvU3RyaW5nKCdoZXgnKVxuXG4gIHJldHVybiBzdG9yZWRIYXNoID09PSBjb21wdXRlZEhhc2hcbn1cbiJdLCJuYW1lcyI6WyJjcnlwdG8iLCJwYmtkZjJQcm9taXNpZmllZCIsInBhc3N3b3JkIiwic2FsdCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicGJrZGYyIiwiZXJyIiwiaGFzaFJhdyIsInJhbmRvbUJ5dGVzIiwic2FsdEJ1ZmZlciIsImhhc2hQYXNzd29yZCIsInRvU3RyaW5nIiwiaGFzaCIsInZlcmlmeVBhc3N3b3JkIiwic2FsdFZhbHVlIiwic3RvcmVkSGFzaCIsInBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJjb21wdXRlZEhhc2giXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLFlBQVksU0FBUTtBQUUzQjs7Ozs7Q0FLQyxHQUNELFNBQVNDLGtCQUFrQkMsUUFBZ0IsRUFBRUMsSUFBWTtJQUN2RCxPQUFPLElBQUlDLFFBQVEsQ0FBQ0MsU0FBU0MsU0FDM0JOLE9BQU9PLE1BQU0sQ0FBQ0wsVUFBVUMsTUFBTSxPQUFPLEtBQUssVUFBVSxDQUFDSyxLQUFLQyxVQUFhRCxNQUFNRixPQUFPRSxPQUFPSCxRQUFRSTtBQUV2RztBQUVBOztDQUVDLEdBQ0QsU0FBU0M7SUFDUCxPQUFPLElBQUlOLFFBQVEsQ0FBQ0MsU0FBU0MsU0FBV04sT0FBT1UsV0FBVyxDQUFDLElBQUksQ0FBQ0YsS0FBS0csYUFBZ0JILE1BQU1GLE9BQU9FLE9BQU9ILFFBQVFNO0FBQ25IO0FBRUE7Ozs7Ozs7O0NBUUMsR0FDRCxPQUFPLE1BQU1DLGVBQWUsT0FBT1Y7SUFDakMsTUFBTVMsYUFBYSxNQUFNRDtJQUN6QixNQUFNUCxPQUFPUSxXQUFXRSxRQUFRLENBQUM7SUFFakMsTUFBTUosVUFBVSxNQUFNUixrQkFBa0JDLFVBQVVDO0lBQ2xELE1BQU1XLE9BQU9MLFFBQVFJLFFBQVEsQ0FBQztJQUU5QixPQUFPLEdBQUdWLEtBQUssQ0FBQyxFQUFFVyxNQUFNO0FBQzFCLEVBQUM7QUFFRDs7Ozs7Ozs7O0NBU0MsR0FDRCxPQUFPLE1BQU1DLGlCQUFpQixPQUFPLEVBQUVELElBQUksRUFBRVosUUFBUSxFQUFFQyxJQUFJLEVBQXFEO0lBQzlHLElBQUlhO0lBQ0osSUFBSUM7SUFFSiwwRUFBMEU7SUFDMUUsSUFBSWQsTUFBTTtRQUNSYSxZQUFZYjtRQUNaYyxhQUFhSDtJQUNmLE9BQU87UUFDTCwrREFBK0Q7UUFDL0QsTUFBTUksUUFBUUosS0FBS0ssS0FBSyxDQUFDO1FBQ3pCLElBQUlELE1BQU1FLE1BQU0sS0FBSyxHQUFHO1lBQ3RCLE9BQU87UUFDVDs7UUFDQyxDQUFDSixXQUFXQyxXQUFXLEdBQUdDO0lBQzdCO0lBRUEsSUFBSSxDQUFDRixhQUFhLENBQUNDLFlBQVk7UUFDN0IsT0FBTztJQUNUO0lBRUEsTUFBTVIsVUFBVSxNQUFNUixrQkFBa0JDLFVBQVVjO0lBQ2xELE1BQU1LLGVBQWVaLFFBQVFJLFFBQVEsQ0FBQztJQUV0QyxPQUFPSSxlQUFlSTtBQUN4QixFQUFDIn0=