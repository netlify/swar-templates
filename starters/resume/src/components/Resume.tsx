import type { Job, Education } from 'content-collections'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ResumeProfile } from '@/lib/profile'
import { chronologicalEntries, formatResumeDate } from '@/lib/chronology'

function DateRange({
  startDate,
  endDate,
}: {
  startDate: string
  endDate?: string
}) {
  return (
    <span>
      <time dateTime={startDate}>{formatResumeDate(startDate)}</time> to{' '}
      {endDate ? (
        <time dateTime={endDate}>{formatResumeDate(endDate)}</time>
      ) : (
        'Present'
      )}
    </span>
  )
}

function Skills({ tags, label }: { tags: string[]; label: string }) {
  if (!tags.length) return null
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {[...new Set(tags)].map((tag) => (
        <li key={tag} className="min-w-0 max-w-full">
          <Badge
            variant="outline"
            className="max-w-full whitespace-normal break-words"
          >
            {tag}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export default function Resume({
  profile,
  jobs,
  education,
}: {
  profile: ResumeProfile
  jobs: Job[]
  education: Education[]
}) {
  return (
    <div className="resume-page min-h-screen p-4 sm:p-8 lg:p-12">
      <main className="resume-content max-w-4xl mx-auto space-y-10">
        <header className="resume-header text-center space-y-4">
          <p className="text-sm text-muted-foreground">My Resume</p>
          <h1 className="text-4xl sm:text-5xl font-bold break-words">
            {profile.name}
          </h1>
          <p className="text-lg">{profile.headline}</p>
          {profile.location && <p>{profile.location}</p>}
          {(profile.email || profile.phone || profile.links.length > 0) && (
            <nav
              aria-label="Contact"
              className="resume-contact flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm break-all"
            >
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="underline underline-offset-4"
                >
                  {profile.email}
                </a>
              )}
              {profile.phone && (
                <a
                  href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}
                  className="underline underline-offset-4"
                >
                  {profile.phone}
                </a>
              )}
              {profile.links.map((link) => (
                <a
                  key={`${link.label}:${link.url}`}
                  href={link.url}
                  className="underline underline-offset-4"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="resume-print-button rounded-md border px-4 py-2 text-sm"
          >
            Print resume
          </button>
          <Separator className="mt-8" />
        </header>

        <section aria-labelledby="summary-heading">
          <Card className="resume-card">
            <CardHeader>
              <h2
                id="summary-heading"
                className="text-2xl font-semibold leading-none"
              >
                Career Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="resume-summary flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <p className="flex-1 min-w-0 leading-relaxed break-words">
                  {profile.summary}
                </p>
                {profile.photo && (
                  <img
                    src={profile.photo.src}
                    alt={profile.photo.alt}
                    width={176}
                    height={208}
                    className="resume-photo w-44 h-52 rounded-2xl object-cover shrink-0"
                  />
                )}
              </div>
              {profile.skills.length > 0 && (
                <div className="mt-6">
                  <Skills tags={profile.skills} label="Profile skills" />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="experience-heading"
          className="resume-section space-y-6"
        >
          <h2 id="experience-heading" className="text-3xl font-semibold">
            Work Experience
          </h2>
          {!jobs.length && <p>No experience entries added yet.</p>}
          <div className="space-y-6">
            {chronologicalEntries(jobs).map((job) => (
              <article key={job._meta.path} className="resume-entry">
                <Card className="resume-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="space-y-2 min-w-0">
                        <h3 className="text-xl font-semibold leading-none break-words">
                          {job.jobTitle}
                        </h3>
                        <p className="font-medium break-words">
                          {job.company}
                          {job.location && ` - ${job.location}`}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-sm whitespace-normal max-w-full"
                      >
                        <DateRange
                          startDate={job.startDate}
                          endDate={job.endDate}
                        />
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 leading-relaxed break-words">
                      {job.summary}
                    </p>
                    <Skills
                      tags={job.tags}
                      label={`Skills at ${job.company}`}
                    />
                    {job.html && (
                      <div
                        className="resume-prose mt-6 prose prose-sm max-w-none break-words"
                        dangerouslySetInnerHTML={{ __html: job.html }}
                      />
                    )}
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="education-heading"
          className="resume-section space-y-6"
        >
          <h2 id="education-heading" className="text-3xl font-semibold">
            Education
          </h2>
          {!education.length && <p>No education entries added yet.</p>}
          <div className="space-y-6">
            {chronologicalEntries(education).map((entry) => (
              <article key={entry._meta.path} className="resume-entry">
                <Card className="resume-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <h3 className="text-xl font-semibold leading-none break-words min-w-0">
                        {entry.school}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-sm whitespace-normal max-w-full"
                      >
                        <DateRange
                          startDate={entry.startDate}
                          endDate={entry.endDate}
                        />
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 leading-relaxed break-words">
                      {entry.summary}
                    </p>
                    <Skills
                      tags={entry.tags}
                      label={`Skills from ${entry.school}`}
                    />
                    {entry.html && (
                      <div
                        className="resume-prose mt-6 prose prose-sm max-w-none break-words"
                        dangerouslySetInnerHTML={{ __html: entry.html }}
                      />
                    )}
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
