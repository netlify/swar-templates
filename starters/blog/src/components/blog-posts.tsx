import { Link } from '@tanstack/react-router'

import { type Post } from 'content-collections'

export default function BlogPosts({
  title,
  posts,
}: {
  title: string
  posts: Post[]
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <Link to={`/posts/${post.slug}`} key={post._meta.path} className="block">
            <article>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{post.date}</p>
              <p className="mt-2 text-gray-700">{post.summary}</p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
