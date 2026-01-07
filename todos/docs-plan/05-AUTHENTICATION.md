# Authentication Methods Documentation

## Files Overview

This covers the `/authentication/` directory with guides for each auth method.

---

## File: `authentication/email-password.mdx`

```mdx
---
title: Email & Password
description: Traditional email/password authentication
---

# Email & Password Authentication

The most common authentication method using email and password.

## Enable Email/Password Auth

\`\`\`typescript
betterAuthPlugin({
  betterAuthOptions: {
    emailAndPassword: {
      enabled: true,
    },
  },
})
\`\`\`

## Configuration Options

\`\`\`typescript
emailAndPassword: {
  enabled: true,
  
  // Require email verification before login
  requireEmailVerification: true,
  
  // Auto sign in after registration
  autoSignIn: false,
  
  // Password requirements
  minPasswordLength: 8,
  maxPasswordLength: 128,
  
  // Password reset
  sendResetPassword: async ({ user, url, token }) => {
    // Send reset email
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: \`<a href="\${url}">Reset Password</a>\`,
    })
  },
}
\`\`\`

## Email Verification

\`\`\`typescript
emailVerification: {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  
  sendVerificationEmail: async ({ user, url, token }) => {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: \`<a href="\${url}">Verify Email</a>\`,
    })
  },
}
\`\`\`

## Client Usage

### Sign Up

\`\`\`typescript
import { authClient } from '@/lib/auth-client'

const { data, error } = await authClient.signUp.email({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe',
})
\`\`\`

### Sign In

\`\`\`typescript
const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'securepassword',
})
\`\`\`

### Password Reset

\`\`\`typescript
// Request reset
await authClient.forgetPassword({
  email: 'user@example.com',
  redirectTo: '/reset-password',
})

// Reset with token
await authClient.resetPassword({
  token: 'reset-token-from-url',
  newPassword: 'newsecurepassword',
})
\`\`\`

## React Components

### Sign Up Form

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    })
    
    if (error) {
      console.error(error.message)
      return
    }
    
    // Redirect or show success
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}
\`\`\`
```

---

## File: `authentication/social-providers.mdx`

```mdx
---
title: Social Providers
description: OAuth authentication with Google, GitHub, and more
---

# Social Providers

Add social login with OAuth providers like Google, GitHub, Discord, and more.

## Supported Providers

| Provider | ID |
|----------|-----|
| Google | `google` |
| GitHub | `github` |
| Discord | `discord` |
| Apple | `apple` |
| Facebook | `facebook` |
| Twitter/X | `twitter` |
| LinkedIn | `linkedin` |
| Microsoft | `microsoft` |
| Spotify | `spotify` |
| TikTok | `tiktok` |
| Twitch | `twitch` |
| GitLab | `gitlab` |

## Configuration

### Google

\`\`\`typescript
betterAuthOptions: {
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ['email', 'profile'],
    },
  },
}
\`\`\`

**Required ENV:**
\`\`\`env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
\`\`\`

**Redirect URI:** `https://yourapp.com/api/auth/callback/google`

### GitHub

\`\`\`typescript
github: {
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  scope: ['read:user', 'user:email'],
}
\`\`\`

### Discord

\`\`\`typescript
discord: {
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  scope: ['identify', 'email'],
}
\`\`\`

## Client Usage

### Sign In with Provider

\`\`\`typescript
import { authClient } from '@/lib/auth-client'

await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard',
})
\`\`\`

### Social Login Buttons

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth-client'

export function SocialLoginButtons() {
  const handleSocialLogin = async (provider: string) => {
    await authClient.signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  }
  
  return (
    <div className="flex gap-4">
      <button onClick={() => handleSocialLogin('google')}>
        Continue with Google
      </button>
      <button onClick={() => handleSocialLogin('github')}>
        Continue with GitHub
      </button>
      <button onClick={() => handleSocialLogin('discord')}>
        Continue with Discord
      </button>
    </div>
  )
}
\`\`\`

## Account Linking

Enable linking multiple providers to one account:

\`\`\`typescript
betterAuthOptions: {
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github', 'email-password'],
    },
  },
}
\`\`\`

### Link Additional Provider

\`\`\`typescript
// User is already signed in
await authClient.linkSocial({
  provider: 'github',
  callbackURL: '/settings/accounts',
})
\`\`\`

## Disable Implicit Sign Up

Require existing account for social login:

\`\`\`typescript
socialProviders: {
  google: {
    clientId: '...',
    clientSecret: '...',
    disableImplicitSignUp: true,
  },
}
\`\`\`
```

---

## File: `authentication/passkeys.mdx`

```mdx
---
title: Passkeys
description: WebAuthn/FIDO2 passwordless authentication
---

# Passkeys

Modern passwordless authentication using WebAuthn/FIDO2.

## Installation

\`\`\`bash
pnpm add @better-auth/passkey
\`\`\`

## Configuration

\`\`\`typescript
import { passkey } from '@better-auth/passkey'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      passkey({
        rpID: 'yourapp.com', // Your domain
        rpName: 'Your App Name',
        origin: 'https://yourapp.com',
      }),
    ],
  },
})
\`\`\`

### Development Configuration

\`\`\`typescript
passkey({
  rpID: 'localhost',
  rpName: 'Dev App',
  origin: 'http://localhost:3000',
})
\`\`\`

## Client Setup

\`\`\`typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react'
import { passkeyClient } from '@better-auth/passkey/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [passkeyClient()],
})
\`\`\`

## Usage

### Register a Passkey

\`\`\`typescript
// User must be signed in
await authClient.passkey.addPasskey({
  name: 'My MacBook', // Optional name
})
\`\`\`

### Sign In with Passkey

\`\`\`typescript
const { data, error } = await authClient.signIn.passkey()

if (error) {
  console.error('Passkey sign in failed:', error.message)
}
\`\`\`

## Admin UI Integration

payload-auth automatically adds a passkey management UI in user edit view:

- View registered passkeys
- Delete passkeys
- Add new passkeys

## React Components

### Passkey Registration Button

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export function AddPasskeyButton() {
  const [loading, setLoading] = useState(false)
  
  const handleAddPasskey = async () => {
    setLoading(true)
    try {
      await authClient.passkey.addPasskey({
        name: \`Passkey \${new Date().toLocaleDateString()}\`,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button onClick={handleAddPasskey} disabled={loading}>
      {loading ? 'Adding...' : 'Add Passkey'}
    </button>
  )
}
\`\`\`

### Passkey Sign In Button

\`\`\`tsx
export function PasskeySignIn() {
  const handleSignIn = async () => {
    const { error } = await authClient.signIn.passkey()
    if (error) {
      alert(error.message)
    }
  }
  
  return (
    <button onClick={handleSignIn}>
      Sign in with Passkey
    </button>
  )
}
\`\`\`
```

---

## File: `authentication/two-factor.mdx`

```mdx
---
title: Two-Factor Authentication
description: Add TOTP and backup codes for enhanced security
---

# Two-Factor Authentication

Add an extra layer of security with TOTP-based 2FA.

## Configuration

\`\`\`typescript
import { twoFactor } from 'better-auth/plugins'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      twoFactor({
        issuer: 'Your App Name', // Shows in authenticator app
        
        // Optional: Send OTP via email/SMS as backup
        otpOptions: {
          async sendOTP({ user, otp }) {
            await sendSMS(user.phoneNumber, \`Your code: \${otp}\`)
          },
        },
      }),
    ],
  },
})
\`\`\`

## Client Setup

\`\`\`typescript
import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [twoFactorClient()],
})
\`\`\`

## Enabling 2FA

### Step 1: Get TOTP Secret

\`\`\`typescript
const { data } = await authClient.twoFactor.enable()

// data.totpURI - Use to generate QR code
// data.backupCodes - Save these for recovery
\`\`\`

### Step 2: Verify Setup

\`\`\`typescript
await authClient.twoFactor.verifyTotp({
  code: '123456', // Code from authenticator app
})
\`\`\`

## Sign In with 2FA

When 2FA is enabled, sign in returns a flag:

\`\`\`typescript
const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password',
})

if (data?.twoFactorRedirect) {
  // Redirect to 2FA verification page
  router.push('/verify-2fa')
}
\`\`\`

### Verify TOTP

\`\`\`typescript
await authClient.twoFactor.verifyTotp({
  code: '123456',
})
\`\`\`

## React Components

### Enable 2FA Flow

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import QRCode from 'qrcode.react'

export function Enable2FA() {
  const [totpURI, setTotpURI] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState('')
  
  const handleEnable = async () => {
    const { data } = await authClient.twoFactor.enable()
    setTotpURI(data.totpURI)
    setBackupCodes(data.backupCodes)
  }
  
  const handleVerify = async () => {
    await authClient.twoFactor.verifyTotp({ code })
  }
  
  if (!totpURI) {
    return <button onClick={handleEnable}>Enable 2FA</button>
  }
  
  return (
    <div>
      <QRCode value={totpURI} />
      <div>
        <h3>Backup Codes (save these!):</h3>
        <ul>
          {backupCodes.map(code => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      </div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code from app"
      />
      <button onClick={handleVerify}>Verify</button>
    </div>
  )
}
\`\`\`

## Admin Panel Integration

payload-auth adds a 2FA management component to the user edit view:

- Shows 2FA status (enabled/disabled)
- Allows admins to disable 2FA for users
- QR code and setup flow for enabling
```
