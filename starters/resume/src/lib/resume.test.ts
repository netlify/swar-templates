import { describe, expect, it } from 'vitest'
import { chronologicalEntries, formatResumeDate } from './chronology'
import { profileSchema } from './profile'
import {
  jobSchema,
  educationSchema,
  renderResumeMarkdown,
} from './resume-content'

const profile = {
  name: 'Jane Doe',
  headline: 'Developer',
  summary: 'Example summary.',
}
const job = {
  jobTitle: 'Developer',
  company: 'Example Company',
  summary: 'Example summary.',
  startDate: '2022-01-01',
  content: '',
}

describe('resume data', () => {
  it('allows a profile without optional contacts, links, photo, or skills', () => {
    expect(profileSchema.parse(profile)).toEqual({
      ...profile,
      links: [],
      skills: [],
    })
  })
  it.each(['javascript:alert(1)', 'data:text/html,test', 'not-a-url'])(
    'rejects unsafe or invalid contact URL %j',
    (url) => {
      expect(
        profileSchema.safeParse({
          ...profile,
          links: [{ label: 'Website', url }],
        }).success,
      ).toBe(false)
    },
  )
  it('validates optional email, phone, and photo fields', () => {
    expect(
      profileSchema.safeParse({ ...profile, email: 'invalid', phone: '     ' })
        .success,
    ).toBe(false)
    expect(
      profileSchema.safeParse({
        ...profile,
        photo: { src: 'javascript:alert(1)', alt: 'Example' },
      }).success,
    ).toBe(false)
    expect(
      profileSchema.safeParse({
        ...profile,
        email: 'jane@example.com',
        phone: '+1 (202) 555-0123',
        photo: { src: '/headshot-on-white.jpg', alt: 'Example' },
      }).success,
    ).toBe(true)
  })
  it('puts ongoing entries first, then newest starts, with stable file-path ties, without mutating input', () => {
    const entries = [
      { startDate: '2023-01-01', endDate: '2023-12-31', _meta: { path: 'z' } },
      { startDate: '2020-01-01', _meta: { path: 'current' } },
      { startDate: '2023-01-01', endDate: '2023-12-31', _meta: { path: 'a' } },
      {
        startDate: '2021-01-01',
        endDate: '2022-01-01',
        _meta: { path: 'old' },
      },
    ]
    expect(
      chronologicalEntries(entries).map((entry) => entry._meta.path),
    ).toEqual(['current', 'a', 'z', 'old'])
    expect(entries[0]?._meta.path).toBe('z')
    expect(chronologicalEntries([])).toEqual([])
  })
  it.each(['2025-02-30', 'invalid', '2025-13-01'])(
    'rejects invalid dates %j',
    (startDate) => {
      expect(jobSchema.safeParse({ ...job, startDate }).success).toBe(false)
    },
  )
  it('rejects backwards date ranges for both collections and accepts ongoing entries', () => {
    expect(jobSchema.safeParse({ ...job, endDate: '2021-01-01' }).success).toBe(
      false,
    )
    expect(
      educationSchema.safeParse({
        school: 'Example School',
        summary: 'Example degree',
        content: '',
        startDate: '2022-01-01',
        endDate: '2021-01-01',
      }).success,
    ).toBe(false)
    expect(jobSchema.parse(job).tags).toEqual([])
  })
  it('formats calendar months in UTC', () => {
    expect(formatResumeDate('2025-03-01')).toBe('Mar 2025')
  })
  it('renders Markdown while stripping unsafe HTML and URLs', () => {
    const html = renderResumeMarkdown(
      '## Achievements\n\n- Built a tool\n\n[Website](https://example.com)\n\n<script>alert(1)</script><a href="javascript:alert(1)">Bad</a>',
    )
    expect(html).toContain('<h2>Achievements</h2>')
    expect(html).toContain('<ul>')
    expect(html).toContain('href="https://example.com"')
    expect(html).not.toMatch(/script|javascript:/)
  })
})
