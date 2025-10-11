import { getWebcryptoSubtle } from '@better-auth/utils'
import { parseCookies } from 'better-auth/cookies'
import { type CookiePrefixOptions } from 'better-auth'

const algorithm = { name: 'HMAC', hash: 'SHA-256' }

const getCookieKey = (key: string, prefix?: CookiePrefixOptions) => {
  let finalKey = key
  if (prefix) {
    if (prefix === 'secure') {
      finalKey = '__Secure-' + key
    } else if (prefix === 'host') {
      finalKey = '__Host-' + key
    } else {
      return undefined
    }
  }
  return finalKey
}

const getCryptoKey = async (secret: string | BufferSource) => {
  const secretBuf = typeof secret === 'string' ? new TextEncoder().encode(secret) : secret
  return await getWebcryptoSubtle().importKey('raw', secretBuf, algorithm, false, ['sign', 'verify'])
}

const verifySignature = async (base64Signature: string, value: string, secret: CryptoKey): Promise<boolean> => {
  try {
    const signatureBinStr = atob(base64Signature)
    const signature = new Uint8Array(signatureBinStr.length)
    for (let i = 0, len = signatureBinStr.length; i < len; i++) {
      signature[i] = signatureBinStr.charCodeAt(i)
    }
    return await getWebcryptoSubtle().verify(algorithm, secret, signature, new TextEncoder().encode(value))
  } catch (e) {
    return false
  }
}

export async function getSignedCookie(cookies: string, key: string, secret: string, prefix?: CookiePrefixOptions) {
  const parsedCookies = cookies ? parseCookies(cookies) : undefined

  const finalKey = getCookieKey(key, prefix)
  if (!finalKey) {
    return null
  }
  const value = parsedCookies?.get(finalKey)
  if (!value) {
    return null
  }
  const signatureStartPos = value.lastIndexOf('.')
  if (signatureStartPos < 1) {
    return null
  }
  const signedValue = value.substring(0, signatureStartPos)
  const signature = value.substring(signatureStartPos + 1)
  if (signature.length !== 44 || !signature.endsWith('=')) {
    return null
  }
  const secretKey = await getCryptoKey(secret)
  const isVerified = await verifySignature(signature, signedValue, secretKey)
  return isVerified ? signedValue : false
}
