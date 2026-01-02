import { stripe } from '@better-auth/stripe'
import { emailHarmony, phoneHarmony } from 'better-auth-harmony'
import { getSchema } from 'better-auth/db'
import type { DBFieldAttribute } from 'better-auth/db'
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
  username,
  customSession,
  deviceAuthorization,
  mcp,
  lastLoginMethod
} from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { passkey } from "@better-auth/passkey"
import { scim } from "@better-auth/scim";
import { sso } from '@better-auth/sso'
import { polar, checkout } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import type { SanitizedBetterAuthOptions } from '../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as defaultOrganizationStatements } from "better-auth/plugins/organization/access";
import { defaultStatements as defaultAdminStatements } from "better-auth/plugins/admin/access";




const ac = createAccessControl({
  ...defaultOrganizationStatements,
  ...defaultAdminStatements,
});

const client = new Polar({
  accessToken: 'pk_test_1234567890',
  server: 'sandbox'
})

const plugins = [
  username(),
  admin(),
  apiKey(),
  passkey(),
  emailHarmony(),
  phoneHarmony(),
  bearer(),
  emailOTP({ sendVerificationOTP: async () => { } }),
  magicLink({ sendMagicLink: async () => { } }),
  phoneNumber({ sendOTP: async () => { } }),
  oneTap(),
  anonymous(),
  multiSession(),
  oneTimeToken(),
  oidcProvider({ loginPage: '' }),
  sso(),
  genericOAuth({ config: [{ providerId: 'typescript', clientId: 'typescript', clientSecret: 'typescript' }] }),
  openAPI(),
  organization({
    teams: { enabled: true },
    ac,
    dynamicAccessControl: {
      enabled: true,
    },
  }),
  jwt(),
  twoFactor(),
  phoneNumber(),
  nextCookies(),
  customSession(async () => ({})),
  scim(),
  mcp({ loginPage: '' }),
  deviceAuthorization(),
  lastLoginMethod({ storeInDatabase: true }),
  stripe({
    stripeClient: new Stripe('typescript'),
    stripeWebhookSecret: 'typescript',
    subscription: {
      enabled: true,
      plans: [
        {
          name: 'Basic',
          priceId: 'basic'
        },
        {
          name: 'Pro',
          priceId: 'pro'
        },
        {
          name: 'Enterprise',
          priceId: 'enterprise'
        }
      ]
    }
  }),
  // As of writing this, Polar don't create schema fields, but just in case in the future we leave this here.
  polar({
    client,
    use: [
      checkout({
        products: [
          {
            productId: '123-456-789', // ID of Product from Polar Dashboard
            slug: 'pro' // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
          }
        ],
        successUrl: '/success?checkout_id={CHECKOUT_ID}',
        authenticatedUsersOnly: true
      })
    ]
  })
]

const betterAuthConfig: SanitizedBetterAuthOptions = {
  emailAndPassword: { enabled: true },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } } },
  plugins
}

const baseSchema = getSchema({ ...betterAuthConfig, plugins: [] })

type Schema = Record<string, { fields: Record<string, DBFieldAttribute> }>

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

const diff = (base: Schema, target: Schema): Record<string, Record<string, DBFieldAttribute>> => {
  const d: Record<string, Record<string, DBFieldAttribute>> = {}
  for (const [m, { fields }] of Object.entries(target)) {
    const added = Object.entries(fields).filter(([k]) => !(k in (base[m]?.fields ?? {})))
    if (added.length) d[m] = Object.fromEntries(added)
  }
  return d
}

const gen = (): string => {
  let out = '// Auto-generated types. Do not edit.\n\n'

  const pluginAdds: Record<string, Record<string, Record<string, DBFieldAttribute>>> = {}
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

  // Generate union type of plugin identifiers
  const pluginIdUnion = [...seen].map((id) => JSON.stringify(id)).join(' | ')
  out += `export type PluginId = ${pluginIdUnion}\n\n`

  // Generate full schema mapping
  out += `export type BetterAuthFullSchema = {\n`
  for (const model of models) {
    const P = pascal(model)
    out += `  ${JSON.stringify(model)}: ${P}\n`
  }
  out += `}\n\n`

  // Generate union type of all model names
  out += `export type ModelKey = keyof BetterAuthFullSchema`

  return out
}

const generated = gen()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
  ; (async () => {
    const file = path.resolve(__dirname, '../generated-types.ts')
    await fs.writeFile(file, generated, 'utf8')
    console.log(`Generated types written to ${file}`)
  })()
