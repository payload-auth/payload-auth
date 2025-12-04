import React from 'react'
import { redirect } from 'next/navigation'

type RSCRedirectProps = {
  redirectTo: string
  searchParams?: Record<string, string | string[]>
}

const RSCRedirect: React.FC<RSCRedirectProps> = ({ redirectTo, searchParams }) => {
  // Forward the redirect query param if present
  const redirectParam = searchParams?.redirect
  if (redirectParam && typeof redirectParam === 'string') {
    redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectParam)}`)
  }
  redirect(redirectTo)
}

export default RSCRedirect
