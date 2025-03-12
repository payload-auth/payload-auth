import type { BasePayload } from 'payload'
import type {
  BetterAuthOptions,
  BetterAuthPlugin,
  InferAPI,
  InferPluginTypes,
  UnionToIntersection,
} from 'better-auth'
import { betterAuth as betterAuthBase } from 'better-auth'
import { payloadAdapter } from '@payload-better-auth/adapter'

export type ExtractEndpointsFromPlugins<T extends BetterAuthPlugin[] | undefined> =
  T extends BetterAuthPlugin[]
    ? UnionToIntersection<Extract<T[number], { endpoints: any }>['endpoints']>
    : {}

export type ExtractEndpoints<T> = T extends BetterAuthPlugin
  ? T extends { endpoints?: infer E }
    ? E
    : {}
  : {}

export type BetterAuthReturn<TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[]> = Omit<
  ReturnType<typeof betterAuthBase>,
  '$Infer'
> & {
  api: TPlugins extends (infer P)[] ? InferAPI<UnionToIntersection<ExtractEndpoints<P>>> : {}
  $Infer: ReturnType<typeof betterAuthBase>['$Infer'] & {
    [K in keyof InferPluginTypes<{
      plugins: TPlugins extends BetterAuthPlugin[] ? TPlugins : []
    }>]: InferPluginTypes<{ plugins: TPlugins extends BetterAuthPlugin[] ? TPlugins : [] }>[K]
  }
}

export const betterAuth = <TPlugins extends BetterAuthPlugin[] = BetterAuthPlugin[]>({
  payload,
  options,
}: {
  payload: BasePayload
  options: Omit<BetterAuthOptions, 'database' | 'plugins'> & {
    enable_debug_logs?: boolean
    plugins: TPlugins
  }
}): BetterAuthReturn<TPlugins> => {
  const auth = betterAuthBase({
    ...options,
    database: payloadAdapter(payload, {
      enable_debug_logs: options.enable_debug_logs,
    }),
  })

  return auth as unknown as BetterAuthReturn<TPlugins>
}