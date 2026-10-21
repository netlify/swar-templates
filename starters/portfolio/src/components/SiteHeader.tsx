import { Link } from '@tanstack/react-router'
import { site } from '../lib/site'

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Work' },
  { to: '/resume', label: 'Résumé' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
] as const

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="font-bold text-xl">
          {site.name}
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap gap-x-5 gap-y-3"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === '/' }}
              activeProps={{
                className: 'font-semibold underline underline-offset-4',
              }}
              className="text-sm rounded focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
