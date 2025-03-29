import { generateSchema } from 'payload-auth/better-auth/adapter'
import { betterAuthOptions } from '@/lib/auth/options'

await generateSchema(betterAuthOptions, {
  outputDir: './src/payload/schema'
})
  .then(() => {
    console.log('Schema generated successfully')
    process.exit(0)
  })
  .catch((err: any) => {
    console.error('Error generating schema', err)
    process.exit(1)
  })
