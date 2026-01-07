# Examples Documentation

## Files Overview

This covers the `/examples/` directory with complete working examples.

---

## File: `examples/basic-auth.mdx`

```mdx
---
title: Basic Email/Password Auth
description: Simple authentication with email and password
---

# Basic Email/Password Authentication

A minimal example of email/password authentication.

## Configuration

\`\`\`typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { betterAuthPlugin } from 'payload-auth/better-auth'

export default buildConfig({
  admin: { user: 'users' },
  plugins: [
    betterAuthPlugin({
      betterAuthOptions: {
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        emailAndPassword: { enabled: true },
      },
    }),
  ],
})
\`\`\`

## Auth Client

\`\`\`typescript
// lib/auth.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
})
\`\`\`

## Sign Up Form

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'
import { useState } from 'react'

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await authClient.signUp.email({
      ...formData,
    })

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return <p>Account created! Check your email to verify.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}
\`\`\`

## Sign In Form

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await authClient.signIn.email({ email, password })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  )
}
\`\`\`

## User Menu

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()

  if (isPending) return <span>Loading...</span>
  if (!session) return <a href="/login">Sign In</a>

  return (
    <div>
      <span>Welcome, {session.user.name}</span>
      <button
        onClick={async () => {
          await authClient.signOut()
          router.push('/')
        }}
      >
        Sign Out
      </button>
    </div>
  )
}
\`\`\`
```

---

## File: `examples/social-auth.mdx`

```mdx
---
title: Social Login Example
description: Authentication with Google and GitHub
---

# Social Login Example

Add Google and GitHub login to your application.

## Configuration

\`\`\`typescript
// payload.config.ts
betterAuthPlugin({
  betterAuthOptions: {
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github', 'email-password'],
      },
    },
  },
})
\`\`\`

## Environment Variables

\`\`\`env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
\`\`\`

## OAuth Callback URIs

Configure these in your provider dashboards:

- Google: `https://yourapp.com/api/auth/callback/google`
- GitHub: `https://yourapp.com/api/auth/callback/github`

## Social Login Buttons

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'

export function SocialLoginButtons() {
  const handleSocialLogin = (provider: 'google' | 'github') => {
    authClient.signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  }

  return (
    <div className="social-buttons">
      <button
        onClick={() => handleSocialLogin('google')}
        className="google-btn"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      
      <button
        onClick={() => handleSocialLogin('github')}
        className="github-btn"
      >
        <GitHubIcon />
        Continue with GitHub
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      {/* Google icon SVG */}
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      {/* GitHub icon SVG */}
    </svg>
  )
}
\`\`\`

## Complete Login Page

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await authClient.signIn.email({ email, password })
    if (error) setError(error.message)
  }

  const handleSocialLogin = (provider: string) => {
    authClient.signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  }

  return (
    <div className="login-container">
      <h1>Sign In</h1>
      
      {/* Social Buttons */}
      <div className="social-section">
        <button onClick={() => handleSocialLogin('google')}>
          Continue with Google
        </button>
        <button onClick={() => handleSocialLogin('github')}>
          Continue with GitHub
        </button>
      </div>
      
      <div className="divider">
        <span>or</span>
      </div>
      
      {/* Email Form */}
      <form onSubmit={handleEmailLogin}>
        {error && <div className="error">{error}</div>}
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
        <button type="submit">Sign In</button>
      </form>
      
      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  )
}
\`\`\`

## Linking Accounts

Allow users to link additional providers:

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'

export function LinkedAccounts() {
  const { data: session } = authClient.useSession()
  
  const linkProvider = (provider: string) => {
    authClient.linkSocial({
      provider,
      callbackURL: '/settings/accounts',
    })
  }

  return (
    <div>
      <h3>Linked Accounts</h3>
      {/* Show current linked accounts */}
      
      <h4>Link More Accounts</h4>
      <button onClick={() => linkProvider('google')}>
        Link Google
      </button>
      <button onClick={() => linkProvider('github')}>
        Link GitHub
      </button>
    </div>
  )
}
\`\`\`
```

---

## File: `examples/multi-tenant.mdx`

```mdx
---
title: Multi-Tenant Organizations
description: Building a multi-tenant SaaS application
---

# Multi-Tenant Organizations

Build a SaaS application with organization-based multi-tenancy.

## Configuration

\`\`\`typescript
// payload.config.ts
import { organization } from 'better-auth/plugins'

betterAuthPlugin({
  betterAuthOptions: {
    plugins: [
      organization({
        teams: { enabled: true },
        sendInvitationEmail: async (data) => {
          await sendEmail({
            to: data.email,
            subject: \`Join \${data.organization.name}\`,
            html: \`<a href="\${data.inviteLink}">Accept Invitation</a>\`,
          })
        },
      }),
    ],
  },
})
\`\`\`

## Auth Client

\`\`\`typescript
// lib/auth.ts
import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [organizationClient()],
})
\`\`\`

## Organization Context Provider

\`\`\`tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth'

interface OrgContextType {
  organization: any | null
  setOrganization: (org: any) => void
  isLoading: boolean
}

const OrgContext = createContext<OrgContextType | null>(null)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession()
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.session.activeOrganizationId) {
      // Fetch active organization details
      authClient.organization.get({
        organizationId: session.session.activeOrganizationId,
      }).then(({ data }) => {
        setOrganization(data)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [session])

  return (
    <OrgContext.Provider value={{ organization, setOrganization, isLoading }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrganization = () => {
  const context = useContext(OrgContext)
  if (!context) throw new Error('useOrganization must be used within OrganizationProvider')
  return context
}
\`\`\`

## Organization Switcher

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'
import { useEffect, useState } from 'react'

export function OrganizationSwitcher() {
  const { data: session } = authClient.useSession()
  const [organizations, setOrganizations] = useState<any[]>([])

  useEffect(() => {
    authClient.organization.list().then(({ data }) => {
      setOrganizations(data || [])
    })
  }, [])

  const switchOrganization = async (orgId: string) => {
    await authClient.organization.setActive({
      organizationId: orgId,
    })
    window.location.reload()
  }

  return (
    <select
      value={session?.session.activeOrganizationId || ''}
      onChange={(e) => switchOrganization(e.target.value)}
    >
      <option value="">Personal</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  )
}
\`\`\`

## Create Organization

\`\`\`tsx
'use client'
import { authClient } from '@/lib/auth'
import { useState } from 'react'

export function CreateOrganizationForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await authClient.organization.create({
      name,
      slug,
    })

    if (error) {
      alert(error.message)
      return
    }

    // Switch to the new organization
    await authClient.organization.setActive({
      organizationId: data.id,
    })
    
    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Organization Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
        }}
      />
      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button type="submit">Create Organization</button>
    </form>
  )
}
\`\`\`

## Organization-Scoped Data

\`\`\`typescript
// collections/Projects.ts
import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
    },
  ],
  access: {
    read: ({ req }) => {
      const orgId = req.user?.session?.activeOrganizationId
      if (!orgId) return false
      return { organization: { equals: orgId } }
    },
    create: ({ req }) => {
      return !!req.user?.session?.activeOrganizationId
    },
  },
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        // Auto-set organization from session
        if (!data.organization && req.user?.session?.activeOrganizationId) {
          data.organization = req.user.session.activeOrganizationId
        }
        return data
      },
    ],
  },
}
\`\`\`
```
