import { createFileRoute } from '@tanstack/react-router'
import Calculator from '../components/Calculator'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Calculator />
    </div>
  )
}
