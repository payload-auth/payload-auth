//@ts-nocheck
import type { Metadata } from 'next'
import { generateMetadata, type GenerateViewMetadata } from '../../utils/generate-metadata'

export const generateResetPasswordViewMetadata: GenerateViewMetadata = async ({ config, i18n: { t } }): Promise<Metadata> =>
  generateMetadata({
    description: t('authentication:resetPassword'),
    keywords: t('authentication:resetPassword'),
    serverURL: config.serverURL,
    title: t('authentication:resetPassword'),
    ...(config.admin.meta || {})
  })
