import { defineCollection, defineConfig } from '@content-collections/core'
import {
  assertUniqueSlugs,
  postSchema,
  renderMarkdown,
  resolvePostSlug,
} from './src/lib/post-content'

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: postSchema,
  transform: async (doc) => {
    return {
      ...doc,
      slug: resolvePostSlug(doc.slug, doc._meta.path),
      categories: [...new Set(doc.categories)],
      image:
        doc.image &&
        !doc.image.startsWith('/') &&
        !doc.image.startsWith('https://')
          ? `/${doc.image}`
          : doc.image,
      html: renderMarkdown(doc.content),
    }
  },
  onSuccess: (documents) => assertUniqueSlugs(documents),
})

export default defineConfig({
  content: [posts],
})
