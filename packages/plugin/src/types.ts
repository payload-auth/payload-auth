import { BetterAuthReturn } from './lib/better-auth.js'
import type { Plugins } from './index.js'

declare module 'payload' {
  export interface BasePayload {
    betterAuth: BetterAuthReturn<Plugins>
  }
}
