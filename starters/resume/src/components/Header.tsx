import { Link } from '@tanstack/react-router'
import { Briefcase } from 'lucide-react'
import HeaderNav from './HeaderNav'
import { showResumeAssistant } from './ResumeAssistant'

interface HeaderProps {
  children?: React.ReactNode
}

export default function Header({ children }: HeaderProps) {
  const handleToggleAssistant = () => {
    showResumeAssistant.setState((prev) => !prev)
  }

  return (
    <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
      <nav className="flex items-center gap-4">{children ?? <HeaderNav />}</nav>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-semibold">
          Netlify TanStack Start
        </Link>
        <button
          onClick={handleToggleAssistant}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          title="Toggle Resume Assistant"
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      </div>
    </header>
  )
}
