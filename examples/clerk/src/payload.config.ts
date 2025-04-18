import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { usersCollection } from './payload/collections/users'
import { pagesCollection } from './payload/collections/pages'
import { clerkPlugin } from 'payload-auth/clerk'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const allowedOrigins = [process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [usersCollection, pagesCollection],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!
  }),
  // db: postgresAdapter({
  //   disableCreateDatabase: false,
  //   pool: {
  //     connectionString: process.env.DATABASE_URI,
  //   },
  //   push: false, // Should be false (this is just for demo purposes)
  //   migrationDir: path.resolve(dirname, "lib/migrations"),
  // }),
  editor: lexicalEditor(),
  plugins: [
    clerkPlugin({
      webhook: {
        svixSecret: process.env.CLERK_WEBHOOK_SECRET!
      }
    })
  ],
  secret: process.env.PAYLOAD_SECRET!,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  }
})
