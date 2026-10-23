import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InterestForm } from './InterestForm'
import { interestForm } from '@/lib/content'

afterEach(() => vi.unstubAllGlobals())

async function fillEnquiry() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Name'), 'Jane Doe')
  await user.type(screen.getByLabelText('Email'), 'jane@example.com')
  await user.type(
    screen.getByLabelText('What are you looking for?'),
    'We need a plan for a small project.',
  )
  return user
}

describe('plan enquiries', () => {
  it('sends the selected plan and contact details as a URL-encoded enquiry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('Received', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<InterestForm planId="enterprise" onPlanChange={vi.fn()} />)
    expect(screen.getByLabelText('Plan')).toHaveValue('enterprise')
    const user = await fillEnquiry()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your enquiry was received',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'No account or subscription was created',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(interestForm.endpoint)
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    )
    const body = new URLSearchParams(options.body)
    expect(Object.fromEntries(body)).toEqual({
      'form-name': 'plan-interest',
      subject: 'Plan enquiry: Enterprise',
      'bot-field': '',
      plan: 'enterprise',
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: '',
      message: 'We need a plan for a small project.',
    })
    await user.type(screen.getByLabelText('Name'), ' Jr')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps entered details after an HTTP failure and permits a retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response('Received', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<InterestForm planId="pro" onPlanChange={vi.fn()} />)
    const user = await fillEnquiry()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t send your enquiry',
    )
    expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com')
    expect(screen.getByLabelText('Plan')).toHaveValue('pro')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your enquiry was received',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('handles network failures without claiming delivery', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )
    render(<InterestForm planId="starter" onPlanChange={vi.fn()} />)
    const user = await fillEnquiry()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your details are still here',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('rejects an unprocessed HTML skeleton even when preview returns 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response('<form data-netlify="true"></form>')),
    )
    render(<InterestForm planId="starter" onPlanChange={vi.fn()} />)
    const user = await fillEnquiry()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nothing was sent',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('disables fields while pending and prevents a duplicate submission', async () => {
    let finish!: (response: Response) => void
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve
          }),
      ),
    )
    render(<InterestForm planId="pro" onPlanChange={vi.fn()} />)
    const user = await fillEnquiry()
    await user.dblClick(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    finish(new Response('Received'))
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeEnabled())
    expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com')
  })

  it('validates required fields before sending and exposes plan changes', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const onPlanChange = vi.fn()
    render(<InterestForm planId="starter" onPlanChange={onPlanChange} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }))
    expect(screen.getByLabelText('Email')).toBeInvalid()
    expect(fetchMock).not.toHaveBeenCalled()
    await user.selectOptions(screen.getByLabelText('Plan'), 'enterprise')
    expect(onPlanChange).toHaveBeenCalledWith('enterprise')
  })
})
