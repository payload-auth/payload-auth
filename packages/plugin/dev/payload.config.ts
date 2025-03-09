import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { payloadBetterAuth } from 'payload-better-auth'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [],
  db: postgresAdapter({
    disableCreateDatabase: true,
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: false,
  }),
  editor: lexicalEditor(),
  plugins: [payloadBetterAuth({})],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
