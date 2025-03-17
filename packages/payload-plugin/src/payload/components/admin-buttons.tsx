'use client'

import React, { useEffect, useState } from 'react'
import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import './styles.css'

import '@payloadcms/ui/styles.css'

function getIdFromUrl(path: string, userSlug: string) {
  const urlParts = path.split('/')

  // Find the part after the userSlug in the URL
  const userSlugIndex = urlParts.findIndex((part) => part === userSlug)
  if (userSlugIndex !== -1 && userSlugIndex < urlParts.length - 1) {
    return urlParts[userSlugIndex + 1]
  }
  const potentialIdFromUrl = urlParts[urlParts.length - 1]
  return potentialIdFromUrl
}

async function getDocumentData(id: string, path: string) {
  const apiUrl = `${path}/api`
  try {
    // Try to load the /api page and parse the HTML response
    const response = await fetch(apiUrl)
    if (response.ok) {
      const htmlResponse = await response.text()
      // Parse the HTML to extract user data
      try {
        let documentData: any = null
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlResponse, 'text/html')

        // Look for the JSON data in the query inspector
        const jsonRows = doc.querySelectorAll('.query-inspector__row-line')
        if (jsonRows.length > 0) {
          documentData = {}

          jsonRows.forEach((row) => {
            const keyMatch = row.innerHTML.match(/"([^"]+)"\s*:/)
            if (keyMatch) {
              const key = keyMatch[1].trim()
              const valueElement = row.querySelector('.query-inspector__value')
              if (valueElement) {
                let value = valueElement.textContent?.trim() ?? ''

                // Convert values to appropriate types
                if (value === 'true') value = 'true'
                else if (value === 'false') value = 'false'
                else if (value === 'null') value = 'null'
                else if (!isNaN(Number(value))) value = Number(value).toString()
                else if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.substring(1, value.length - 1).trim()
                }

                documentData[key] = value
              }
            }
          })
        }

        return documentData
      } catch (parseError) {
        console.error('Error parsing document data from HTML:', parseError)
        return null
      }
    }
  } catch (apiError) {
    console.error('Error fetching document data from API:', apiError)
  }
}

export default function AdminButtons({ userSlug }: { userSlug: string }) {
  const router = useRouter()
  const path = usePathname()
  const [id, setId] = useState('')
  const [documentData, setDocumentData] = useState<any>(null)

  const authClient = createAuthClient({
    plugins: [adminClient()],
  })

  useEffect(() => {
    async function fetchDocumentData() {
      const id = getIdFromUrl(path, userSlug)
      const documentData = await getDocumentData(id, path)
      console.log('doc id', id)
      console.dir(['doc data', documentData], { depth: 2, colors: true })
      setId(id)
      setDocumentData(documentData)
    }
    fetchDocumentData()
  }, [])

  const handleImpersonate = async () => {
    await authClient.admin.impersonateUser({
      userId: id,
      fetchOptions: {
        onSuccess() {
          router.push('/')
        },
        onError(error: any) {
          console.error('Error impersonating user:', error)
          toast.error('Failed to impersonate user')
        },
      },
    })
  }

  const handleBan = async () => {
    await authClient.admin.banUser({
      userId: id,
      fetchOptions: {
        onSuccess() {
          toast.success('User banned successfully')
          router.refresh()
        },
        onError(error: any) {
          console.error('Error banning user:', error)
          toast.error('Failed to ban user')
        },
      },
    })
  }

  const handleUnban = async () => {
    await authClient.admin.unbanUser({
      userId: id,
      fetchOptions: {
        onSuccess() {
          toast.success('User unbanned successfully')
          router.refresh()
        },
        onError(error: any) {
          console.error('Error unbanning user:', error)
          toast.error('Failed to unban user')
        },
      },
    })
  }

  const handleRevokeAllSessions = async () => {
    await authClient.admin.revokeUserSessions({
      userId: id,
      fetchOptions: {
        onSuccess() {
          toast.success('All sessions revoked successfully')
          router.refresh()
        },
        onError(error: any) {
          console.error('Error revoking all sessions:', error)
          toast.error('Failed to revoke all sessions')
        },
      },
    })
  }

  return (
    <>
      <div
        className="admin-actions-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px',
          marginBottom: '24px',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-s)',
          backgroundColor: 'var(--theme-input-bg',
          color: 'var(--text-color, #334155)',
          transitionProperty: 'border, box-shadow, background-color',
          transitionDuration: '.1s, .1s, .5s',
          transitionTimingFunction: 'cubic-bezier(0, .2, .2, 1)',

        }}
        onMouseOver={(e) => (e.currentTarget.style.border = '1px solid var(--theme-elevation-250)')}
        onMouseOut={(e) => (e.currentTarget.style.border = '1px solid var(--theme-elevation-150)')}
      >
        <h3
          style={{
            margin: '0 0 0px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--heading-color, #334155)',
          }}
        >
          Admin Actions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={handleImpersonate}
            type="button"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--impersonate-bg, #f97316)',
              color: 'var(--button-text, white)',
              border: '1px solid var(--impersonate-border, #ea580c)',
              borderRadius: 'var(--style-radius-s)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--impersonate-hover, #ea580c)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--impersonate-bg, #f97316)')
            }
          >
            Impersonate
          </button>
          <button
            onClick={handleRevokeAllSessions}
            type="button"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--revoke-bg, #64748b)',
              color: 'var(--button-text, white)',
              border: '1px solid var(--revoke-border, #475569)',
              borderRadius: 'var(--style-radius-s)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--revoke-hover, #475569)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--revoke-bg, #64748b)')
            }
          >
            Revoke All Sessions
          </button>
          <button
            onClick={handleBan}
            type="button"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--ban-bg, #ef4444)',
              color: 'var(--button-text, white)',
              border: '1px solid var(--ban-border, #dc2626)',
              borderRadius: 'var(--style-radius-s)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--ban-hover, #dc2626)')
            }
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--ban-bg, #ef4444)')}
          >
            Ban
          </button>
          <button
            onClick={handleUnban}
            type="button"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--unban-bg, #22c55e)',
              color: 'var(--button-text, white)',
              border: '1px solid var(--unban-border, #16a34a)',
              borderRadius: 'var(--style-radius-s)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--unban-hover, #16a34a)')
            }
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--unban-bg, #22c55e)')}
          >
            Unban
          </button>
        </div>
      </div>
      <Toaster />
    </>
  )
}
