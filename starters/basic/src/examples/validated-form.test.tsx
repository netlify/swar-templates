import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ValidatedForm } from './validated-form'

describe('ValidatedForm', () => {
  it('validates input before calling the submit handler', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ValidatedForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'invalid')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(
      await screen.findByText('Enter a valid email address.'),
    ).toBeVisible()
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
      'Use the address where we can reach you. Enter a valid email address.',
    )
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('prevents duplicate submissions while saving', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    render(<ValidatedForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    const saving = await screen.findByRole('button', { name: 'Saving…' })
    await user.click(saving)

    expect(saving).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows success when the submit handler resolves', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ValidatedForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your submission was saved.',
    )
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })

    await user.clear(screen.getByLabelText('Email'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('preserves input on failure and allows retry', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockResolvedValueOnce(undefined)
    render(<ValidatedForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your submission couldn’t be saved. Please try again.',
    )
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
    )
    expect(await screen.findByRole('status')).toBeVisible()
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
})
