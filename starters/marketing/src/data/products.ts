export interface Product {
  id: number
  name: string
  image: string
  imageAlt: string
  description: string
  shortDescription: string
  price: number
}

const products: Array<Product> = [
  {
    id: 1,
    name: 'Desk organizer',
    image: '/placeholder.png',
    imageAlt: 'Placeholder for a desk organizer product photo',
    description:
      'An example organizer concept for keeping pens, notes, and small essentials together. Tell us about your space, preferred dimensions, and quantities in a product enquiry.',
    shortDescription: 'Keep everyday desk essentials together in one place.',
    price: 45,
  },
  {
    id: 2,
    name: 'Cable tray',
    image: '/placeholder.png',
    imageAlt: 'Placeholder for a cable tray product photo',
    description:
      'An example cable tray concept for grouping desk cables. Ask about dimensions, mounting requirements, and quantities before making a purchase decision.',
    shortDescription: 'Give desk cables a dedicated place.',
    price: 25,
  },
]

export default products

export function findProduct(id: string) {
  return products.find((product) => String(product.id) === id)
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
