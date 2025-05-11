'use client'

import React, { Fragment, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'

import './index.scss'

type AdminButtonsProps = {
  userSlug: string
  baseURL?: string
  basePath?: string
}

export const AdminButtons: React.FC<AdminButtonsProps> = ({ baseURL, basePath }) => {
  const router = useRouter()
  const { id } = useDocumentInfo()
  const isBanned = useFormFields(([fields]) => fields.banned)

  if (!id) {
    return null
  }

  const authClient = useMemo(
    () =>
      createAuthClient({
        baseURL,
        basePath,
        plugins: [adminClient()]
      }),
    []
  )

  const handleImpersonate = async () => {
    await authClient.admin.impersonateUser({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          router.push('/')
        },
        onError(error: any) {
          console.error('Error impersonating user:', error)
          toast.error('Failed to impersonate user')
        }
      }
    })
  }

  const handleBan = async () => {
    await authClient.admin.banUser({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          toast.success('User banned successfully')
          router.refresh()
        },
        onError(error: any) {
          console.error('Error banning user:', error)
          toast.error('Failed to ban user')
        }
      }
    })
  }

  const handleUnban = async () => {
    await authClient.admin.unbanUser({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          toast.success('User unbanned successfully')
          router.refresh()
        },
        onError(error: any) {
          console.error('Error unbanning user:', error)
          toast.error('Failed to unban user')
        }
      }
    })
  }

  const handleRevokeAllSessions = async () => {
    await authClient.admin.revokeUserSessions({
      userId: String(id),
      fetchOptions: {
        onSuccess() {
          toast.success('All sessions revoked successfully')
          router.refresh()
        },
        onError(error: any) {
          console.error('Error revoking all sessions:', error)
          toast.error('Failed to revoke all sessions')
        }
      }
    })
  }

  return (
    <Fragment>
      <Button onClick={handleImpersonate} buttonStyle="pill" className="impersonate-button" size="medium">
        Impersonate
      </Button>
      <Button onClick={handleRevokeAllSessions} buttonStyle="secondary" className="revoke-sessions-button" size="medium">
        Revoke All Sessions
      </Button>
      {!isBanned ? (
        <Button onClick={handleBan} buttonStyle="error" className="ban-button" size="medium">
          Ban
        </Button>
      ) : null}
      {isBanned ? (
        <Button onClick={handleUnban} buttonStyle="primary" className="unban-button" size="medium">
          Unban
        </Button>
      ) : null}
    </Fragment>
  )
}
