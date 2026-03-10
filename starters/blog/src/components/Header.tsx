import { Link } from '@tanstack/react-router'

import { allPosts } from 'content-collections'

export default function Header() {
  const categories = Array.from(
    new Set(allPosts.flatMap((post) => post.categories)),
  )

  return (
    <header className="border-b px-4 py-3 flex items-center gap-6">
      <Link to="/" className="font-semibold">
        Your Blog
      </Link>
      <nav className="flex gap-4 text-sm">
        {categories.map((category) => (
          <Link key={category} to={`/category/${category}`}>
            {category}
          </Link>
        ))}
      </nav>
    </header>
  )
}
