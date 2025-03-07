'use client'

import React from 'react'
import { authClient } from '../../lib/auth-client.js'

export function Login() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Login</h1>
      <button
        onClick={() => handleLogin()}
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
        }}
        onMouseEnter={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#357ae8' // Darker shade on hover
        }}
        onMouseLeave={(e) => {
          ;(e.target as HTMLButtonElement).style.backgroundColor = '#4285f4' // Original color on mouse leave
        }}
      >
        Login with Google
      </button>
    </div>
  )
}
