import { Link, createFileRoute } from '@tanstack/react-router'
import products from '../../data/products'

export const Route = createFileRoute('/products/$productId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const product = products.find(
      (product) => product.id === +params.productId,
    )
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  },
})

function RouteComponent() {
  const product = Route.useLoaderData()

  return (
    <div className="relative min-h-[100vh] flex items-center bg-black text-white p-5">
      <div className="relative z-10 w-[60%] bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-gray-800/50 shadow-xl">
        <Link
          to="/"
          className="inline-block mb-4 text-emerald-400 hover:text-emerald-300"
        >
          &larr; Back to all products
        </Link>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-300 mb-6">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-400">
            ${product.price.toLocaleString()}
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-[55%] h-full z-0">
        <div className="w-full h-full overflow-hidden rounded-2xl border-4 border-gray-800 shadow-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
