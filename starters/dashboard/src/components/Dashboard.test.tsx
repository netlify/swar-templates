import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Dashboard } from './Dashboard'
import {
  sampleDashboardData,
  type DashboardData,
  type DashboardLoader,
} from '../lib/dashboard'

vi.mock('react-chartjs-2', () => {
  function Chart({
    data,
    'aria-label': label,
  }: {
    data: unknown
    'aria-label': string
  }) {
    return (
      <canvas role="img" aria-label={label} data-chart={JSON.stringify(data)} />
    )
  }
  return { Bar: Chart, Line: Chart, Doughnut: Chart }
})

afterEach(cleanup)

describe('dashboard states', () => {
  it('shows loading until data is ready, then labels the sample', async () => {
    let resolve!: (data: DashboardData) => void
    render(
      <Dashboard
        loadData={() =>
          new Promise((done) => {
            resolve = done
          })
        }
      />,
    )
    expect(screen.getByRole('status').textContent).toContain(
      'Loading dashboard',
    )
    expect(screen.queryByRole('img')).toBeNull()
    await act(async () => resolve(sampleDashboardData))
    expect(
      screen.getByText(/Sample data. Illustrative values/).textContent,
    ).toContain('January–December 2025')
    expect(screen.getAllByRole('img')).toHaveLength(3)
    expect(screen.queryByText(/\+12.5%/)).toBeNull()
  })

  it('shows failures and reloads data when retry is clicked', async () => {
    const load = vi
      .fn<DashboardLoader>()
      .mockRejectedValueOnce(new Error('Example failure'))
      .mockResolvedValueOnce(sampleDashboardData)
    render(<Dashboard loadData={load} />)
    expect((await screen.findByRole('alert')).textContent).toContain(
      'couldn’t load',
    )
    expect(screen.queryByRole('img')).toBeNull()
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByText('$266,000')
    expect(load).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders an empty state instead of invented summaries or charts', async () => {
    render(
      <Dashboard
        loadData={async () => ({
          ...sampleDashboardData,
          months: [],
          categories: [],
        })}
      />,
    )
    await screen.findByRole('heading', { name: 'No data for this period' })
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.queryByText('Total Revenue')).toBeNull()
  })

  it('uses the same replacement values in cards, charts and accessible tables', async () => {
    const replacement: DashboardData = {
      isSample: false,
      period: 'Example period',
      months: [{ label: 'Example month', revenue: 125, users: 7, visits: 100 }],
      categories: [{ name: 'Example category', orders: 4 }],
    }
    render(<Dashboard loadData={async () => replacement} />)
    await screen.findByText('$125', { selector: 'dd' })
    expect(screen.getByText('7', { selector: 'dd' })).toBeTruthy()
    expect(screen.getByText('4%')).toBeTruthy()
    expect(screen.queryByText(/Sample data/)).toBeNull()
    const revenue = screen.getByRole('region', { name: 'Monthly Revenue' })
    expect(
      JSON.parse(within(revenue).getByRole('img').getAttribute('data-chart')!)
        .datasets[0].data,
    ).toEqual([125])
    const users = screen.getByRole('region', { name: 'User Growth' })
    expect(
      JSON.parse(within(users).getByRole('img').getAttribute('data-chart')!)
        .datasets[0].data,
    ).toEqual([7])
    const orders = screen.getByRole('region', { name: 'Orders by Category' })
    expect(
      JSON.parse(within(orders).getByRole('img').getAttribute('data-chart')!)
        .datasets[0].data,
    ).toEqual([4])
    const user = userEvent.setup()
    for (const section of [revenue, users, orders]) {
      await user.click(within(section).getByText(/^View .* data$/))
      expect(within(section).getByRole('table')).toBeTruthy()
    }
    expect(
      within(revenue).getByRole('row', { name: 'Example month $125' }),
    ).toBeTruthy()
    expect(
      within(users).getByRole('row', { name: 'Example month 7' }),
    ).toBeTruthy()
    expect(
      within(orders).getByRole('row', { name: 'Example category 4' }),
    ).toBeTruthy()
  })

  it('keeps available charts when category data is missing', async () => {
    render(
      <Dashboard
        loadData={async () => ({ ...sampleDashboardData, categories: [] })}
      />,
    )
    await screen.findByText('$266,000')
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByText('No category data for this period.')).toBeTruthy()
    expect(screen.getAllByText('Unavailable')).toHaveLength(2)
  })

  it('shows zero orders with a table instead of an empty doughnut', async () => {
    render(
      <Dashboard
        loadData={async () => ({
          ...sampleDashboardData,
          categories: [{ name: 'Example category', orders: 0 }],
        })}
      />,
    )
    await screen.findByText('No orders for this period.')
    expect(screen.getAllByRole('img')).toHaveLength(2)
    await userEvent
      .setup()
      .click(screen.getByText('View orders by category data'))
    expect(screen.getByRole('row', { name: 'Example category 0' })).toBeTruthy()
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('aborts replaced requests and ignores their late responses', async () => {
    let resolve!: (data: DashboardData) => void
    const oldLoader = vi.fn<DashboardLoader>().mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const { rerender, unmount } = render(<Dashboard loadData={oldLoader} />)
    const nextLoader = vi
      .fn<DashboardLoader>()
      .mockResolvedValue({ ...sampleDashboardData, months: [], categories: [] })
    rerender(<Dashboard loadData={nextLoader} />)
    await screen.findByRole('heading', { name: 'No data for this period' })
    expect(oldLoader.mock.calls[0][0].aborted).toBe(true)
    await act(async () => resolve(sampleDashboardData))
    expect(screen.queryByText('$266,000')).toBeNull()
    unmount()
    expect(nextLoader.mock.calls[0][0].aborted).toBe(true)
  })
})
