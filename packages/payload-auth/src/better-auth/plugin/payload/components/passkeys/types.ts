import type { UIFieldServerProps } from 'payload'
import type { BuildSchema } from '@/better-auth/types'
import type { Passkey } from '@/better-auth/generated-types'

export type PasskeyWithId = Passkey & { id: string; createdAt: Date }

export type PasskeysServerComponentProps = UIFieldServerProps & {
  schema: BuildSchema
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

