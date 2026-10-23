export interface DashboardData {
  isSample: boolean
  period: string
  months: { label: string; revenue: number; users: number; visits: number }[]
  categories: { name: string; orders: number }[]
}

export type DashboardLoader = (signal: AbortSignal) => Promise<DashboardData>

export const sampleDashboardData: DashboardData = {
  isSample: true,
  period: 'January–December 2025',
  months: [
    { label: 'Jan', revenue: 12000, users: 1200, visits: 3000 },
    { label: 'Feb', revenue: 19000, users: 1900, visits: 3500 },
    { label: 'Mar', revenue: 15000, users: 2400, visits: 3800 },
    { label: 'Apr', revenue: 22000, users: 2800, visits: 4000 },
    { label: 'May', revenue: 18000, users: 3200, visits: 4200 },
    { label: 'Jun', revenue: 24000, users: 3900, visits: 4500 },
    { label: 'Jul', revenue: 20000, users: 4100, visits: 4800 },
    { label: 'Aug', revenue: 27000, users: 4800, visits: 5000 },
    { label: 'Sep', revenue: 23000, users: 5200, visits: 5300 },
    { label: 'Oct', revenue: 29000, users: 5900, visits: 5800 },
    { label: 'Nov', revenue: 25000, users: 6400, visits: 6000 },
    { label: 'Dec', revenue: 32000, users: 7200, visits: 6900 },
  ],
  categories: [
    { name: 'Electronics', orders: 644 },
    { name: 'Clothing', orders: 460 },
    { name: 'Home & Garden', orders: 368 },
    { name: 'Books', orders: 221 },
    { name: 'Sports', orders: 147 },
  ],
}

export const loadDashboardData: DashboardLoader = async () =>
  sampleDashboardData

export function summarizeDashboard(data: DashboardData) {
  const revenue = data.months.reduce((total, month) => total + month.revenue, 0)
  const visits = data.months.reduce((total, month) => total + month.visits, 0)
  const orders = data.categories.reduce(
    (total, category) => total + category.orders,
    0,
  )
  return {
    revenue: data.months.length ? revenue : null,
    users: data.months.at(-1)?.users ?? null,
    orders: data.categories.length ? orders : null,
    visits: data.months.length ? visits : null,
    conversion: visits > 0 && data.categories.length ? orders / visits : null,
  }
}

export const formatCount = (value: number | null) =>
  value === null ? 'Unavailable' : new Intl.NumberFormat('en-US').format(value)

export const formatRevenue = (value: number | null) =>
  value === null
    ? 'Unavailable'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)

export const formatConversion = (value: number | null) =>
  value === null
    ? 'Unavailable'
    : new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 2,
      }).format(value)
