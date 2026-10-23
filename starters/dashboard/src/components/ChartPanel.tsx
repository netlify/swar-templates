import type { ReactNode } from 'react'

export function ChartPanel({
  title,
  children,
  rows,
  column,
  metric,
}: {
  title: string
  children: ReactNode
  rows: [string, string][]
  column: string
  metric: string
}) {
  return (
    <section
      aria-label={title}
      className="min-w-0 bg-white rounded-xl shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {rows.length ? (
        <>
          <div className="relative h-72 w-full">{children}</div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium underline rounded focus-visible:outline-2 focus-visible:outline-offset-2">
              View {title.toLowerCase()} data
            </summary>
            <table className="w-full mt-4 text-sm text-left">
              <caption className="sr-only">{title} data</caption>
              <thead>
                <tr>
                  <th scope="col" className="py-2">
                    {column}
                  </th>
                  <th scope="col" className="py-2 text-right">
                    {metric}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label} className="border-t border-gray-100">
                    <th scope="row" className="py-2 font-normal break-words">
                      {label}
                    </th>
                    <td className="py-2 text-right tabular-nums">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : (
        <p className="text-gray-600">
          No {column === 'Month' ? 'monthly' : 'category'} data for this period.
        </p>
      )}
    </section>
  )
}
