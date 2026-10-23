import { createFileRoute, Link } from '@tanstack/react-router'
import { allBlogs } from 'content-collections'
import { Badge } from '../../components/ui/badge'
import { formatDate, newestPosts } from '../../lib/chronology'
import { pageMeta } from '../../lib/site'

export const Route = createFileRoute('/blog/')({
  component: BlogIndex,
  head: () =>
    pageMeta('Blog', 'Thoughts on web development, design, and technology.'),
})

function BlogIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Blog</h1>
      <p className="text-gray-600 mb-8">
        Thoughts on web development, design, and technology.
      </p>
      {allBlogs.length ? (
        <div className="space-y-6">
          {newestPosts(allBlogs).map((post) => (
            <article key={post.slug} className="rounded-xl border p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                <time dateTime={post.date}>{formatDate(post.date)}</time> ·{' '}
                {post.author}
              </p>
              <p className="text-gray-600 mb-4">{post.summary}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No posts published yet.</p>
      )}
    </div>
  )
}
