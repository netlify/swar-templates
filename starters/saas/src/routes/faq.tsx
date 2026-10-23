import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { faqs, site } from '@/lib/content'

export const Route = createFileRoute('/faq')({
  head: () => ({
    meta: [
      { title: `Frequently asked questions | ${site.name}` },
      {
        name: 'description',
        content:
          'Learn how example plans and plan enquiries work before you get in touch.',
      },
      {
        property: 'og:title',
        content: `Frequently asked questions | ${site.name}`,
      },
      {
        property: 'og:description',
        content:
          'Learn how example plans and plan enquiries work before you get in touch.',
      },
    ],
  }),
  component: FAQ,
})

export function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">
        Frequently Asked Questions
      </h1>
      <p className="mx-auto mb-14 max-w-xl text-center">
        A few details about the plans and how enquiries work.
      </p>
      <div className="space-y-3">
        {faqs.map(({ question, answer }) => (
          <details
            key={question}
            className="group overflow-hidden rounded-lg border"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-gray-50">
              <span className="text-lg font-medium">{question}</span>
              <ChevronDown
                aria-hidden="true"
                size={20}
                className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="px-5 pb-5 leading-relaxed">{answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-6">
        <Link to="/" hash="pricing" className="underline underline-offset-4">
          Compare plans
        </Link>
        <Link
          to="/contact"
          search={{ plan: 'enterprise' }}
          className="underline underline-offset-4"
        >
          Contact sales
        </Link>
      </div>
    </div>
  )
}
