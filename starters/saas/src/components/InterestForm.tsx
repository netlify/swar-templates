import { useState, type FormEvent } from 'react'
import { getPlan, interestForm, plans, type PlanId } from '@/lib/content'

type SubmissionState =
  | { status: 'idle' | 'pending' | 'success' }
  | { status: 'error'; message: string }

export function InterestForm({
  planId,
  onPlanChange,
}: {
  planId: PlanId
  onPlanChange: (plan: PlanId) => void
}) {
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
  })
  const plan = getPlan(planId)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submission.status === 'pending') return
    const fields = new FormData(event.currentTarget)
    const body = new URLSearchParams()
    fields.forEach((value, key) => body.append(key, String(value)))
    setSubmission({ status: 'pending' })
    try {
      const response = await fetch(interestForm.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error('Delivery failed')
      const isUnprocessedForm = /\bdata-netlify\s*=/i.test(
        await response.text(),
      )
      if (isUnprocessedForm) {
        setSubmission({
          status: 'error',
          message:
            'Enquiry delivery is not available in this preview. Nothing was sent, and your details are still here.',
        })
        return
      }
      setSubmission({ status: 'success' })
    } catch {
      setSubmission({
        status: 'error',
        message:
          'We couldn’t send your enquiry. Your details are still here; please try again.',
      })
    }
  }

  return (
    <form
      name={interestForm.name}
      method="POST"
      action={interestForm.endpoint}
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={submit}
      onChange={() => {
        if (submission.status !== 'pending') setSubmission({ status: 'idle' })
      }}
      className="space-y-6 rounded-xl border p-6 sm:p-8"
    >
      <input type="hidden" name="form-name" value={interestForm.name} />
      <input
        type="hidden"
        name="subject"
        value={`Plan enquiry: ${plan.name}`}
      />
      <p hidden>
        <label>
          Leave this empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <fieldset
        disabled={submission.status === 'pending'}
        className="space-y-5 disabled:opacity-70"
      >
        <legend className="mb-5 text-xl font-semibold">Your enquiry</legend>
        <div>
          <label htmlFor="plan" className="mb-2 block font-medium">
            Plan
          </label>
          <select
            id="plan"
            name="plan"
            value={planId}
            onChange={(event) => onPlanChange(getPlan(event.target.value).id)}
            className="form-input"
          >
            {plans.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} · {option.price} (example)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="name" className="mb-2 block font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="company" className="mb-2 block font-medium">
            Company (optional)
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            maxLength={100}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-2 block font-medium">
            What are you looking for?
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className="form-input"
          />
        </div>
        <p id="enquiry-note" className="text-sm text-gray-600">
          This sends a plan enquiry. It does not create an account or
          subscription.
        </p>
        <button
          type="submit"
          aria-describedby="enquiry-note"
          className="rounded-lg border px-6 py-3 font-semibold disabled:cursor-wait"
        >
          {submission.status === 'pending' ? 'Sending…' : 'Send enquiry'}
        </button>
      </fieldset>
      {submission.status === 'error' && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900"
        >
          {submission.message}
        </p>
      )}
      {submission.status === 'success' && (
        <p
          role="status"
          className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-900"
        >
          Your enquiry was received. No account or subscription was created.
        </p>
      )}
    </form>
  )
}
