import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Zap, Shield, BarChart3, Users, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900/30 via-transparent to-cyan-900/20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold mb-4 tracking-wide uppercase text-sm">
            The modern platform for teams
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Ship faster with{' '}
            <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              My SaaS
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            My SaaS gives your team real-time analytics, automated workflows,
            and seamless collaboration — all in one place. Stop juggling tools
            and start shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
            >
              Get Started Free <ArrowRight size={18} />
            </a>
            <Link
              to="/faq"
              className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg transition-colors border border-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need to scale
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
            Built for startups and growing teams that need reliable
            infrastructure without the overhead.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<BarChart3 size={28} />}
              title="Real-Time Analytics"
              description="Track key metrics, user behavior, and revenue in real time with customizable dashboards and automated reports."
            />
            <FeatureCard
              icon={<Zap size={28} />}
              title="Automated Workflows"
              description="Set up triggers, automate repetitive tasks, and integrate with the tools you already use — no code required."
            />
            <FeatureCard
              icon={<Users size={28} />}
              title="Team Collaboration"
              description="Shared workspaces, role-based access, and live editing so your entire team stays in sync."
            />
            <FeatureCard
              icon={<Shield size={28} />}
              title="Enterprise Security"
              description="SOC 2 compliant, end-to-end encryption, SSO support, and audit logs to keep your data safe."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <PricingCard
              name="Starter"
              price="Free"
              description="For individuals and small experiments."
              features={[
                'Up to 3 projects',
                '1,000 events/mo',
                'Community support',
              ]}
            />
            <PricingCard
              name="Pro"
              price="$29/mo"
              description="For growing teams that need more."
              features={[
                'Unlimited projects',
                '100,000 events/mo',
                'Priority support',
                'Custom dashboards',
              ]}
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For organizations with advanced needs."
              features={[
                'Unlimited everything',
                'Dedicated account manager',
                'SSO & audit logs',
                'SLA guarantee',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center text-gray-500 text-sm">
        &copy; 2026 My SaaS. All rights reserved.
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors">
      <div className="text-indigo-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
}: {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`p-6 rounded-xl border flex flex-col ${
        highlighted
          ? 'bg-indigo-600/10 border-indigo-500/40'
          : 'bg-white/5 border-white/5'
      }`}
    >
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <p className="text-3xl font-bold mb-2">{price}</p>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      <ul className="space-y-2 text-sm text-gray-300 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-indigo-400">&#10003;</span> {f}
          </li>
        ))}
      </ul>
      <button
        className={`mt-6 w-full py-2 rounded-lg font-semibold transition-colors ${
          highlighted
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
            : 'bg-white/10 hover:bg-white/15 text-white'
        }`}
      >
        {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
      </button>
    </div>
  )
}
