import Stripe from 'stripe'
import { createServerFn } from '@tanstack/react-start'
import motorcycles from '@/data/motorcycles'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const createCheckoutSession = createServerFn({
  method: 'POST',
})
  .inputValidator((motorcycleId: number) => motorcycleId)
  .handler(async ({ data: motorcycleId }) => {
    const motorcycle = motorcycles.find((m) => m.id === motorcycleId)
    if (!motorcycle) {
      throw new Error('Motorcycle not found')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: motorcycle.name,
              description: motorcycle.shortDescription,
              images: [motorcycle.image],
            },
            unit_amount: motorcycle.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL ?? 'http://localhost:3000'}/checkout/success`,
      cancel_url: `${process.env.SITE_URL ?? 'http://localhost:3000'}/checkout/cancel`,
    })

    return session.url
  })
