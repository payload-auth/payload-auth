import { createAuthClient } from 'better-auth/react'
import {
  organizationClient,
  passkeyClient,
  twoFactorClient,
  adminClient,
  multiSessionClient,
  oneTapClient,
  oidcClient,
  genericOAuthClient,
} from 'better-auth/client/plugins'
import { toast } from 'sonner'

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}`, // the base url of your auth server
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/two-factor'
      },
    }),
    passkeyClient(),
    adminClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    oidcClient(),
    genericOAuthClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.')
      }
    },
  },
})

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = authClient

authClient.$store.listen('$sessionSignal', async () => {})
