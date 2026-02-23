import { useState } from 'react'
import { createCheckoutSession } from '@/lib/stripe.server'

export function BuyButton({
  motorcycleId,
  className = '',
}: {
  motorcycleId: number
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const url = await createCheckoutSession({ data: motorcycleId })
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-wait text-white px-6 py-2 rounded-lg transition-colors ${className}`}
    >
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  )
}
