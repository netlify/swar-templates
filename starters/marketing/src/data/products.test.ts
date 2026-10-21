import { describe, expect, it } from 'vitest'
import products, { findProduct } from './products'

describe('product lookup', () => {
  it('looks up exact product IDs', () => {
    for (const product of products)
      expect(findProduct(String(product.id))).toBe(product)
  })
  it.each(['missing', '999', '01', '1.0', '1e0', ''])(
    'rejects unknown or noncanonical ID %s',
    (id) => {
      expect(findProduct(id)).toBeUndefined()
    },
  )
})
