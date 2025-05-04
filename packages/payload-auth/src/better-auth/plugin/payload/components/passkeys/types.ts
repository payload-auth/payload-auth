import type { UIFieldServerProps } from 'payload'
import type { BuiltBetterAuthSchema } from '@/better-auth/types'
import type { Passkey } from '@/better-auth/generated-types'

export type PasskeyWithId = Passkey & { id: string; createdAt: Date }

export type PasskeysServerComponentProps = UIFieldServerProps & {
  schema: BuiltBetterAuthSchema
  passkeySlug: string
  passkeyUserIdFieldName: string
}

export type PasskeysClientComponentProps = {
  initialPasskeys: PasskeyWithId[]
  documentId: string | number
  currentUserId: string | number
  passkeySlug: string
  passkeyUserIdFieldName: string
}

