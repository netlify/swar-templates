import { createFileRoute, Link } from '@tanstack/react-router'
import { findPost, formatDate } from '@/lib/blog'
import { siteName } from '@/lib/site'
import { CategoryLinks } from '@/components/category-links'

import { allPosts } from 'content-collections'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    return findPost(allPosts, params.slug)
  },
  head: ({ loaderData: post }) => ({
    meta: post
      ? [
          { title: `${post.title} | ${siteName}` },
          { name: 'description', content: post.summary },
          { property: 'og:title', content: post.title },
          { property: 'og:description', content: post.summary },
          { property: 'og:type', content: 'article' },
          {
            property: 'article:published_time',
            content: `${post.date}T00:00:00Z`,
          },
          ...post.categories.map((category) => ({
            property: 'article:tag',
            content: category,
          })),
        ]
      : [],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const post = Route.useLoaderData()

  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="mb-6 inline-block underline">
        All posts
      </Link>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <time dateTime={post.date} className="block text-sm text-gray-500 mb-4">
        {formatDate(post.date)}
      </time>
      <CategoryLinks categories={post.categories} />
      <p className="my-6 text-gray-600">{post.summary}</p>
      {post.image && (
        <img
          src={post.image}
          alt={post.imageAlt ?? post.title}
          width={800}
          height={450}
          className="mb-8 aspect-video w-full rounded-lg object-cover"
        />
      )}
      <div
        className="prose max-w-none prose-pre:overflow-x-auto prose-img:rounded-lg break-words"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  )
}
