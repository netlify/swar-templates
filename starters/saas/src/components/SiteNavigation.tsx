import { Link } from '@tanstack/react-router'
import { site } from '@/lib/content'

export function SiteNavigation() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <Link to="/" className="text-xl font-bold">
            {site.name}
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex flex-wrap items-center gap-5 text-sm font-semibold"
          >
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ 'aria-current': 'page' }}
            >
              Home
            </Link>
            <Link to="/" hash="pricing">
              Pricing
            </Link>
            <Link to="/faq" activeProps={{ 'aria-current': 'page' }}>
              FAQ
            </Link>
            <Link
              to="/contact"
              search={{ plan: 'starter' }}
              className="rounded-lg border px-4 py-2"
            >
              Enquire
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
