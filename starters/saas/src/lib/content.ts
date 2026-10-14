export const site = {
  name: 'My SaaS',
  description:
    'Explore example plans and enquire about the right fit for your team.',
}

export const interestForm = {
  name: 'plan-interest',
  endpoint: '/__forms.html',
}

export const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    description: 'For individuals exploring a new idea.',
    features: ['Individual use', 'Small projects', 'Early experiments'],
    action: 'Enquire about Starter',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29/mo',
    description: 'For teams planning their next step.',
    features: ['Team requirements', 'Growing projects', 'Shared priorities'],
    action: 'Enquire about Pro',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations with a tailored brief.',
    features: [
      'Organization-wide needs',
      'A tailored scope',
      'A sales conversation',
    ],
    action: 'Contact sales',
    highlighted: false,
  },
] as const

export type PlanId = (typeof plans)[number]['id']

export function getPlan(value: unknown) {
  return plans.find((plan) => plan.id === value) ?? plans[0]
}

export const faqs = [
  {
    question: `What is ${site.name}?`,
    answer:
      'This is an example SaaS landing page. It lets you compare illustrative plans and send a plan enquiry. Product features and commercial terms should be confirmed before choosing a service.',
  },
  {
    question: 'Which plan should I enquire about?',
    answer: plans.map((plan) => `${plan.name}: ${plan.description}`).join(' '),
  },
  {
    question: 'Does an enquiry create an account or subscription?',
    answer:
      'No. The form sends your contact details, selected plan, and message as an enquiry. It does not create an account, start a trial, charge you, or subscribe you to a plan.',
  },
  {
    question: 'Are these prices and plan details final?',
    answer:
      'The prices and plan descriptions are examples. Confirm current pricing, available features, billing, and cancellation terms with the team before making a commitment.',
  },
  {
    question: 'What about integrations, security, and support?',
    answer:
      'Tell us which integrations, security requirements, or support arrangements you need in your enquiry. This page does not promise particular integrations, certifications, or response times.',
  },
] as const
