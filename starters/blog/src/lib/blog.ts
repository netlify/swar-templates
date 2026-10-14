import { notFound } from '@tanstack/react-router'

type PostSummary = { slug: string; date: string; categories: string[] }

export function newestPosts<T extends PostSummary>(posts: readonly T[]) {
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  )
}

export function getCategories(posts: readonly PostSummary[]) {
  return [...new Set(posts.flatMap((post) => post.categories))].sort((a, b) =>
    a.localeCompare(b),
  )
}

export function findPost<T extends PostSummary>(
  posts: readonly T[],
  slug: string,
) {
  const post = posts.find((post) => post.slug === slug)
  if (!post) throw notFound()
  return post
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
