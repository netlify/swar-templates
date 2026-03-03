import { Link, createFileRoute } from '@tanstack/react-router'
import products from '@/data/products'
import { BuyButton } from '@/components/BuyButton'

export const Route = createFileRoute('/')({
  component: ProductsIndex,
})

function ProductsIndex() {
  return (
    <div className="bg-black text-white p-5">
      <h1 className="text-3xl font-bold mb-16 text-center">Product Company</h1>
      <div className="max-w-7xl mx-auto">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`relative flex flex-col md:flex-row items-stretch gap-8 mb-32 ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className="w-full md:w-[60%] relative">
              <Link
                to="/products/$productId"
                params={{
                  productId: product.id.toString(),
                }}
                className="group block relative"
              >
                <div className="relative z-0 w-full aspect-[4/3]">
                  <div className="w-full h-full overflow-hidden rounded-2xl border border-gray-800/50 shadow-2xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-500/80 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                    View Details
                  </div>
                </div>
              </Link>
            </div>

            <div
              className={`w-full md:w-[50%] relative ${index % 2 === 0 ? 'md:-ml-24' : 'md:-mr-24'} md:my-12`}
            >
              <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-500/20 shadow-2xl relative z-10">
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-white/0"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-3">{product.name}</h2>
                  <p className="text-gray-100 mb-4 leading-relaxed">
                    {product.shortDescription}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-emerald-400">
                      ${product.price.toLocaleString()}
                    </div>
                    <BuyButton productId={product.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
