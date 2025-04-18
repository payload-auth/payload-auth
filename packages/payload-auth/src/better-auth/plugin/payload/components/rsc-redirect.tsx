import React from 'react'
import { redirect } from 'next/navigation'

type RSCRedirectProps = {
  redirectTo: string
}

const RSCRedirect: React.FC<RSCRedirectProps> = ({ redirectTo }) => {
  redirect(redirectTo)
}

export default RSCRedirect
