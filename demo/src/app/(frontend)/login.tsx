'use client'

import React from 'react'
import { authClient } from '../../lib/auth-client.js'

export function Login() {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false)
  const [message, setMessage] = React.useState<string>('')

  React.useEffect(() => {
    const fetchSession = async () => {
      const session = await authClient.getSession()
      if (session?.data?.user) {
        setMessage(`You are logged in as ${session.data.user.email}`)
        setLoggedIn(true)
      } else {
        setMessage('You are not logged in')
        setLoggedIn(false)
      }
    }
    void fetchSession()
  }, [loggedIn])

  const handleLogin = async () => {
    const response = await authClient.signIn.social({
      provider: 'google',
    })

    if (response.data?.url) {
      setLoggedIn(true)
    }
  }

  const handleLogout = async () => {
    const response = await authClient.signOut()

    if (response.data?.success) {
      setLoggedIn(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem', // Add gap for spacing between elements
      }}
    >
      {/* Reduced marginBottom */}
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{message}</p>{' '}
      {/* Display the message */}
      <button
        onClick={() => (loggedIn ? handleLogout() : handleLogin())}
        type="button"
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#4285f4', // Google Blue
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          fontWeight: '500', // Make the text slightly bolder
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
        }}
        onMouseEnter={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#357ae8' // Darker shade on hover
        }}
        onMouseLeave={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#4285f4' // Original color on mouse leave
        }}
      >
        {loggedIn ? 'Logout' : 'Login with Google'}
      </button>
    </div>
  )
}
