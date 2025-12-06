import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { BasePayload, buildConfig, EmailAdapter } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import collections from './payload/collections'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { plugins } from './payload/plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const allowedOrigins = [process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean)

function emailAdapter({ payload }: { payload: BasePayload }): {
  defaultFromAddress: string
  defaultFromName: string
  name: string
  sendEmail: (message: any) => Promise<any>
} {
  return {
    defaultFromAddress: 'no-reply@example.com',
    defaultFromName: 'Payload Demo',
    name: 'demo-email-adapter',
    sendEmail: async (message) => {
      // Implement actual email sending logic here
      console.log('Email would be sent:', message)
      return { message: 'Email sent successfully' }
    }
  }
}

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI
  }),
  email: emailAdapter,
  editor: lexicalEditor(),
  plugins,
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  cors: allowedOrigins,
  csrf: allowedOrigins,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  }
})
