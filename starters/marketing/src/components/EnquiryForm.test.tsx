import { readFileSync } from 'node:fs'
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EnquiryForm } from './EnquiryForm'
import { enquiryForm } from '../data/site'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function Form() {
  const [id, setId] = useState(2)
  return <EnquiryForm productId={id} onProductChange={setId} />
}

async function fillForm() {
  render(<Form />)
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Name'), 'Jane Doe')
  await user.type(screen.getByLabelText('Email'), 'jane@example.com')
  await user.type(
    screen.getByLabelText('What would you like to know?'),
    'Please confirm dimensions & availability.',
  )
  return user
}

describe('product enquiries', () => {
  it('sends the selected product context and confirms only accepted submissions', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('Accepted'))
    vi.stubGlobal('fetch', fetch)
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    await screen.findByText(/Your enquiry about Cable tray was received/)
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe(enquiryForm.endpoint)
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    )
    expect(Object.fromEntries(new URLSearchParams(init.body))).toEqual({
      'form-name': 'product-enquiry',
      subject: 'Product enquiry: Cable tray',
      'product-id': '2',
      'product-name': 'Cable tray',
      'bot-field': '',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Please confirm dimensions & availability.',
    })
    expect(screen.getByRole('group').hasAttribute('disabled')).toBe(true)
    await user.click(
      screen.getByRole('button', { name: 'Send another enquiry' }),
    )
    expect(screen.getByRole('group').hasAttribute('disabled')).toBe(false)
  })

  it.each([400, 500])(
    'retains details and product after HTTP %s and supports retry',
    async (status) => {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(new Response('', { status }))
        .mockResolvedValueOnce(new Response('Accepted'))
      vi.stubGlobal('fetch', fetch)
      const user = await fillForm()
      await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
      await screen.findByRole('alert')
      expect(
        (screen.getByLabelText('Product') as HTMLSelectElement).value,
      ).toBe('2')
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe(
        'Jane Doe',
      )
      expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe(
        'jane@example.com',
      )
      expect(
        (
          screen.getByLabelText(
            'What would you like to know?',
          ) as HTMLTextAreaElement
        ).value,
      ).toBe('Please confirm dimensions & availability.')
      expect(screen.queryByText(/was received/)).toBeNull()
      await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
      await screen.findByText(/Your enquiry about Cable tray was received/)
      expect(fetch.mock.calls[1][1].body).toBe(fetch.mock.calls[0][1].body)
    },
  )

  it('handles network failures and allows retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Offline'))
        .mockResolvedValueOnce(new Response('Accepted')),
    )
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    await screen.findByText(/Your enquiry about Cable tray was received/)
  })

  it('blocks synchronous duplicate submissions and disables fields while pending', async () => {
    let resolve!: (response: Response) => void
    const fetch = vi.fn().mockReturnValue(
      new Promise<Response>((done) => {
        resolve = done
      }),
    )
    vi.stubGlobal('fetch', fetch)
    await fillForm()
    const form = screen
      .getByRole('button', { name: 'Send enquiry' })
      .closest('form')!
    act(() => {
      fireEvent.submit(form)
      fireEvent.submit(form)
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('group').hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeTruthy()
    expect(screen.queryByText(/was received/)).toBeNull()
    await act(async () => resolve(new Response('Accepted')))
    expect(
      screen.getByText(/Your enquiry about Cable tray was received/),
    ).toBeTruthy()
  })

  it('rejects unprocessed registration HTML even when the preview returns HTTP 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(readFileSync('public/__forms.html', 'utf8')),
        ),
    )
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    await screen.findByRole('alert')
    expect(screen.queryByText(/was received/)).toBeNull()
  })

  it('uses the configured destination and updates the submitted product when changed', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('Accepted'))
    vi.stubGlobal('fetch', fetch)
    const user = await fillForm()
    await user.selectOptions(screen.getByLabelText('Product'), '1')
    const original = enquiryForm.endpoint
    enquiryForm.endpoint = '/custom-enquiry'
    try {
      await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
      await screen.findByText(/Your enquiry about Desk organizer was received/)
      expect(fetch.mock.calls[0][0]).toBe('/custom-enquiry')
      const fields = new URLSearchParams(fetch.mock.calls[0][1].body)
      expect(fields.get('product-id')).toBe('1')
      expect(fields.get('product-name')).toBe('Desk organizer')
      expect(fields.get('subject')).toBe('Product enquiry: Desk organizer')
    } finally {
      enquiryForm.endpoint = original
    }
  })

  it('re-enables the form after a request times out', async () => {
    const controller = new AbortController()
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(controller.signal)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () =>
              reject(init.signal.reason),
            )
          }),
      ),
    )
    const user = await fillForm()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(timeout).toHaveBeenCalledWith(15000)
    await act(async () => controller.abort())
    await screen.findByRole('alert')
    expect(screen.getByRole('group').hasAttribute('disabled')).toBe(false)
  })

  it('matches static registration names, fields and honeypot', () => {
    const { container } = render(<Form />)
    const form = container.querySelector('form')!
    const registration = new DOMParser()
      .parseFromString(readFileSync('public/__forms.html', 'utf8'), 'text/html')
      .querySelector('form')!
    for (const attribute of [
      'name',
      'method',
      'data-netlify',
      'netlify-honeypot',
    ])
      expect(form.getAttribute(attribute)).toBe(
        registration.getAttribute(attribute),
      )
    const names = (element: Element) =>
      [...element.querySelectorAll('[name]')]
        .map((field) => field.getAttribute('name'))
        .sort()
    expect(names(form)).toEqual(names(registration))
    expect(
      form.querySelector('[name="form-name"]')?.getAttribute('value'),
    ).toBe(registration.getAttribute('name'))
    expect(form.querySelector('[name="bot-field"]')?.closest('p')?.hidden).toBe(
      true,
    )
  })
})
