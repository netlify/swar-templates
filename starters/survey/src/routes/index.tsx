import { createFileRoute } from '@tanstack/react-router'
import SurveyForm from '../components/SurveyForm'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-teal-900 via-emerald-800 to-cyan-900 flex items-center justify-center">
      <SurveyForm />
    </div>
  )
}
