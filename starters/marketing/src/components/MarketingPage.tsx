import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import products, { formatPrice } from '../data/products'
import { site } from '../data/site'
import { EnquiryForm } from './EnquiryForm'

export function MarketingPage() {
  const [productId, setProductId] = useState(products[0]?.id ?? 0)
  return (
    <main className="p-5 max-w-7xl mx-auto">
      <header className="py-6 border-b">
        <a href="#top" className="text-xl font-bold">
          {site.name}
        </a>
      </header>
      <section id="top" className="py-16 max-w-3xl">
        <p className="text-sm text-gray-600 mb-3">
          An example product collection
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          A place for everything on your desk.
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore simple desk accessories, then tell us what would work for your
          space.
        </p>
        <a href="#enquiry" className="action">
          Discuss your workspace
        </a>
      </section>
      <section aria-labelledby="benefits-heading" className="pb-16">
        <h2 id="benefits-heading" className="text-2xl font-bold mb-6">
          Start with what you need
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {site.benefits.map((benefit) => (
            <div key={benefit.title}>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>
      {site.showCatalog && (
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="text-3xl font-bold mb-8">
            Explore the collection
          </h2>
          {products.map((product, index) => (
            <article
              key={product.id}
              className={`flex flex-col md:flex-row items-stretch gap-8 mb-16 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <figure className="w-full md:w-[55%] min-w-0">
                <Link
                  to="/products/$productId"
                  params={{ productId: String(product.id) }}
                >
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="w-full aspect-[4/3] object-cover rounded-2xl"
                  />
                </Link>
                <figcaption className="mt-2 text-sm text-gray-500">
                  Product image placeholder
                </figcaption>
              </figure>
              <div className="w-full md:flex-1 min-w-0 md:my-8 rounded-2xl p-8 border">
                <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
                <p className="mb-4 leading-relaxed">
                  {product.shortDescription}
                </p>
                <p className="font-bold mb-6">
                  {formatPrice(product.price)}{' '}
                  <span className="text-sm font-normal">(example price)</span>
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <a
                    href="#enquiry"
                    className="action"
                    onClick={() => setProductId(product.id)}
                  >
                    Enquire about {product.name.toLowerCase()}
                  </a>
                  <Link
                    to="/products/$productId"
                    params={{ productId: String(product.id) }}
                    className="underline"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      <EnquiryForm productId={productId} onProductChange={setProductId} />
      <footer className="py-8 border-t text-sm text-gray-600">
        {site.name}. Example products and prices; confirm details before
        purchasing.
      </footer>
    </main>
  )
}
