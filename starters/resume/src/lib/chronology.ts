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

export function formatResumeDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
