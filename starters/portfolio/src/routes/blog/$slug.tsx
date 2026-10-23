import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { allBlogs } from 'content-collections'
import { Badge } from '../../components/ui/badge'
import { formatDate } from '../../lib/chronology'
import { pageMeta } from '../../lib/site'

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = allBlogs.find((entry) => entry.slug === params.slug)
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) =>
    loaderData ? pageMeta(loaderData.title, loaderData.summary) : {},
  component: BlogPost,
})

function BlogPost() {
  const post = Route.useLoaderData()
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/blog" className="inline-block underline mb-8">
        Back to blog
      </Link>
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-500 mb-4">
            <time dateTime={post.date}>{formatDate(post.date)}</time> ·{' '}
            {post.author}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </header>
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </div>
  )
}
