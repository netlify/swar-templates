import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccess,
})

function CheckoutSuccess() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center p-5">
      <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-12 border border-gray-800/50 shadow-xl text-center max-w-lg">
        <div className="text-emerald-400 text-6xl mb-6">&#10003;</div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-300 mb-8">
          Thank you for your purchase. Your order is on its way!
        </p>
        <Link
          to="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
