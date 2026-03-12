import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccess,
})

function CheckoutSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="rounded-2xl p-12 border text-center max-w-lg">
        <div className="text-6xl mb-6">&#10003;</div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-8">
          Thank you for your purchase. Your order is on its way!
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-lg border"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
