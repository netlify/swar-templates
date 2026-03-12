import { Link, createFileRoute } from '@tanstack/react-router'
import products from '../../data/products'
import { BuyButton } from '@/components/BuyButton'

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
    <div className="flex flex-col md:flex-row gap-8 p-5">
      <div className="w-full md:w-[55%]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-2xl object-cover"
        />
      </div>

      <div className="w-full md:w-[45%] p-8">
        <Link to="/" className="inline-block mb-4">
          &larr; Back to all products
        </Link>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="mb-6">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            ${product.price.toLocaleString()}
          </div>
          <BuyButton productId={product.id} />
        </div>
      </div>
    </div>
  )
}
