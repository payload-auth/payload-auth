import { defineDocs, defineConfig, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
import { remarkInstall } from 'fumadocs-docgen'
import { z } from 'zod'

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: false,
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false)
    })
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional()
    })
  }
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [
        remarkInstall,
        {
          persist: {
            id: 'persist-install'
          }
        }
      ]
    ]
  }
})
