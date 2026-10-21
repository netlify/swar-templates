import { useRef, useState, type FormEvent } from 'react'

const seasonOptions = ['Spring', 'Summer', 'Autumn', 'Winter']

export default function SurveyForm() {
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'error' | 'success'
  >('idle')
  const submitting = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const body = new URLSearchParams()
    new FormData(event.currentTarget).forEach((value, key) => {
      body.append(key, String(value))
    })
    submitting.current = true
    setStatus('pending')
    try {
      const response = await fetch('/form-survey.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok || /\bdata-netlify\s*=/i.test(await response.text())) {
        throw new Error('Submission was not accepted')
      }
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      submitting.current = false
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center" role="status">
        <h2 className="text-3xl font-bold mb-4">Thanks for voting!</h2>
        <p>Your response has been recorded.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md px-4">
      <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
        What&apos;s your favorite season?
      </h1>
      <p className="mb-8">
        Pick your favorite season and tell us why you love it.
      </p>

      <form
        name="favorite-season-survey"
        method="POST"
        action="/form-survey.html"
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="space-y-6"
        aria-busy={status === 'pending'}
        onSubmit={submit}
      >
        <input type="hidden" name="form-name" value="favorite-season-survey" />
        <p className="hidden" style={{ display: 'none' }}>
          <label>
            Don&apos;t fill this out:{' '}
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <fieldset
          disabled={status === 'pending'}
          className="space-y-6 disabled:opacity-70"
        >
          <legend className="sr-only">Your season vote</legend>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              required
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="season" className="block text-sm font-medium mb-2">
              Favorite Season
            </label>
            <select
              id="season"
              name="season"
              required
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            >
              <option value="">Select a season...</option>
              {seasonOptions.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              Why is it the best?
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none resize-none"
              placeholder="Tell us why you love this season..."
            />
          </div>

          <button
            type="submit"
            className="w-full px-8 py-3 border font-semibold rounded-lg"
          >
            {status === 'pending' ? 'Submitting…' : 'Submit Vote'}
          </button>
        </fieldset>
        <p role="status" className="sr-only">
          {status === 'pending' ? 'Submitting your vote…' : ''}
        </p>
        {status === 'error' && (
          <p role="alert">
            We couldn’t confirm your vote. Your answers are still here; please
            try again. Local previews don’t process submissions.
          </p>
        )}
      </form>
    </div>
  )
}
