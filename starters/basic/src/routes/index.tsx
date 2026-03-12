import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
          Hello World
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto px-4">
          Your application is ready to deploy
        </p>
        <p className="mt-12 text-sm">
          Edit{' '}
          <code className="px-2 py-1 border rounded">
            src/routes/index.tsx
          </code>{' '}
          to get started
        </p>
      </div>
    </div>
  )
}
