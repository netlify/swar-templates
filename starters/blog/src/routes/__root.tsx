import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { siteName, siteDescription } from '@/lib/site'

import '../styles.css'

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Page not found</h1>
      <p className="mb-4">That post or page does not exist.</p>
      <Link to="/" className="underline">
        Browse all posts
      </Link>
    </div>
  ),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <header className="max-w-2xl mx-auto px-4 pt-6">
          <Link to="/" className="font-semibold">
            {siteName}
          </Link>
        </header>
        <main id="main-content">{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
