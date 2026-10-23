import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { formatPrice, type Product } from '../data/products'
import { EnquiryForm } from './EnquiryForm'

export function ProductPage({ product }: { product: Product }) {
  const [productId, setProductId] = useState(product.id)
  return (
    <main className="max-w-7xl mx-auto p-5">
      <Link to="/" className="inline-block mb-8 underline">
        Back to the collection
      </Link>
      <div className="flex flex-col md:flex-row gap-8">
        <figure className="w-full md:w-[55%] min-w-0">
          <img
            src={product.image}
            alt={product.imageAlt}
            className="w-full aspect-[4/3] rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-sm text-gray-500">
            Product image placeholder
          </figcaption>
        </figure>
        <div className="min-w-0 flex-1 py-8 md:px-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="mb-6">{product.description}</p>
          <p className="text-2xl font-bold mb-2">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Example price. Confirm specifications, availability, and pricing
            before ordering.
          </p>
          <a
            href="#enquiry"
            className="action"
            onClick={() => setProductId(product.id)}
          >
            Enquire about this product
          </a>
        </div>
      </div>
      <EnquiryForm productId={productId} onProductChange={setProductId} />
    </main>
  )
}
