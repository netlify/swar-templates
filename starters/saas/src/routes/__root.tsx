import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { SiteNavigation } from '@/components/SiteNavigation'
import { site } from '@/lib/content'
import '../styles.css'

const siteName = site.name
const siteDescription = site.description

export const Route = createRootRoute({
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
      <body>
        <SiteNavigation />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="border-t px-4 py-10 text-center text-sm">
          {site.name} · Example plans and enquiries
        </footer>
        <Scripts />
      </body>
    </html>
  )
}
