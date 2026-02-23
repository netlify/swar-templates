import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export const Route = createFileRoute('/')({
  component: Home,
})

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const revenueData = {
  labels: months,
  datasets: [
    {
      label: 'Revenue ($)',
      data: [
        12000, 19000, 15000, 22000, 18000, 24000, 20000, 27000, 23000, 29000,
        25000, 32000,
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderRadius: 6,
    },
  ],
}

const userGrowthData = {
  labels: months,
  datasets: [
    {
      label: 'Users',
      data: [
        1200, 1900, 2400, 2800, 3200, 3900, 4100, 4800, 5200, 5900, 6400, 7200,
      ],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(16, 185, 129)',
    },
  ],
}

const salesCategoryData = {
  labels: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'],
  datasets: [
    {
      data: [35, 25, 20, 12, 8],
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
}

const stats = [
  {
    title: 'Total Revenue',
    value: '$266,000',
    change: '+12.5%',
    icon: DollarSign,
    color: 'bg-blue-500',
  },
  {
    title: 'Total Users',
    value: '7,200',
    change: '+8.2%',
    icon: Users,
    color: 'bg-emerald-500',
  },
  {
    title: 'Orders',
    value: '1,840',
    change: '+5.1%',
    icon: ShoppingCart,
    color: 'bg-amber-500',
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '+1.8%',
    icon: TrendingUp,
    color: 'bg-violet-500',
  },
]

function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Analytics Dashboard
        </h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
            >
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-emerald-600 font-medium">
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {mounted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Revenue
              </h2>
              <Bar
                data={revenueData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Growth
              </h2>
              <Line
                data={userGrowthData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sales by Category
              </h2>
              <div className="max-w-sm mx-auto">
                <Doughnut
                  data={salesCategoryData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
