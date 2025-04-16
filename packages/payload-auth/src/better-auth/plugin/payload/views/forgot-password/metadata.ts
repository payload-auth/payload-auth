//@ts-nocheck
import type { Metadata } from 'next'
import { generateMetadata, type GenerateViewMetadata } from '@/better-auth/plugin/payload/utils/generate-metadata'

export const generateForgotPasswordViewMetadata: GenerateViewMetadata = async ({ config, i18n: { t } }): Promise<Metadata> =>
  generateMetadata({
    description: t('authentication:forgotPassword'),
    keywords: t('authentication:forgotPassword'),
    serverURL: config.serverURL,
    title: t('authentication:forgotPassword'),
    ...(config.admin.meta || {})
  })
