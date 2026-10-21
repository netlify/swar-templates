import { createFileRoute, notFound } from '@tanstack/react-router'
import { findProduct } from '../../data/products'
import { site } from '../../data/site'
import { ProductPage } from '../../components/ProductPage'

export const Route = createFileRoute('/products/$productId')({
  loader: ({ params }) => {
    const product = findProduct(params.productId)
    if (!product) throw notFound()
    return product
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} | ${site.name}` },
            { name: 'description', content: loaderData.shortDescription },
            {
              property: 'og:title',
              content: `${loaderData.name} | ${site.name}`,
            },
            {
              property: 'og:description',
              content: loaderData.shortDescription,
            },
          ],
        }
      : {},
  component: ProductRoute,
})

function ProductRoute() {
  const product = Route.useLoaderData()
  return <ProductPage key={product.id} product={product} />
}
