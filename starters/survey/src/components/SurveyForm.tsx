import { useState } from 'react'

const seasonOptions = ['Spring', 'Summer', 'Autumn', 'Winter']

export default function SurveyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Thanks for voting!
        </h2>
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
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="space-y-6"
        aria-busy={isSubmitting}
        onSubmit={async (e) => {
          e.preventDefault()
          if (isSubmitting) return

          const formData = new FormData(e.currentTarget)
          setIsSubmitting(true)
          setError(null)

          try {
            const response = await fetch('/form-survey.html', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams(
                formData as unknown as Record<string, string>,
              ).toString(),
            })
            if (!response.ok) throw new Error('Form submission failed')
            setSubmitted(true)
          } catch {
            setError("We couldn't submit your vote. Please try again.")
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <input type="hidden" name="form-name" value="favorite-season-survey" />
        <p className="hidden" style={{ display: 'none' }}>
          <label>
            Don&apos;t fill this out: <input name="bot-field" />
          </label>
        </p>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="season"
            className="block text-sm font-medium mb-2"
          >
            Favorite Season
          </label>
          <select
            id="season"
            name="season"
            required
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
          >
            <option value="">
              Select a season...
            </option>
            {seasonOptions.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium mb-2"
          >
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

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-3 border font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      </form>
    </div>
  )
}
