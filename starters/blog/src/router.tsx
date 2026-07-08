import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">This page could not be found.</p>
      <a href="/" className="text-blue-600 underline hover:text-blue-800">
        Go back home
      </a>
    </div>
  )
}

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
  })

  return router
}
