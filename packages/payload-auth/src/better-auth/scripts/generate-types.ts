import { stripe } from '@better-auth/stripe'
import { emailHarmony, phoneHarmony } from 'better-auth-harmony'
import { getSchema } from 'better-auth/db'
import type { FieldAttribute } from 'better-auth/db'
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  emailOTP,
  genericOAuth,
  jwt,
  magicLink,
  multiSession,
  oneTap,
  oneTimeToken,
  openAPI,
  organization,
  oidcProvider,
  phoneNumber,
  twoFactor,
  username
} from 'better-auth/plugins'
import { passkey } from 'better-auth/plugins/passkey'
import { sso } from 'better-auth/plugins/sso'
import { polar } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import type { SanitizedBetterAuthOptions } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const client = new Polar({
  accessToken: 'pk_test_1234567890',
  server: 'sandbox'
});

const plugins = [
  username(),
  admin(),
  apiKey(),
  passkey(),
  emailHarmony(),
  phoneHarmony(),
  bearer(),
  emailOTP({ sendVerificationOTP: async () => {} }),
  magicLink({ sendMagicLink: async () => {} }),
  phoneNumber({ sendOTP: async () => {} }),
  oneTap(),
  anonymous(),
  multiSession(),
  oneTimeToken(),
  oidcProvider({ loginPage: '' }),
  sso(),
  genericOAuth({ config: [{ providerId: 'typescript', clientId: 'typescript', clientSecret: 'typescript' }] }),
  openAPI(),
  organization({ teams: { enabled: true } }),
  jwt(),
  twoFactor(),
  phoneNumber(),
  stripe({
    stripeClient: { apiKey: 'typescript' },
    stripeWebhookSecret: 'typescript',
    subscription: {
      enabled: true,
      plans: [
        { id: 'basic', name: 'Basic', price: 1000, interval: 'month', currency: 'usd' },
        { id: 'pro', name: 'Pro', price: 2000, interval: 'month', currency: 'usd' },
        { id: 'enterprise', name: 'Enterprise', price: 3000, interval: 'month', currency: 'usd' }
      ]
    }
  }),
  // As of writing this, Polar don't create schema fields, but just in case in the future we leave this here.
  polar({
    client,
    checkout: {
      enabled: true,
      products: [
        { productId: 'basic', slug: 'basic' },
        { productId: 'pro', slug: 'pro' },
        { productId: 'enterprise', slug: 'enterprise' }
      ]
    }
  })
]

const betterAuthConfig: SanitizedBetterAuthOptions = {
  emailAndPassword: { enabled: true },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } } },
  plugins
}

const baseSchema = getSchema({ ...betterAuthConfig, plugins: [] })

type Schema = Record<string, { fields: Record<string, FieldAttribute> }>

const map = (t: string): string => {
  if (t === 'boolean') return 'boolean'
  if (t === 'date') return 'Date'
  if (t === 'number') return 'number'
  if (t === 'string') return 'string'
  if (t === 'number[]') return 'number[]'
  if (t === 'string[]') return 'string[]'
  return 'unknown'
}

const pascal = (s: string): string =>
  s
    .split(/[-_]/g)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')

const diff = (base: Schema, target: Schema): Record<string, Record<string, FieldAttribute>> => {
  const d: Record<string, Record<string, FieldAttribute>> = {}
  for (const [m, { fields }] of Object.entries(target)) {
    const added = Object.entries(fields).filter(([k]) => !(k in (base[m]?.fields ?? {})))
    if (added.length) d[m] = Object.fromEntries(added)
  }
  return d
}

const gen = (): string => {
  let out = '// Auto-generated types. Do not edit.\n\n'

  const pluginAdds: Record<string, Record<string, Record<string, FieldAttribute>>> = {}
  const seen = new Set<string>()

  for (const pl of plugins) {
    const id = (pl as any).id as string | undefined
    if (!id || seen.has(id)) continue
    seen.add(id)
    const adds = diff(baseSchema, getSchema({ ...betterAuthConfig, plugins: [pl] }))
    for (const [m, f] of Object.entries(adds)) {
      pluginAdds[m] ??= {}
      pluginAdds[m][id] = f
    }
  }

  const models = new Set<string>([...Object.keys(baseSchema), ...Object.keys(pluginAdds)])

  for (const model of models) {
    const P = pascal(model)
    const base = baseSchema[model]?.fields ?? {}
    const pluginsForModel = pluginAdds[model] ?? {}
    const pluginIds = Object.keys(pluginsForModel)

    if (Object.keys(base).length) {
      out += `export type Base${P}Fields = {\n`
      for (const [k, f] of Object.entries(base)) out += `  ${f.fieldName ?? k}${f.required ? '' : '?'}: ${map(f.type as string)}\n`
      out += '}\n\n'
    }

    const needPluginMap = pluginIds.length > 1 || Object.keys(base).length
    if (needPluginMap && pluginIds.length) {
      out += `export type ${P}PluginFields = {\n`
      for (const [pid, flds] of Object.entries(pluginsForModel)) {
        out += `  ${JSON.stringify(pid)}: {\n`
        for (const [k, f] of Object.entries(flds)) out += `    ${f.fieldName ?? k}${f.required ? '' : '?'}: ${map(f.type as string)}\n`
        out += '  }\n'
      }
      out += '}\n\n'
    }

    if (!Object.keys(base).length && pluginIds.length === 1) {
      const only = pluginIds[0]
      out += `export type ${P}Fields = {\n`
      for (const [k, f] of Object.entries(pluginsForModel[only]))
        out += `  ${f.fieldName ?? k}${f.required ? '' : '?'}: ${map(f.type as string)}\n`
      out += '}\n\n'
      out += `export type ${P} = ${P}Fields\n\n`
      continue
    }

    const parts: string[] = []
    if (Object.keys(base).length) parts.push(`Base${P}Fields`)
    if (pluginIds.length) {
      const mapName = needPluginMap ? `${P}PluginFields` : undefined
      parts.push(...pluginIds.map((id) => (mapName ? `${mapName}[${JSON.stringify(id)}]` : 'never') /* not reachable */))
    }
    out += `export type ${P} = ${parts.join(' & ')}\n\n`
  }

  return out
}

const generated = gen()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
;(async () => {
  const file = path.resolve(__dirname, '../generated-types.ts')
  await fs.writeFile(file, generated, 'utf8')
  console.log(`Generated types written to ${file}`)
})()
