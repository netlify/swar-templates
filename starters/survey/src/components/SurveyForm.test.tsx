import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SurveyForm from './SurveyForm'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function fillForm() {
  const user = userEvent.setup()
  render(<SurveyForm />)
  await user.type(screen.getByLabelText('Your Name'), 'Jane Doe')
  await user.selectOptions(screen.getByLabelText('Favorite Season'), 'Autumn')
  await user.type(
    screen.getByLabelText('Why is it the best?'),
    'Cool days & colorful leaves',
  )
  return user
}

describe('survey submission', () => {
  it('sends all registered fields to the static endpoint and confirms an accepted response', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetch)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
    await screen.findByText('Your response has been recorded.')
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('/form-survey.html')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    )
    expect(Object.fromEntries(new URLSearchParams(init.body))).toEqual({
      'form-name': 'favorite-season-survey',
      'bot-field': '',
      name: 'Jane Doe',
      season: 'Autumn',
      reason: 'Cool days & colorful leaves',
    })
    expect(screen.queryByRole('button')).toBeNull()
  })

  it.each([400, 500])(
    'preserves answers after HTTP %s and allows retry',
    async (status) => {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(new Response('', { status }))
        .mockResolvedValueOnce(new Response('Accepted'))
      vi.stubGlobal('fetch', fetch)
      const user = await fillForm()
      await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
      await screen.findByRole('alert')
      expect(
        (screen.getByLabelText('Your Name') as HTMLInputElement).value,
      ).toBe('Jane Doe')
      expect(
        (screen.getByLabelText('Favorite Season') as HTMLSelectElement).value,
      ).toBe('Autumn')
      expect(
        (screen.getByLabelText('Why is it the best?') as HTMLTextAreaElement)
          .value,
      ).toBe('Cool days & colorful leaves')
      expect(screen.queryByText('Your response has been recorded.')).toBeNull()
      await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
      await screen.findByText('Your response has been recorded.')
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch.mock.calls[1][1].body).toBe(fetch.mock.calls[0][1].body)
    },
  )

  it('handles a network failure and retries', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Offline'))
      .mockResolvedValueOnce(new Response('Accepted'))
    vi.stubGlobal('fetch', fetch)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
    await screen.findByRole('alert')
    expect((screen.getByLabelText('Your Name') as HTMLInputElement).value).toBe(
      'Jane Doe',
    )
    await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
    await screen.findByText('Your response has been recorded.')
  })

  it('blocks duplicate submits immediately and disables fields while pending', async () => {
    let resolve!: (response: Response) => void
    const fetch = vi.fn().mockReturnValue(
      new Promise<Response>((done) => {
        resolve = done
      }),
    )
    vi.stubGlobal('fetch', fetch)
    await fillForm()
    const form = screen.getByRole('button').closest('form')!
    act(() => {
      fireEvent.submit(form)
      fireEvent.submit(form)
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('group').hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button').textContent).toBe('Submitting…')
    expect(screen.queryByText('Your response has been recorded.')).toBeNull()
    resolve(new Response('Accepted'))
    await screen.findByText('Your response has been recorded.')
  })

  it('does not claim success when a preview returns the unprocessed registration HTML', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(readFileSync('public/form-survey.html', 'utf8')),
        ),
    )
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Local previews',
    )
    expect(screen.queryByText('Your response has been recorded.')).toBeNull()
  })

  it('releases a timed-out request so the visitor can retry', async () => {
    const fetch = vi.fn().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () =>
            reject(init.signal.reason),
          )
        }),
    )
    vi.stubGlobal('fetch', fetch)
    const user = await fillForm()
    const timeout = vi.spyOn(AbortSignal, 'timeout')
    const controller = new AbortController()
    timeout.mockReturnValueOnce(controller.signal)
    await user.click(screen.getByRole('button', { name: 'Submit Vote' }))
    expect(timeout).toHaveBeenCalledWith(15000)
    act(() => controller.abort(new DOMException('Timed out', 'TimeoutError')))
    await screen.findByRole('alert')
    await waitFor(() =>
      expect(screen.getByRole('group').hasAttribute('disabled')).toBe(false),
    )
    timeout.mockRestore()
  })

  it('keeps static registration, form name, fields and honeypot aligned', () => {
    const { container } = render(<SurveyForm />)
    const staticDocument = new DOMParser().parseFromString(
      readFileSync('public/form-survey.html', 'utf8'),
      'text/html',
    )
    const form = container.querySelector('form')!
    const registration = staticDocument.querySelector('form')!
    for (const attribute of [
      'name',
      'method',
      'data-netlify',
      'netlify-honeypot',
    ]) {
      expect(form.getAttribute(attribute)).toBe(
        registration.getAttribute(attribute),
      )
    }
    const fields = (element: Element) =>
      [...element.querySelectorAll('[name]')]
        .map((field) => field.getAttribute('name'))
        .sort()
    expect(fields(form)).toEqual(fields(registration))
    expect(
      form.querySelector('input[name="form-name"]')?.getAttribute('value'),
    ).toBe(registration.getAttribute('name'))
    expect(
      form.querySelector('[name="bot-field"]')?.closest('p')?.style.display,
    ).toBe('none')
  })
})
