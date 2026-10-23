import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Page not found</h1>
      <p className="mb-6">This page or blog post could not be found.</p>
      <Link to="/" className="underline">
        Back to portfolio
      </Link>
    </div>
  )
}
