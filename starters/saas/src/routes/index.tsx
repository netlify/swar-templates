import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Building2, Lightbulb, Users } from 'lucide-react'
import { plans, site } from '@/lib/content'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `${site.name} | Plans for your next step` },
      { name: 'description', content: site.description },
      {
        property: 'og:title',
        content: `${site.name} | Plans for your next step`,
      },
      { property: 'og:description', content: site.description },
    ],
  }),
  component: Home,
})

function Home() {
  return (
    <>
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide">
            Your next step starts with a conversation
          </p>
          <h1 className="mb-6 text-5xl font-black tracking-tight md:text-7xl">
            Find your fit with {site.name}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl">
            Explore a starting point for your project, compare example plans,
            and tell us what you’re looking for.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/contact"
              search={{ plan: 'starter' }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-8 py-3 font-semibold"
            >
              Enquire about Starter <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href="#pricing"
              className="rounded-lg border px-8 py-3 font-semibold"
            >
              Compare plans
            </a>
          </div>
        </div>
      </section>
      <section className="border-t px-4 py-20" aria-labelledby="fit-heading">
        <div className="mx-auto max-w-5xl">
          <h2
            id="fit-heading"
            className="mb-4 text-center text-3xl font-bold md:text-4xl"
          >
            Start with what you need
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center">
            Bring your goals, team size, and requirements to the conversation.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: 'An idea to explore',
                description:
                  'Outline the problem you want to solve and what a useful first step looks like.',
              },
              {
                icon: Users,
                title: 'A team to bring together',
                description:
                  'Tell us how your team works and where you need more support.',
              },
              {
                icon: Building2,
                title: 'A tailored brief',
                description:
                  'Share the requirements that will shape your decision.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border p-6">
                <Icon size={28} aria-hidden="true" className="mb-4" />
                <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                <p className="leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="pricing"
        className="scroll-mt-6 border-t px-4 py-20"
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="pricing-heading"
            className="mb-4 text-center text-3xl font-bold md:text-4xl"
          >
            Compare example plans
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center">
            Illustrative prices and plan descriptions. Confirm the details
            before choosing a service. Enquiries don’t start a subscription.
          </p>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`flex flex-col rounded-xl border p-6 ${plan.highlighted ? 'border-2' : ''}`}
              >
                <h3 className="mb-1 text-lg font-semibold">{plan.name}</h3>
                <p className="mb-2 text-3xl font-bold">{plan.price}</p>
                <p className="mb-6 text-sm">{plan.description}</p>
                <ul className="flex-1 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span aria-hidden="true">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  search={{ plan: plan.id }}
                  className="mt-6 w-full rounded-lg border px-3 py-2 text-center font-semibold"
                >
                  {plan.action}
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link to="/faq" className="underline underline-offset-4">
              Questions about choosing a plan?
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
