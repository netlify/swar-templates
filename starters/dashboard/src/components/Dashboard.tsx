import { useEffect, useState } from 'react'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import {
  formatConversion,
  formatCount,
  formatRevenue,
  loadDashboardData,
  summarizeDashboard,
  type DashboardData,
  type DashboardLoader,
} from '../lib/dashboard'
import { DashboardCharts } from './DashboardCharts'

type DashboardState =
  { status: 'loading' | 'error' } | { status: 'ready'; data: DashboardData }

export function Dashboard({
  loadData = loadDashboardData,
}: {
  loadData?: DashboardLoader
}) {
  const [state, setState] = useState<DashboardState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    async function load() {
      try {
        const data = await loadData(controller.signal)
        if (!controller.signal.aborted) setState({ status: 'ready', data })
      } catch {
        if (!controller.signal.aborted) setState({ status: 'error' })
      }
    }
    void load()
    return () => controller.abort()
  }, [loadData, attempt])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Explore revenue, users, and orders for the displayed period.
        </p>
        {state.status === 'loading' && (
          <section aria-label="Dashboard data" aria-busy="true">
            <p role="status" className="mb-6 text-gray-600">
              Loading dashboard…
            </p>
            <div
              aria-hidden="true"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-32 rounded-xl bg-gray-200 animate-pulse motion-reduce:animate-none"
                />
              ))}
            </div>
          </section>
        )}
        {state.status === 'error' && (
          <div className="rounded-xl bg-white shadow-sm p-6">
            <p role="alert" className="mb-4">
              We couldn’t load the dashboard. Please try again.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="rounded-lg border px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
        {state.status === 'ready' && <DashboardContent data={state.data} />}
      </div>
    </main>
  )
}

function DashboardContent({ data }: { data: DashboardData }) {
  const summary = summarizeDashboard(data)
  const stats = [
    {
      title: 'Total Revenue',
      value: formatRevenue(summary.revenue),
      note: 'Across displayed months',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Users',
      value: formatCount(summary.users),
      note: 'At the end of the latest month',
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      title: 'Orders',
      value: formatCount(summary.orders),
      note: 'Across displayed categories',
      icon: ShoppingCart,
      color: 'bg-amber-500',
    },
    {
      title: 'Conversion Rate',
      value: formatConversion(summary.conversion),
      note: `${formatCount(summary.orders)} orders / ${formatCount(summary.visits)} visits`,
      icon: TrendingUp,
      color: 'bg-violet-500',
    },
  ]

  return (
    <>
      <p className="mb-6 text-sm text-gray-600">
        {data.isSample
          ? 'Sample data. Illustrative values, not live business metrics. '
          : ''}
        {data.period}
      </p>
      {data.months.length === 0 && data.categories.length === 0 ? (
        <div role="status" className="rounded-xl bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">
            No data for this period
          </h2>
          <p>There are no monthly metrics or category orders to display.</p>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="min-w-0 bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
              >
                <div className={`${stat.color} p-3 rounded-lg shrink-0`}>
                  <stat.icon
                    aria-hidden="true"
                    className="w-6 h-6 text-white"
                  />
                </div>
                <div className="min-w-0 break-words">
                  <dt className="text-sm text-gray-500">{stat.title}</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </dd>
                  <dd className="text-sm text-gray-600">{stat.note}</dd>
                </div>
              </div>
            ))}
          </dl>
          <DashboardCharts data={data} />
        </>
      )}
    </>
  )
}
