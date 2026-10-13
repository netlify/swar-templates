import { createFileRoute } from '@tanstack/react-router'
import { InterestForm } from '@/components/InterestForm'
import { getPlan, site } from '@/lib/content'

export const Route = createFileRoute('/contact')({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: getPlan(search.plan).id,
  }),
  head: () => ({
    meta: [
      { title: `Plan enquiry | ${site.name}` },
      {
        name: 'description',
        content:
          'Tell us which plan interests you and what you need. Enquiries do not create accounts or subscriptions.',
      },
      { property: 'og:title', content: `Plan enquiry | ${site.name}` },
      {
        property: 'og:description',
        content: 'Tell us which plan interests you and what you need.',
      },
    ],
  }),
  component: Contact,
})

function Contact() {
  const { plan } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-20">
      <h1 className="mb-4 text-4xl font-bold">Enquire about a plan</h1>
      <p className="mb-10 text-lg text-gray-600">
        You’re interested in {getPlan(plan).name}. Share your requirements so we
        can discuss the right fit.
      </p>
      <InterestForm
        planId={plan}
        onPlanChange={(selected) => {
          void navigate({ search: { plan: selected }, replace: true })
        }}
      />
    </div>
  )
}
