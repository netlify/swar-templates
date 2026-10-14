import { Link } from '@tanstack/react-router'

export function CategoryLinks({
  categories,
  selected,
}: {
  categories: string[]
  selected?: string
}) {
  if (!categories.length) return null
  return (
    <nav
      aria-label="Categories"
      className="flex flex-wrap gap-x-4 gap-y-2 text-sm"
    >
      {categories.map((category) => (
        <Link
          key={category}
          to="/category/$category"
          params={{ category }}
          aria-current={selected === category ? 'page' : undefined}
          className="underline underline-offset-4"
        >
          {category}
        </Link>
      ))}
    </nav>
  )
}
