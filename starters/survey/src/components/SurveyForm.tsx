import { useState } from 'react'

const movieOptions = [
  'The Shawshank Redemption',
  'The Godfather',
  'The Dark Knight',
  'Pulp Fiction',
  'Forrest Gump',
  'The Matrix',
  'Goodfellas',
  'Star Wars: A New Hope',
  'Jurassic Park',
  'Back to the Future',
]

export default function SurveyForm() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Thanks for voting!
        </h2>
        <p className="text-teal-100/80">Your response has been recorded.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md px-4">
      <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
        Best Movie Ever?
      </h1>
      <p className="text-teal-100/80 mb-8">
        Pick your favorite movie and tell us why you love it.
      </p>

      <form
        name="best-movie-survey"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form) as never).toString(),
          }).then(() => setSubmitted(true))
        }}
      >
        <input type="hidden" name="form-name" value="best-movie-survey" />
        <p className="hidden" style={{ display: 'none' }}>
          <label>
            Don&apos;t fill this out: <input name="bot-field" />
          </label>
        </p>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-teal-200 mb-2"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="movie"
            className="block text-sm font-medium text-teal-200 mb-2"
          >
            Best Movie
          </label>
          <select
            id="movie"
            name="movie"
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          >
            <option value="" className="bg-gray-800">
              Select a movie...
            </option>
            {movieOptions.map((movie) => (
              <option key={movie} value={movie} className="bg-gray-800">
                {movie}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-teal-200 mb-2"
          >
            Why is it the best?
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
            placeholder="Tell us why you love this movie..."
          />
        </div>

        <button
          type="submit"
          className="w-full px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-500/30"
        >
          Submit Vote
        </button>
      </form>
    </div>
  )
}
