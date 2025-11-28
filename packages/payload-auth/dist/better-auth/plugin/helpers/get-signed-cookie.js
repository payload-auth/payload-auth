import { getWebcryptoSubtle } from "@better-auth/utils";
import { parseCookies } from "better-auth/cookies";
const algorithm = {
    name: 'HMAC',
    hash: 'SHA-256'
};
const getCookieKey = (key, prefix)=>{
    let finalKey = key;
    if (prefix) {
        if (prefix === 'secure') {
            finalKey = '__Secure-' + key;
        } else if (prefix === 'host') {
            finalKey = '__Host-' + key;
        } else {
            return undefined;
        }
    }
    return finalKey;
};
const getCryptoKey = async (secret)=>{
    const secretBuf = typeof secret === 'string' ? new TextEncoder().encode(secret) : secret;
    return await getWebcryptoSubtle().importKey('raw', secretBuf, algorithm, false, [
        'sign',
        'verify'
    ]);
};
const verifySignature = async (base64Signature, value, secret)=>{
    try {
        const signatureBinStr = atob(base64Signature);
        const signature = new Uint8Array(signatureBinStr.length);
        for(let i = 0, len = signatureBinStr.length; i < len; i++){
            signature[i] = signatureBinStr.charCodeAt(i);
        }
        return await getWebcryptoSubtle().verify(algorithm, secret, signature, new TextEncoder().encode(value));
    } catch (e) {
        return false;
    }
};
export async function getSignedCookie(cookies, key, secret, prefix) {
    const parsedCookies = cookies ? parseCookies(cookies) : undefined;
    const finalKey = getCookieKey(key, prefix);
    if (!finalKey) {
        return null;
    }
    const value = parsedCookies?.get(finalKey);
    if (!value) {
        return null;
    }
    const signatureStartPos = value.lastIndexOf('.');
    if (signatureStartPos < 1) {
        return null;
    }
    const signedValue = value.substring(0, signatureStartPos);
    const signature = value.substring(signatureStartPos + 1);
    if (signature.length !== 44 || !signature.endsWith('=')) {
        return null;
    }
    const secretKey = await getCryptoKey(secret);
    const isVerified = await verifySignature(signature, signedValue, secretKey);
    return isVerified ? signedValue : false;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtc2lnbmVkLWNvb2tpZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRXZWJjcnlwdG9TdWJ0bGUgfSBmcm9tICdAYmV0dGVyLWF1dGgvdXRpbHMnXG5pbXBvcnQgeyBwYXJzZUNvb2tpZXMgfSBmcm9tICdiZXR0ZXItYXV0aC9jb29raWVzJ1xuaW1wb3J0IHsgdHlwZSBDb29raWVQcmVmaXhPcHRpb25zIH0gZnJvbSAnYmV0dGVyLWF1dGgnXG5cbmNvbnN0IGFsZ29yaXRobSA9IHsgbmFtZTogJ0hNQUMnLCBoYXNoOiAnU0hBLTI1NicgfVxuXG5jb25zdCBnZXRDb29raWVLZXkgPSAoa2V5OiBzdHJpbmcsIHByZWZpeD86IENvb2tpZVByZWZpeE9wdGlvbnMpID0+IHtcbiAgbGV0IGZpbmFsS2V5ID0ga2V5XG4gIGlmIChwcmVmaXgpIHtcbiAgICBpZiAocHJlZml4ID09PSAnc2VjdXJlJykge1xuICAgICAgZmluYWxLZXkgPSAnX19TZWN1cmUtJyArIGtleVxuICAgIH0gZWxzZSBpZiAocHJlZml4ID09PSAnaG9zdCcpIHtcbiAgICAgIGZpbmFsS2V5ID0gJ19fSG9zdC0nICsga2V5XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbmFsS2V5XG59XG5cbmNvbnN0IGdldENyeXB0b0tleSA9IGFzeW5jIChzZWNyZXQ6IHN0cmluZyB8IEJ1ZmZlclNvdXJjZSkgPT4ge1xuICBjb25zdCBzZWNyZXRCdWYgPSB0eXBlb2Ygc2VjcmV0ID09PSAnc3RyaW5nJyA/IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZWNyZXQpIDogc2VjcmV0XG4gIHJldHVybiBhd2FpdCBnZXRXZWJjcnlwdG9TdWJ0bGUoKS5pbXBvcnRLZXkoJ3JhdycsIHNlY3JldEJ1ZiwgYWxnb3JpdGhtLCBmYWxzZSwgWydzaWduJywgJ3ZlcmlmeSddKVxufVxuXG5jb25zdCB2ZXJpZnlTaWduYXR1cmUgPSBhc3luYyAoYmFzZTY0U2lnbmF0dXJlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNlY3JldDogQ3J5cHRvS2V5KTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2lnbmF0dXJlQmluU3RyID0gYXRvYihiYXNlNjRTaWduYXR1cmUpXG4gICAgY29uc3Qgc2lnbmF0dXJlID0gbmV3IFVpbnQ4QXJyYXkoc2lnbmF0dXJlQmluU3RyLmxlbmd0aClcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2lnbmF0dXJlQmluU3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBzaWduYXR1cmVbaV0gPSBzaWduYXR1cmVCaW5TdHIuY2hhckNvZGVBdChpKVxuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgZ2V0V2ViY3J5cHRvU3VidGxlKCkudmVyaWZ5KGFsZ29yaXRobSwgc2VjcmV0LCBzaWduYXR1cmUsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh2YWx1ZSkpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2lnbmVkQ29va2llKGNvb2tpZXM6IHN0cmluZywga2V5OiBzdHJpbmcsIHNlY3JldDogc3RyaW5nLCBwcmVmaXg/OiBDb29raWVQcmVmaXhPcHRpb25zKSB7XG4gIGNvbnN0IHBhcnNlZENvb2tpZXMgPSBjb29raWVzID8gcGFyc2VDb29raWVzKGNvb2tpZXMpIDogdW5kZWZpbmVkXG5cbiAgY29uc3QgZmluYWxLZXkgPSBnZXRDb29raWVLZXkoa2V5LCBwcmVmaXgpXG4gIGlmICghZmluYWxLZXkpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IHZhbHVlID0gcGFyc2VkQ29va2llcz8uZ2V0KGZpbmFsS2V5KVxuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBjb25zdCBzaWduYXR1cmVTdGFydFBvcyA9IHZhbHVlLmxhc3RJbmRleE9mKCcuJylcbiAgaWYgKHNpZ25hdHVyZVN0YXJ0UG9zIDwgMSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgY29uc3Qgc2lnbmVkVmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgc2lnbmF0dXJlU3RhcnRQb3MpXG4gIGNvbnN0IHNpZ25hdHVyZSA9IHZhbHVlLnN1YnN0cmluZyhzaWduYXR1cmVTdGFydFBvcyArIDEpXG4gIGlmIChzaWduYXR1cmUubGVuZ3RoICE9PSA0NCB8fCAhc2lnbmF0dXJlLmVuZHNXaXRoKCc9JykpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IHNlY3JldEtleSA9IGF3YWl0IGdldENyeXB0b0tleShzZWNyZXQpXG4gIGNvbnN0IGlzVmVyaWZpZWQgPSBhd2FpdCB2ZXJpZnlTaWduYXR1cmUoc2lnbmF0dXJlLCBzaWduZWRWYWx1ZSwgc2VjcmV0S2V5KVxuICByZXR1cm4gaXNWZXJpZmllZCA/IHNpZ25lZFZhbHVlIDogZmFsc2Vcbn1cbiJdLCJuYW1lcyI6WyJnZXRXZWJjcnlwdG9TdWJ0bGUiLCJwYXJzZUNvb2tpZXMiLCJhbGdvcml0aG0iLCJuYW1lIiwiaGFzaCIsImdldENvb2tpZUtleSIsImtleSIsInByZWZpeCIsImZpbmFsS2V5IiwidW5kZWZpbmVkIiwiZ2V0Q3J5cHRvS2V5Iiwic2VjcmV0Iiwic2VjcmV0QnVmIiwiVGV4dEVuY29kZXIiLCJlbmNvZGUiLCJpbXBvcnRLZXkiLCJ2ZXJpZnlTaWduYXR1cmUiLCJiYXNlNjRTaWduYXR1cmUiLCJ2YWx1ZSIsInNpZ25hdHVyZUJpblN0ciIsImF0b2IiLCJzaWduYXR1cmUiLCJVaW50OEFycmF5IiwibGVuZ3RoIiwiaSIsImxlbiIsImNoYXJDb2RlQXQiLCJ2ZXJpZnkiLCJlIiwiZ2V0U2lnbmVkQ29va2llIiwiY29va2llcyIsInBhcnNlZENvb2tpZXMiLCJnZXQiLCJzaWduYXR1cmVTdGFydFBvcyIsImxhc3RJbmRleE9mIiwic2lnbmVkVmFsdWUiLCJzdWJzdHJpbmciLCJlbmRzV2l0aCIsInNlY3JldEtleSIsImlzVmVyaWZpZWQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLGtCQUFrQixRQUFRLHFCQUFvQjtBQUN2RCxTQUFTQyxZQUFZLFFBQVEsc0JBQXFCO0FBR2xELE1BQU1DLFlBQVk7SUFBRUMsTUFBTTtJQUFRQyxNQUFNO0FBQVU7QUFFbEQsTUFBTUMsZUFBZSxDQUFDQyxLQUFhQztJQUNqQyxJQUFJQyxXQUFXRjtJQUNmLElBQUlDLFFBQVE7UUFDVixJQUFJQSxXQUFXLFVBQVU7WUFDdkJDLFdBQVcsY0FBY0Y7UUFDM0IsT0FBTyxJQUFJQyxXQUFXLFFBQVE7WUFDNUJDLFdBQVcsWUFBWUY7UUFDekIsT0FBTztZQUNMLE9BQU9HO1FBQ1Q7SUFDRjtJQUNBLE9BQU9EO0FBQ1Q7QUFFQSxNQUFNRSxlQUFlLE9BQU9DO0lBQzFCLE1BQU1DLFlBQVksT0FBT0QsV0FBVyxXQUFXLElBQUlFLGNBQWNDLE1BQU0sQ0FBQ0gsVUFBVUE7SUFDbEYsT0FBTyxNQUFNWCxxQkFBcUJlLFNBQVMsQ0FBQyxPQUFPSCxXQUFXVixXQUFXLE9BQU87UUFBQztRQUFRO0tBQVM7QUFDcEc7QUFFQSxNQUFNYyxrQkFBa0IsT0FBT0MsaUJBQXlCQyxPQUFlUDtJQUNyRSxJQUFJO1FBQ0YsTUFBTVEsa0JBQWtCQyxLQUFLSDtRQUM3QixNQUFNSSxZQUFZLElBQUlDLFdBQVdILGdCQUFnQkksTUFBTTtRQUN2RCxJQUFLLElBQUlDLElBQUksR0FBR0MsTUFBTU4sZ0JBQWdCSSxNQUFNLEVBQUVDLElBQUlDLEtBQUtELElBQUs7WUFDMURILFNBQVMsQ0FBQ0csRUFBRSxHQUFHTCxnQkFBZ0JPLFVBQVUsQ0FBQ0Y7UUFDNUM7UUFDQSxPQUFPLE1BQU14QixxQkFBcUIyQixNQUFNLENBQUN6QixXQUFXUyxRQUFRVSxXQUFXLElBQUlSLGNBQWNDLE1BQU0sQ0FBQ0k7SUFDbEcsRUFBRSxPQUFPVSxHQUFHO1FBQ1YsT0FBTztJQUNUO0FBQ0Y7QUFFQSxPQUFPLGVBQWVDLGdCQUFnQkMsT0FBZSxFQUFFeEIsR0FBVyxFQUFFSyxNQUFjLEVBQUVKLE1BQTRCO0lBQzlHLE1BQU13QixnQkFBZ0JELFVBQVU3QixhQUFhNkIsV0FBV3JCO0lBRXhELE1BQU1ELFdBQVdILGFBQWFDLEtBQUtDO0lBQ25DLElBQUksQ0FBQ0MsVUFBVTtRQUNiLE9BQU87SUFDVDtJQUNBLE1BQU1VLFFBQVFhLGVBQWVDLElBQUl4QjtJQUNqQyxJQUFJLENBQUNVLE9BQU87UUFDVixPQUFPO0lBQ1Q7SUFDQSxNQUFNZSxvQkFBb0JmLE1BQU1nQixXQUFXLENBQUM7SUFDNUMsSUFBSUQsb0JBQW9CLEdBQUc7UUFDekIsT0FBTztJQUNUO0lBQ0EsTUFBTUUsY0FBY2pCLE1BQU1rQixTQUFTLENBQUMsR0FBR0g7SUFDdkMsTUFBTVosWUFBWUgsTUFBTWtCLFNBQVMsQ0FBQ0gsb0JBQW9CO0lBQ3RELElBQUlaLFVBQVVFLE1BQU0sS0FBSyxNQUFNLENBQUNGLFVBQVVnQixRQUFRLENBQUMsTUFBTTtRQUN2RCxPQUFPO0lBQ1Q7SUFDQSxNQUFNQyxZQUFZLE1BQU01QixhQUFhQztJQUNyQyxNQUFNNEIsYUFBYSxNQUFNdkIsZ0JBQWdCSyxXQUFXYyxhQUFhRztJQUNqRSxPQUFPQyxhQUFhSixjQUFjO0FBQ3BDIn0=