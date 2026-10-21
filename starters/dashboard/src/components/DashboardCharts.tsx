import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  formatCount,
  formatRevenue,
  type DashboardData,
} from '../lib/dashboard'
import { ChartPanel } from './ChartPanel'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

export function DashboardCharts({ data }: { data: DashboardData }) {
  const labels = data.months.map((month) => month.label)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartPanel
        title="Monthly Revenue"
        column="Month"
        metric="Revenue (USD)"
        rows={data.months.map((month) => [
          month.label,
          formatRevenue(month.revenue),
        ])}
      >
        <Bar
          role="img"
          aria-label="Monthly revenue chart. Data available in the table below."
          data={{
            labels,
            datasets: [
              {
                label: 'Revenue (USD)',
                data: data.months.map((month) => month.revenue),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 6,
              },
            ],
          }}
          options={options}
        />
      </ChartPanel>
      <ChartPanel
        title="User Growth"
        column="Month"
        metric="Users at month end"
        rows={data.months.map((month) => [
          month.label,
          formatCount(month.users),
        ])}
      >
        <Line
          role="img"
          aria-label="User growth chart. Data available in the table below."
          data={{
            labels,
            datasets: [
              {
                label: 'Users at month end',
                data: data.months.map((month) => month.users),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(16, 185, 129)',
              },
            ],
          }}
          options={options}
        />
      </ChartPanel>
      <ChartPanel
        title="Orders by Category"
        column="Category"
        metric="Orders"
        rows={data.categories.map((category) => [
          category.name,
          formatCount(category.orders),
        ])}
      >
        {data.categories.some((category) => category.orders > 0) ? (
          <Doughnut
            role="img"
            aria-label="Orders by category chart. Data available in the table below."
            data={{
              labels: data.categories.map((category) => category.name),
              datasets: [
                {
                  label: 'Orders',
                  data: data.categories.map((category) => category.orders),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                  ],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: { legend: { position: 'bottom' } },
            }}
          />
        ) : (
          <p className="text-gray-600">No orders for this period.</p>
        )}
      </ChartPanel>
    </div>
  )
}
