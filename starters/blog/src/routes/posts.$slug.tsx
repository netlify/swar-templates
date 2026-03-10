import { createFileRoute } from '@tanstack/react-router'
import { marked } from 'marked'

import { allPosts } from 'content-collections'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const post = allPosts.find((post) => post.slug === params.slug)
    if (!post) {
      throw new Error('Post not found')
    }
    return post
  },
  component: RouteComponent,
})

function RouteComponent() {
  const post = Route.useLoaderData()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">{post.date}</p>
      <p className="mb-8 text-gray-600">{post.summary}</p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: marked(post.content) }}
      />
    </div>
  )
}
