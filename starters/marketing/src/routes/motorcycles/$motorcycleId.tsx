import { Link, createFileRoute } from '@tanstack/react-router'
import motorcycles from '../../data/motorcycles'

export const Route = createFileRoute('/motorcycles/$motorcycleId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const motorcycle = motorcycles.find(
      (motorcycle) => motorcycle.id === +params.motorcycleId,
    )
    if (!motorcycle) {
      throw new Error('Motorcycle not found')
    }
    return motorcycle
  },
})

function RouteComponent() {
  const motorcycle = Route.useLoaderData()

  return (
    <div className="relative min-h-[100vh] flex items-center bg-black text-white p-5">
      <div className="relative z-10 w-[60%] bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-gray-800/50 shadow-xl">
        <Link
          to="/"
          className="inline-block mb-4 text-emerald-400 hover:text-emerald-300"
        >
          &larr; Back to all motorcycles
        </Link>
        <h1 className="text-3xl font-bold mb-2">{motorcycle.name}</h1>
        <p className="text-gray-400 mb-2">
          {motorcycle.engineSize}cc •{' '}
          {motorcycle.type.charAt(0).toUpperCase() + motorcycle.type.slice(1)}
        </p>
        <p className="text-gray-300 mb-6">{motorcycle.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-400">
            ${motorcycle.price.toLocaleString()}
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-[55%] h-full z-0">
        <div className="w-full h-full overflow-hidden rounded-2xl border-4 border-gray-800 shadow-2xl">
          <img
            src={motorcycle.image}
            alt={motorcycle.name}
            className="w-full h-full object-cover motorcycle-image"
          />
        </div>
      </div>
    </div>
  )
}
