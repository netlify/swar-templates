import { useNavigate } from '@tanstack/react-router'

import { showMotorcycleAIAssistant } from '@/store/motorcycle-assistant'

import motorcycles from '@/data/motorcycles'

export default function MotorcycleRecommendation({ id }: { id: string }) {
  const navigate = useNavigate()
  const motorcycle = motorcycles.find((motorcycle) => motorcycle.id === +id)
  if (!motorcycle) {
    return null
  }
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-orange-500/20 bg-gray-800/50">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={motorcycle.image}
          alt={motorcycle.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {motorcycle.name}
        </h3>
        <p className="text-sm text-gray-300 mb-1 line-clamp-2">
          {motorcycle.shortDescription}
        </p>
        <p className="text-sm text-gray-400 mb-3">
          {motorcycle.engineSize}cc •{' '}
          {motorcycle.type.charAt(0).toUpperCase() + motorcycle.type.slice(1)}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-emerald-400">
            ${motorcycle.price.toLocaleString()}
          </div>
          <button
            onClick={() => {
              navigate({
                to: '/motorcycles/$motorcycleId',
                params: { motorcycleId: motorcycle.id.toString() },
              })
              showMotorcycleAIAssistant.setState(() => false)
            }}
            className="bg-linear-to-r from-orange-500 to-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
