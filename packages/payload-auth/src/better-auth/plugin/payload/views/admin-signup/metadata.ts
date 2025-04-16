//@ts-nocheck
import type { Metadata } from 'next'
import { generateMetadata, type GenerateViewMetadata } from '@/better-auth/plugin/payload/utils/generate-metadata'

export const generateAdminSignupViewMetadata: GenerateViewMetadata = async ({ config, i18n: { t } }): Promise<Metadata> =>
  generateMetadata({
    description: t('authentication:login'),
    keywords: t('authentication:login'),
    serverURL: config.serverURL,
    title: t('authentication:login'),
    ...(config.admin.meta || {})
  })
