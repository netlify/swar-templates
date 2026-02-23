import { createFileRoute } from '@tanstack/react-router'

import { allPosts } from 'content-collections'

import BlogPosts from '@/components/blog-posts'

export const Route = createFileRoute('/category/$category')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const category = params.category
    const posts = allPosts.filter((post) => post.categories.includes(category))
    return { category, posts }
  },
})

function RouteComponent() {
  const { category, posts } = Route.useLoaderData()
  return <BlogPosts title={category} posts={posts} />
}
