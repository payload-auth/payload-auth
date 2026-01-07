# Admin UI Documentation

## Files Overview

This covers the `/admin-ui/` directory documenting Payload admin customization.

---

## File: `admin-ui/overview.mdx`

```mdx
---
title: Admin UI Overview
description: Customizing authentication in the Payload admin panel
---

# Admin UI Overview

payload-auth provides extensive customization for the Payload admin panel authentication.

## Two Modes of Operation

### 1. Default Payload Auth (default)

Payload's built-in authentication handles the admin panel while Better Auth handles your frontend.

\`\`\`typescript
betterAuthPlugin({
  disableDefaultPayloadAuth: false, // default
})
\`\`\`

**Best for:**
- Simple setups
- Separate admin/user authentication
- Existing Payload projects

### 2. Better Auth for Admin

Better Auth handles both admin panel and frontend authentication.

\`\`\`typescript
betterAuthPlugin({
  disableDefaultPayloadAuth: true,
})
\`\`\`

**Best for:**
- Unified authentication experience
- Social login in admin
- Two-factor auth for admins
- Passkeys in admin

## Available Admin Components

### RSC (Server Components)

\`\`\`typescript
import {
  AdminLogin,      // Custom login view
  AdminSignup,     // Custom signup view
  ForgotPassword,  // Password reset request
  ResetPassword,   // Password reset form
  TwoFactorVerify, // 2FA verification
  Passkeys,        // Passkey management
  RSCRedirect,     // Login redirect handler
} from 'payload-auth/better-auth/plugin/rsc'
\`\`\`

### Client Components

\`\`\`typescript
import {
  AdminButtons,       // Impersonate/Ban buttons
  AdminInviteButton,  // Create invitation
  LogoutButton,       // Custom logout
  TwoFactorAuth,      // 2FA setup field
  LoginFormProvider,  // Login form context
  CredentialsForm,    // Email/password form
  AlternativeMethods, // Social/passkey buttons
} from 'payload-auth/better-auth/plugin/client'
\`\`\`

## Admin Customization Options

\`\`\`typescript
betterAuthPlugin({
  admin: {
    // Which login methods to show
    loginMethods: ['emailPassword', 'google', 'github', 'passkey'],
  },
})
\`\`\`

### Available Login Methods

\`\`\`typescript
type LoginMethod =
  | 'emailPassword'
  | 'magicLink'
  | 'emailOTP'
  | 'phonePassword'
  | 'phoneOTP'
  | 'passkey'
  // Social providers
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'google'
  | 'linkedin'
  | 'microsoft'
  | 'spotify'
  | 'twitter'
  | 'twitch'
  // ...and more
\`\`\`
```

---

## File: `admin-ui/disable-default-auth.mdx`

```mdx
---
title: Using Better Auth for Admin
description: Replace Payload's default auth with Better Auth
---

# Using Better Auth for Admin

Enable full Better Auth functionality in the Payload admin panel.

## Enable Better Auth Admin

\`\`\`typescript
betterAuthPlugin({
  disableDefaultPayloadAuth: true,
})
\`\`\`

## What Changes

When enabled:

1. **Login View** → Custom login with social/passkey support
2. **Signup View** → First admin creation or invitation-based signup
3. **Forgot Password** → Better Auth password reset flow
4. **Logout** → Better Auth session termination
5. **2FA Verify** → Two-factor verification step (if enabled)

## Admin Routes

payload-auth adds these admin routes:

| Route | Purpose |
|-------|---------|
| `/admin/login` | Custom login page |
| `/admin/signup` | Admin signup (invite required) |
| `/admin/forgot-password` | Request password reset |
| `/admin/reset-password` | Reset password form |
| `/admin/two-factor-verify` | 2FA verification |

## First Admin Setup

When no admins exist:

1. User visits `/admin`
2. Redirected to `/admin/signup` with auto-generated invite token
3. User creates account with admin role
4. Subsequent admins require explicit invitation

## Inviting Admins

From the Users collection:

1. Click "Invite Admin" button
2. Select role
3. Copy invite URL or send email

### Configure Invite Emails

\`\`\`typescript
betterAuthPlugin({
  adminInvitations: {
    generateInviteUrl: ({ payload, token }) => {
      return \`\${process.env.APP_URL}/admin/signup?token=\${token}\`
    },
    sendInviteEmail: async ({ payload, email, url }) => {
      await payload.sendEmail({
        to: email,
        subject: 'Admin Invitation',
        html: \`<a href="\${url}">Accept Invitation</a>\`,
      })
      return { success: true }
    },
  },
})
\`\`\`

## Social Login in Admin

When `disableDefaultPayloadAuth` is true, social providers work in admin:

\`\`\`typescript
betterAuthPlugin({
  disableDefaultPayloadAuth: true,
  admin: {
    loginMethods: ['emailPassword', 'google', 'github'],
  },
  betterAuthOptions: {
    socialProviders: {
      google: { /* ... */ },
      github: { /* ... */ },
    },
  },
})
\`\`\`

## Two-Factor in Admin

When the `twoFactor` plugin is enabled:

1. Admins can enable 2FA from their profile
2. Login requires 2FA verification
3. Dedicated `/admin/two-factor-verify` route

## Passkeys in Admin

When the `passkey` plugin is enabled:

1. Login page shows "Sign in with Passkey" option
2. Users can register passkeys from profile
3. Admin panel supports passwordless login
```

---

## File: `admin-ui/components.mdx`

```mdx
---
title: Admin Components
description: Available components for admin customization
---

# Admin Components

payload-auth exports components for customizing the admin experience.

## User Edit Components

### AdminButtons

Shows impersonate and ban buttons on user edit page.

\`\`\`typescript
// Automatically added when admin plugin is enabled
// Component path: 'payload-auth/better-auth/plugin/client#AdminButtons'
\`\`\`

### TwoFactorAuth

Shows 2FA status and management UI.

\`\`\`typescript
// Automatically added when twoFactor plugin is enabled
// Component path: 'payload-auth/better-auth/plugin/client#TwoFactorAuth'
\`\`\`

### Passkeys

Displays registered passkeys with add/remove functionality.

\`\`\`typescript
// Automatically added when passkey plugin is enabled
// Component path: 'payload-auth/better-auth/plugin/rsc#Passkeys'
\`\`\`

## Collection Description Components

### AdminInviteButton

Shows "Invite Admin" button on Users collection list.

\`\`\`typescript
// Automatically added to users collection
// Component path: 'payload-auth/better-auth/plugin/client#AdminInviteButton'
\`\`\`

## Login Form Components

### LoginFormProvider

Provides context for login form components.

\`\`\`tsx
import { LoginFormProvider } from 'payload-auth/better-auth/plugin/client'

<LoginFormProvider
  searchParams={searchParams}
  baseURL={baseURL}
  basePath={basePath}
  loginIdentifiers={['email', 'username']}
  plugins={{ passkey: true, magicLink: true }}
  loginMethods={['emailPassword', 'google']}
>
  {/* Login form content */}
</LoginFormProvider>
\`\`\`

### CredentialsForm

Email/password login form.

\`\`\`tsx
import { CredentialsForm } from 'payload-auth/better-auth/plugin/client'

<CredentialsForm prefill={{ email: 'test@example.com' }} />
\`\`\`

### AlternativeMethods

Social login and passkey buttons.

\`\`\`tsx
import { AlternativeMethods } from 'payload-auth/better-auth/plugin/client'

<AlternativeMethods />
\`\`\`

## Shared Components

### Logo

Payload logo component for login pages.

\`\`\`tsx
import { Logo } from 'payload-auth/shared'

<Logo
  i18n={i18n}
  locale={locale}
  payload={payload}
/>
\`\`\`

### Field Components

Utility components for fields.

\`\`\`tsx
import {
  FieldCopyButton,    // Copy field value to clipboard
  GenerateUuidButton, // Generate UUID for token fields
} from 'payload-auth/shared/payload/fields'
\`\`\`

## Custom Login Page Example

\`\`\`tsx
// Custom admin login view
import { MinimalTemplate } from '@payloadcms/next/templates'
import {
  LoginFormProvider,
  CredentialsForm,
  AlternativeMethods,
} from 'payload-auth/better-auth/plugin/client'
import { Logo } from 'payload-auth/shared'

export default function CustomLogin({ searchParams, pluginOptions }) {
  return (
    <MinimalTemplate>
      <Logo />
      <h1>Welcome Back</h1>
      
      <LoginFormProvider
        searchParams={searchParams}
        baseURL={pluginOptions.betterAuthOptions?.baseURL}
        loginMethods={['emailPassword', 'google']}
        plugins={{ passkey: true }}
      >
        <CredentialsForm />
        <div className="divider">or</div>
        <AlternativeMethods />
      </LoginFormProvider>
    </MinimalTemplate>
  )
}
\`\`\`
```

---

## File: `admin-ui/theming.mdx`

```mdx
---
title: Theming
description: Customizing the appearance of auth UI
---

# Theming

Customize the appearance of authentication components.

## CSS Variables

payload-auth components use Payload's CSS variables. Override in your admin CSS:

\`\`\`css
/* admin.scss or custom.scss */
:root {
  /* Login form */
  --theme-login-bg: var(--theme-bg);
  --theme-login-input-bg: var(--theme-input-bg);
  
  /* Buttons */
  --theme-success: #22c55e;
  --theme-error: #ef4444;
  --theme-warning: #f59e0b;
}
\`\`\`

## Component Classes

Auth components use BEM-style class names:

\`\`\`css
/* Login form */
.login { }
.login__brand { }
.login__form { }
.login__input { }

/* Social buttons */
.alternative-methods { }
.alternative-methods__button { }
.alternative-methods__button--google { }
.alternative-methods__button--github { }

/* Admin buttons */
.admin-buttons { }
.admin-buttons__impersonate { }
.admin-buttons__ban { }

/* Two-factor */
.two-factor-auth { }
.two-factor-auth__status { }
.two-factor-auth__qr { }
```

## Custom Styles Example

\`\`\`scss
// admin.scss
@import '~payload-auth/better-auth/plugin/payload/components/login-form/index.scss';

.login {
  &__brand {
    margin-bottom: 2rem;
    
    img {
      max-width: 200px;
    }
  }
  
  &__form {
    max-width: 400px;
    margin: 0 auto;
  }
}

.alternative-methods {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: var(--style-radius-s);
    
    &--google {
      background: #fff;
      color: #333;
      border: 1px solid #ddd;
    }
    
    &--github {
      background: #24292e;
      color: #fff;
    }
  }
}
\`\`\`

## Adding Custom Logo

\`\`\`typescript
// payload.config.ts
export default buildConfig({
  admin: {
    meta: {
      icons: [{ url: '/logo.svg', rel: 'icon' }],
    },
    components: {
      graphics: {
        Logo: '/components/CustomLogo',
        Icon: '/components/CustomIcon',
      },
    },
  },
})
\`\`\`
```
