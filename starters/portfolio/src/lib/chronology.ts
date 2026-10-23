type DatedEntry = {
  startDate: string
  endDate?: string
  _meta: { path: string }
}

export function chronologicalEntries<T extends DatedEntry>(
  entries: readonly T[],
) {
  return [...entries].sort(
    (a, b) =>
      Number(!b.endDate) - Number(!a.endDate) ||
      b.startDate.localeCompare(a.startDate) ||
      (b.endDate ?? '').localeCompare(a.endDate ?? '') ||
      a._meta.path.localeCompare(b._meta.path),
  )
}

export function newestPosts<T extends { date: string; slug: string }>(
  posts: readonly T[],
) {
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  )
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}
