import { createFileRoute } from '@tanstack/react-router'
import { allJobs, allEducations } from 'content-collections'
import { Badge } from '../components/ui/badge'
import { chronologicalEntries, formatDate } from '../lib/chronology'
import { site, pageMeta } from '../lib/site'

export const Route = createFileRoute('/resume')({
  component: Resume,
  head: () => pageMeta('Résumé', 'Professional experience and education.'),
})

function Resume() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="text-4xl font-bold mb-3">Résumé</h1>
        <p className="text-gray-600">
          Example professional experience and education.
        </p>
      </header>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Career summary</h2>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <p className="flex-1 leading-relaxed">{site.summary}</p>
          <img
            src="/headshot-on-white.jpg"
            alt="Example portfolio portrait"
            className="w-32 h-40 rounded-2xl object-cover"
          />
        </div>
      </section>
      <section>
        <h2 className="text-3xl font-semibold mb-6">Work Experience</h2>
        {allJobs.length ? (
          <div className="space-y-6">
            {chronologicalEntries(allJobs).map((job) => (
              <article key={job._meta.path} className="border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
                    <p>
                      {job.company}
                      {job.location ? ` · ${job.location}` : ''}
                    </p>
                  </div>
                  <p className="text-sm">
                    <time dateTime={job.startDate}>
                      {formatDate(job.startDate)}
                    </time>{' '}
                    –{' '}
                    {job.endDate ? (
                      <time dateTime={job.endDate}>
                        {formatDate(job.endDate)}
                      </time>
                    ) : (
                      'Present'
                    )}
                  </p>
                </div>
                <p className="mb-4">{job.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div
                  className="prose prose-sm max-w-none mt-6"
                  dangerouslySetInnerHTML={{ __html: job.html }}
                />
              </article>
            ))}
          </div>
        ) : (
          <p>No experience added yet.</p>
        )}
      </section>
      <section>
        <h2 className="text-3xl font-semibold mb-6">Education</h2>
        {allEducations.length ? (
          <div className="space-y-6">
            {chronologicalEntries(allEducations).map((entry) => (
              <article key={entry._meta.path} className="border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-2">{entry.school}</h3>
                <p className="text-sm mb-4">
                  <time dateTime={entry.startDate}>
                    {formatDate(entry.startDate)}
                  </time>{' '}
                  –{' '}
                  {entry.endDate ? (
                    <time dateTime={entry.endDate}>
                      {formatDate(entry.endDate)}
                    </time>
                  ) : (
                    'Present'
                  )}
                </p>
                <p className="mb-4">{entry.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div
                  className="prose prose-sm max-w-none mt-6"
                  dangerouslySetInnerHTML={{ __html: entry.html }}
                />
              </article>
            ))}
          </div>
        ) : (
          <p>No education added yet.</p>
        )}
      </section>
    </div>
  )
}
