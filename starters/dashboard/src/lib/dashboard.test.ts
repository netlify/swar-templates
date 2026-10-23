import { describe, expect, it } from 'vitest'
import {
  formatConversion,
  sampleDashboardData,
  summarizeDashboard,
  type DashboardData,
} from './dashboard'

describe('dashboard summaries', () => {
  it('derives sample totals and the latest user snapshot', () => {
    expect(summarizeDashboard(sampleDashboardData)).toEqual({
      revenue: 266000,
      users: 7200,
      orders: 1840,
      visits: 56800,
      conversion: 1840 / 56800,
    })
    expect(formatConversion(1840 / 56800)).toBe('3.24%')
  })

  it('uses replacement data rather than fixed summary values', () => {
    const data: DashboardData = {
      isSample: false,
      period: 'Example period',
      months: [
        { label: 'First', revenue: 12, users: 7, visits: 40 },
        { label: 'Second', revenue: 18, users: 4, visits: 60 },
      ],
      categories: [{ name: 'Example category', orders: 9 }],
    }
    expect(summarizeDashboard(data)).toEqual({
      revenue: 30,
      users: 4,
      orders: 9,
      visits: 100,
      conversion: 0.09,
    })
  })

  it('distinguishes missing data from measured zero values', () => {
    expect(
      summarizeDashboard({
        ...sampleDashboardData,
        months: [],
        categories: [],
      }),
    ).toEqual({
      revenue: null,
      users: null,
      orders: null,
      visits: null,
      conversion: null,
    })
    const zero = summarizeDashboard({
      ...sampleDashboardData,
      months: [{ label: 'Jan', revenue: 0, users: 0, visits: 0 }],
      categories: [{ name: 'Example category', orders: 0 }],
    })
    expect(zero).toEqual({
      revenue: 0,
      users: 0,
      orders: 0,
      visits: 0,
      conversion: null,
    })
    expect(formatConversion(zero.conversion)).toBe('Unavailable')
  })
})
