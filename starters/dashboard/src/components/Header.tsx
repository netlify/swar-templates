import { Link } from '@tanstack/react-router'
import HeaderNav from './HeaderNav'

interface HeaderProps {
  children?: React.ReactNode
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
      <nav className="flex items-center gap-4">{children ?? <HeaderNav />}</nav>
      <Link to="/" className="text-xl font-semibold">
        Dashboard
      </Link>
    </header>
  )
}
