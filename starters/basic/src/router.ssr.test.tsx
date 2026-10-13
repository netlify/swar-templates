// @vitest-environment node
import { renderToString } from 'react-dom/server'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { getRouter } from './router'
import { RouteErrorPage } from './components/error-pages'

it('uses the safe router default for child loader failures during SSR', async () => {
  const root = createRootRoute({ errorComponent: RouteErrorPage })
  const child = createRoute({
    getParentRoute: () => root,
    path: '/failure',
    loader: () => {
      throw new Error('Private loader diagnostics')
    },
    component: () => <h1>Loaded</h1>,
  })
  const router = createRouter({
    defaultErrorComponent: getRouter().options.defaultErrorComponent,
    routeTree: root.addChildren([child]),
    history: createMemoryHistory({ initialEntries: ['/failure'] }),
    isServer: true,
  })
  await router.load()
  const html = renderToString(<RouterProvider router={router} />)
  expect(html).toContain('This page couldn’t load')
  expect(html).not.toContain('Private loader diagnostics')
  expect(html).toContain('Go home')
})
