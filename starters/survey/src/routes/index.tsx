import { createFileRoute } from '@tanstack/react-router'
import SurveyForm from '../components/SurveyForm'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SurveyForm />
    </div>
  )
}
