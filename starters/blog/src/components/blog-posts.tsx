import { Link } from '@tanstack/react-router'

import { type Post } from 'content-collections'
import { formatDate, newestPosts } from '@/lib/blog'
import { CategoryLinks } from './category-links'

export default function BlogPosts({
  title,
  posts,
  categories,
  selectedCategory,
}: {
  title: string
  posts: Post[]
  categories: string[]
  selectedCategory?: string
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <CategoryLinks categories={categories} selected={selectedCategory} />
      {!posts.length && (
        <div className="mt-8">
          <p>
            {selectedCategory
              ? `No posts in ${selectedCategory} yet.`
              : 'No posts published yet. Check back soon.'}
          </p>
          {selectedCategory && (
            <Link to="/" className="mt-4 inline-block underline">
              Browse all posts
            </Link>
          )}
        </div>
      )}
      <div className="space-y-8 mt-8">
        {newestPosts(posts).map((post) => (
          <article key={post.slug}>
            {post.image && (
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  width={800}
                  height={450}
                  className="mb-4 aspect-video w-full rounded-lg object-cover"
                />
              </Link>
            )}
            <h2 className="text-xl font-semibold">
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                className="hover:underline"
              >
                {post.title}
              </Link>
            </h2>
            <time
              dateTime={post.date}
              className="block text-sm text-gray-500 mt-1"
            >
              {formatDate(post.date)}
            </time>
            <p className="mt-2 text-gray-700">{post.summary}</p>
            <div className="mt-3">
              <CategoryLinks categories={post.categories} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
