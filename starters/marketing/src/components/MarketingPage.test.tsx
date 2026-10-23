import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MarketingPage } from './MarketingPage'
import { site } from '../data/site'

beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  site.showCatalog = true
})

function renderPage() {
  const root = createRootRoute()
  const route = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: MarketingPage,
  })
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)
}

it('opens the enquiry with the clicked product selected without losing contact details', async () => {
  renderPage()
  await screen.findByRole('heading', {
    name: 'A place for everything on your desk.',
  })
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Name'), 'Jane Doe')
  const link = screen.getByRole('link', { name: 'Enquire about cable tray' })
  expect(link.getAttribute('href')).toBe('#enquiry')
  await user.click(link)
  expect((screen.getByLabelText('Product') as HTMLSelectElement).value).toBe(
    '2',
  )
  expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
    'Jane Doe',
  )
})

it('keeps benefits and the enquiry action when the catalogue is hidden', async () => {
  site.showCatalog = false
  renderPage()
  await screen.findByRole('heading', { name: 'Start with what you need' })
  expect(
    screen.queryByRole('heading', { name: 'Explore the collection' }),
  ).toBeNull()
  expect(
    screen
      .getByRole('link', { name: 'Discuss your workspace' })
      .getAttribute('href'),
  ).toBe('#enquiry')
  expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeTruthy()
})
