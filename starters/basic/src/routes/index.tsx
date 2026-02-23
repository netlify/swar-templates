import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-teal-900 via-emerald-800 to-cyan-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
          Hello from{' '}
          <span className="bg-linear-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Netlify
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-teal-100/80 mb-8 max-w-2xl mx-auto px-4">
          Your TanStack Start application is ready to deploy
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <a
            href="https://tanstack.com/start"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-500/30"
          >
            TanStack Start Docs
          </a>
          <a
            href="https://docs.netlify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20"
          >
            Netlify Docs
          </a>
        </div>
        <p className="mt-12 text-teal-200/60 text-sm">
          Edit{' '}
          <code className="px-2 py-1 bg-black/30 rounded text-teal-300">
            src/routes/index.tsx
          </code>{' '}
          to get started
        </p>
      </div>
    </div>
  )
}
