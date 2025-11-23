import { draftMode, headers as requestHeaders } from 'next/headers'
import { AdminBarClient } from './client'
import { getPayload } from '@/lib/payload'

export interface AdminBarProps {
  path?: string | string[]
}

export async function AdminBar({ path }: AdminBarProps) {
  const payload = await getPayload()
  const headers = await requestHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || user.role?.includes('admin')) {
    return null
  }

  const { isEnabled: isPreviewMode } = await draftMode()

  return <AdminBarClient user={user} userCollectionSlug={user.collection} isPreviewMode={isPreviewMode} />
}
