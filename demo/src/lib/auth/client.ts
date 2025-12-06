import { createAuthClient } from 'better-auth/react'
import {
  organizationClient,
  twoFactorClient,
  adminClient,
  multiSessionClient,
  oneTapClient,
  oidcClient,
  genericOAuthClient,
  usernameClient,
  anonymousClient,
  phoneNumberClient,
  magicLinkClient,
  emailOTPClient,
  apiKeyClient,
  inferAdditionalFields
} from 'better-auth/client/plugins'
import { passkeyClient } from "@better-auth/passkey/client"
import { toast } from 'sonner'
import { betterAuthOptions } from './options'

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}`,
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/two-factor'
      }
    }),
    // usernameClient(),
    anonymousClient(),
    phoneNumberClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    adminClient(),
    apiKeyClient(),
    organizationClient(),
    multiSessionClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: 'string'
        }
      }
    })
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.')
      }
    }
  },
  $InferAuth: betterAuthOptions
})

export const { signUp, signIn, signOut, useSession, organization, useListOrganizations, useActiveOrganization } = authClient

authClient.$store.listen('$sessionSignal', async () => {})
