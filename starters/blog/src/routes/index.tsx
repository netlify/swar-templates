import { createFileRoute } from '@tanstack/react-router'

import { allPosts } from 'content-collections'

import BlogPosts from '@/components/blog-posts'
import { getCategories } from '@/lib/blog'
import { siteName } from '@/lib/site'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <BlogPosts
      title={siteName}
      posts={allPosts}
      categories={getCategories(allPosts)}
    />
  )
}
