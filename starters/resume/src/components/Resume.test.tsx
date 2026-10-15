import { afterEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import type { Job, Education } from 'content-collections'
import Resume from './Resume'
import { profileSchema } from '@/lib/profile'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const profile = profileSchema.parse({
  name: 'Jane Doe',
  headline: 'Developer',
  summary: 'Example summary.',
})
const meta = (path: string) => ({
  path,
  filePath: `${path}.md`,
  fileName: `${path}.md`,
  extension: 'md',
  directory: '.',
})
const job = (path: string, company: string, startDate: string): Job => ({
  _meta: meta(path),
  jobTitle: 'Developer',
  company,
  startDate,
  summary: `Work at ${company}`,
  tags: ['TypeScript', 'TypeScript'],
  content: '',
  html: '<ul><li>Built a tool</li></ul>',
})
const education: Education = {
  _meta: meta('school'),
  school: 'Example School',
  summary: 'Example degree',
  startDate: '2020-01-01',
  endDate: '2020-12-31',
  tags: ['Writing'],
  content: '',
  html: '<p>Example coursework</p>',
}

it('renders structured contacts, profile skills, education dates/tags, and Markdown', () => {
  const contacts = profileSchema.parse({
    ...profile,
    location: 'Remote',
    email: 'jane@example.com',
    phone: '+1 (202) 555-0123',
    links: [{ label: 'Portfolio', url: 'https://example.com' }],
    skills: ['React'],
  })
  render(<Resume profile={contacts} jobs={[]} education={[education]} />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Jane Doe')
  expect(
    screen.getByRole('link', { name: 'jane@example.com' }).getAttribute('href'),
  ).toBe('mailto:jane@example.com')
  expect(
    screen
      .getByRole('link', { name: '+1 (202) 555-0123' })
      .getAttribute('href'),
  ).toBe('tel:+12025550123')
  expect(
    screen.getByRole('link', { name: 'Portfolio' }).getAttribute('href'),
  ).toBe('https://example.com')
  expect(screen.getByRole('list', { name: 'Profile skills' }).textContent).toBe(
    'React',
  )
  expect(screen.getByText('Jan 2020').getAttribute('datetime')).toBe(
    '2020-01-01',
  )
  expect(screen.getByText('Dec 2020').getAttribute('datetime')).toBe(
    '2020-12-31',
  )
  expect(
    screen.getByRole('list', { name: 'Skills from Example School' })
      .textContent,
  ).toBe('Writing')
  expect(screen.getByText('Example coursework')).toBeTruthy()
})

it('sorts repeated titles and keeps stable record keys through date changes', () => {
  const error = vi.spyOn(console, 'error')
  const jobs = [
    job('older', 'Company One', '2021-01-01'),
    job('newer', 'Company Two', '2023-01-01'),
  ]
  const view = render(<Resume profile={profile} jobs={jobs} education={[]} />)
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  const before = screen.getAllByRole('article')
  expect(within(before[0]!).getByText('Company Two')).toBeTruthy()
  expect(within(before[0]!).getAllByText('TypeScript')).toHaveLength(1)
  view.rerender(
    <Resume
      profile={profile}
      jobs={[{ ...jobs[0]!, startDate: '2024-01-01' }, jobs[1]!]}
      education={[]}
    />,
  )
  expect(screen.getAllByRole('article')[0]).toBe(before[1])
  expect(screen.getAllByRole('article')[1]).toBe(before[0])
  expect(error).not.toHaveBeenCalled()
})

it('renders Present for ongoing entries and handles omitted optional profile fields', () => {
  render(
    <Resume
      profile={profile}
      jobs={[job('current', 'Example Company', '2024-01-01')]}
      education={[]}
    />,
  )
  expect(screen.getByText(/to Present/)).toBeTruthy()
  expect(screen.queryByRole('navigation', { name: 'Contact' })).toBeNull()
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.getByText('No education entries added yet.')).toBeTruthy()
})

it('opens the browser print dialog only when requested', () => {
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  render(<Resume profile={profile} jobs={[]} education={[]} />)
  expect(print).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Print resume' }))
  expect(print).toHaveBeenCalledOnce()
})
