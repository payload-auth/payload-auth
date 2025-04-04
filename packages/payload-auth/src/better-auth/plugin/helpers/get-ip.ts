import type { BetterAuthOptions } from 'better-auth'

export function getIp(headers: Headers, options: BetterAuthOptions): string | null {
  if (options.advanced?.ipAddress?.disableIpTracking) {
    return null
  }
  const testIP = '127.0.0.1'
  if ((process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') ?? false) {
    return testIP
  }
  const ipHeaders = options.advanced?.ipAddress?.ipAddressHeaders
  const keys = ipHeaders || [
    'x-client-ip',
    'x-forwarded-for',
    'cf-connecting-ip',
    'fastly-client-ip',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ]
  for (const key of keys) {
    const value = headers.get(key)
    if (typeof value === 'string') {
      const ip = value.split(',')[0].trim()
      if (ip) return ip
    }
  }
  return null
}
