# Guides Documentation

## Files Overview

This covers the `/guides/` directory with practical tutorials.

---

## File: `guides/nextjs-setup.mdx`

```mdx
---
title: Next.js Setup Guide
description: Complete guide to setting up payload-auth with Next.js
---

# Next.js Setup Guide

A complete walkthrough for integrating payload-auth with a Next.js application.

## Prerequisites

- Next.js 15+ with App Router
- Payload CMS 3.x installed
- PostgreSQL, MongoDB, or SQLite database

## Step 1: Install Dependencies

\`\`\`bash
pnpm add payload-auth better-auth
pnpm add @better-auth/passkey  # Optional: for passkeys
\`\`\`

## Step 2: Configure Payload

\`\`\`typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { betterAuthPlugin } from 'payload-auth/better-auth'
import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(__dirname),
    },
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI! },
  }),
  secret: process.env.PAYLOAD_SECRET!,
  plugins: [
    betterAuthPlugin({
      disableDefaultPayloadAuth: true,
      betterAuthOptions: {
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        emailAndPassword: {
          enabled: true,
          requireEmailVerification: true,
          sendResetPassword: async ({ user, url }) => {
            console.log('Reset password:', url)
          },
        },
        emailVerification: {
          sendOnSignUp: true,
          sendVerificationEmail: async ({ user, url }) => {
            console.log('Verify email:', url)
          },
        },
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      },
    }),
  ],
})
\`\`\`

## Step 3: Create Auth API Route

\`\`\`typescript
// app/api/auth/[...all]/route.ts
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'

const handler = async (request: Request) => {
  const { betterAuth } = await getPayloadAuth(config)
  return betterAuth.handler(request)
}

export { handler as GET, handler as POST }
\`\`\`

## Step 4: Create Auth Client

\`\`\`typescript
// lib/auth/client.ts
import { createAuthClient } from 'better-auth/react'
import { passkeyClient } from '@better-auth/passkey/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    passkeyClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
\`\`\`

## Step 5: Create Session Provider

\`\`\`tsx
// components/providers.tsx
'use client'

import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}
\`\`\`

## Step 6: Protect Pages

### Client-Side Protection

\`\`\`tsx
// app/dashboard/page.tsx
'use client'

import { useSession } from '@/lib/auth/client'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  
  if (isPending) {
    return <div>Loading...</div>
  }
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  )
}
\`\`\`

### Server-Side Protection

\`\`\`tsx
// app/dashboard/page.tsx
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { betterAuth } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  })
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  )
}
\`\`\`

## Step 7: Create Login Page

\`\`\`tsx
// app/login/page.tsx
'use client'

import { authClient } from '@/lib/auth/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const { error } = await authClient.signIn.email({
      email,
      password,
    })
    
    if (error) {
      setError(error.message)
      return
    }
    
    router.push('/dashboard')
  }
  
  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    })
  }
  
  return (
    <div>
      <h1>Sign In</h1>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign In</button>
      </form>
      
      <div className="divider">or</div>
      
      <button onClick={handleGoogleSignIn}>
        Continue with Google
      </button>
    </div>
  )
}
\`\`\`

## Environment Variables

\`\`\`env
# .env.local
DATABASE_URI=postgresql://...
PAYLOAD_SECRET=your-secret-min-32-chars
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`
```

---

## File: `guides/client-usage.mdx`

```mdx
---
title: Client-Side Authentication
description: Using payload-auth in client components
---

# Client-Side Authentication

Work with authentication in React client components.

## Setting Up the Client

\`\`\`typescript
// lib/auth/client.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
})

// Export commonly used functions
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
\`\`\`

## Using the Session Hook

\`\`\`tsx
'use client'

import { useSession } from '@/lib/auth/client'

export function UserMenu() {
  const { data: session, isPending, error } = useSession()
  
  if (isPending) {
    return <div>Loading...</div>
  }
  
  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  if (!session) {
    return <a href="/login">Sign In</a>
  }
  
  return (
    <div>
      <img src={session.user.image} alt={session.user.name} />
      <span>{session.user.name}</span>
      <span>{session.user.role}</span>
    </div>
  )
}
\`\`\`

## Sign In Methods

### Email/Password

\`\`\`typescript
const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password',
})
\`\`\`

### Social Providers

\`\`\`typescript
// Redirects to OAuth provider
await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard',
})
\`\`\`

### Passkey

\`\`\`typescript
const { data, error } = await authClient.signIn.passkey()
\`\`\`

### Magic Link

\`\`\`typescript
await authClient.signIn.magicLink({
  email: 'user@example.com',
  callbackURL: '/dashboard',
})
\`\`\`

## Sign Up

\`\`\`typescript
const { data, error } = await authClient.signUp.email({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe',
})
\`\`\`

## Sign Out

\`\`\`typescript
await authClient.signOut()
// or
await signOut()
\`\`\`

## Error Handling

\`\`\`typescript
const { data, error } = await authClient.signIn.email({
  email,
  password,
})

if (error) {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      showError('Invalid email or password')
      break
    case 'EMAIL_NOT_VERIFIED':
      showError('Please verify your email')
      break
    case 'USER_BANNED':
      showError('Your account has been suspended')
      break
    default:
      showError(error.message)
  }
}
\`\`\`

## Protected Components

\`\`\`tsx
'use client'

import { useSession } from '@/lib/auth/client'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  
  useEffect(() => {
    if (!isPending && !session) {
      redirect('/login')
    }
  }, [session, isPending])
  
  if (isPending) {
    return <div>Loading...</div>
  }
  
  if (!session) {
    return null
  }
  
  return <>{children}</>
}
\`\`\`

## Role-Based Access

\`\`\`tsx
'use client'

import { useSession } from '@/lib/auth/client'

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  
  const isAdmin = session?.user.role?.includes('admin')
  
  if (!isAdmin) {
    return null
  }
  
  return <>{children}</>
}
\`\`\`
```

---

## File: `guides/server-usage.mdx`

```mdx
---
title: Server-Side Authentication
description: Using payload-auth in server components and API routes
---

# Server-Side Authentication

Work with authentication in Next.js server components and API routes.

## Getting the Session

### In Server Components

\`\`\`tsx
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'
import { headers } from 'next/headers'

export default async function ProfilePage() {
  const { betterAuth } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  })
  
  if (!session) {
    return <div>Not authenticated</div>
  }
  
  return (
    <div>
      <h1>{session.user.name}</h1>
      <p>{session.user.email}</p>
    </div>
  )
}
\`\`\`

### In API Routes

\`\`\`typescript
// app/api/protected/route.ts
import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'

export async function GET(request: Request) {
  const { betterAuth } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: request.headers,
  })
  
  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return Response.json({
    user: session.user,
  })
}
\`\`\`

### In Server Actions

\`\`\`typescript
'use server'

import { getPayloadAuth } from 'payload-auth/better-auth'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function updateProfile(formData: FormData) {
  const { betterAuth, payload } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  })
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  await payload.update({
    collection: 'users',
    id: session.user.id,
    data: {
      name: formData.get('name') as string,
    },
  })
  
  return { success: true }
}
\`\`\`

## Using with Payload Operations

### Create Data for Current User

\`\`\`typescript
export async function createPost(data: CreatePostData) {
  const { betterAuth, payload } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  })
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  const post = await payload.create({
    collection: 'posts',
    data: {
      ...data,
      author: session.user.id,
    },
  })
  
  return post
}
\`\`\`

### Query User's Data

\`\`\`typescript
export async function getUserPosts() {
  const { betterAuth, payload } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  })
  
  if (!session) {
    return []
  }
  
  const posts = await payload.find({
    collection: 'posts',
    where: {
      author: { equals: session.user.id },
    },
  })
  
  return posts.docs
}
\`\`\`

## Role Checks

\`\`\`typescript
export async function adminAction() {
  const { betterAuth } = await getPayloadAuth(config)
  
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  })
  
  if (!session?.user.role?.includes('admin')) {
    throw new Error('Forbidden: Admin access required')
  }
  
  // Admin-only logic
}
\`\`\`

## Middleware Protection

\`\`\`typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session_token')
  
  if (!sessionCookie && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
}
\`\`\`
```
