import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/faq')({
  component: FAQ,
})

const faqs = [
  {
    question: 'What is My SaaS?',
    answer:
      'My SaaS is an all-in-one platform that provides real-time analytics, automated workflows, and team collaboration tools. It helps teams ship products faster by consolidating the tools they need into a single, easy-to-use interface.',
  },
  {
    question: 'How does the free plan work?',
    answer:
      'The Starter plan is completely free and includes up to 3 projects and 1,000 events per month. No credit card is required to sign up. You can upgrade to a paid plan at any time as your needs grow.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      "Yes. You can cancel your subscription at any time from your account settings. When you cancel, you'll retain access to your paid features until the end of your current billing cycle.",
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. My SaaS is SOC 2 Type II compliant and uses end-to-end encryption for all data in transit and at rest. We also support SSO, role-based access controls, and provide detailed audit logs for Enterprise customers.',
  },
  {
    question: 'What integrations do you support?',
    answer:
      'We integrate with popular tools like Slack, GitHub, Jira, Linear, Notion, and many more. Our API and webhook system also allows you to build custom integrations with any service.',
  },
  {
    question: 'Do you offer support for teams?',
    answer:
      'All plans include community support via our forum. Pro plans get priority email support with a 24-hour response time. Enterprise customers receive a dedicated account manager and phone support with guaranteed SLAs.',
  },
  {
    question: 'Can I import data from other tools?',
    answer:
      'Yes. We provide migration guides and import tools for common platforms. Our support team can also assist with custom migrations for Enterprise customers.',
  },
]

function FAQ() {
  return (
    <div className="min-h-screen bg-gray-950 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
          Got questions? We've got answers. If you can't find what you're
          looking for, reach out to our support team.
        </p>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Accordion key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-lg">{question}</span>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 leading-relaxed">{answer}</div>
      )}
    </div>
  )
}
