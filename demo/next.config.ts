import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true
  },
  devIndicators: {
    position: 'bottom-right'
  }
}

export default withPayload(nextConfig)
