import { useEffect, useRef, useState, type FormEvent } from 'react'
import products, { formatPrice } from '../data/products'
import { enquiryForm } from '../data/site'

type Submission =
  | { status: 'idle' | 'pending' | 'error' }
  | { status: 'success'; productName: string }

export function EnquiryForm({
  productId,
  onProductChange,
}: {
  productId: number
  onProductChange: (id: number) => void
}) {
  const [submission, setSubmission] = useState<Submission>({ status: 'idle' })
  const submitting = useRef(false)
  const product = products.find((item) => item.id === productId)

  useEffect(() => {
    if (!submitting.current) setSubmission({ status: 'idle' })
  }, [productId])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || submission.status === 'success' || !product)
      return
    const body = new URLSearchParams()
    new FormData(event.currentTarget).forEach((value, key) =>
      body.append(key, String(value)),
    )
    submitting.current = true
    setSubmission({ status: 'pending' })
    try {
      const response = await fetch(enquiryForm.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok || /\bdata-netlify\s*=/i.test(await response.text()))
        throw new Error('Enquiry was not accepted')
      setSubmission({ status: 'success', productName: product.name })
    } catch {
      setSubmission({ status: 'error' })
    } finally {
      submitting.current = false
    }
  }

  return (
    <section
      id="enquiry"
      tabIndex={-1}
      aria-labelledby="enquiry-heading"
      className="scroll-mt-8 max-w-2xl mx-auto py-12"
    >
      <h2 id="enquiry-heading" className="text-3xl font-bold mb-3">
        Enquire about a product
      </h2>
      <p id="enquiry-note" className="mb-6 text-gray-600">
        Ask about specifications, availability, or pricing. This sends an
        enquiry; it doesn’t place an order or take payment. Product details and
        prices are examples.
      </p>
      <form
        name={enquiryForm.name}
        method="POST"
        action={enquiryForm.endpoint}
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={submit}
        aria-busy={submission.status === 'pending'}
        onChange={() => {
          if (!submitting.current) setSubmission({ status: 'idle' })
        }}
        className="rounded-2xl border p-6 sm:p-8 space-y-5"
      >
        <input type="hidden" name="form-name" value={enquiryForm.name} />
        <input
          type="hidden"
          name="subject"
          value={`Product enquiry: ${product?.name ?? ''}`}
        />
        <input type="hidden" name="product-name" value={product?.name ?? ''} />
        <p hidden>
          <label>
            Leave this empty
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
        <fieldset
          disabled={
            submission.status === 'pending' || submission.status === 'success'
          }
          className="space-y-5 disabled:opacity-70"
        >
          <legend className="sr-only">Your product enquiry</legend>
          <div>
            <label htmlFor="enquiry-product" className="form-label">
              Product
            </label>
            <select
              id="enquiry-product"
              name="product-id"
              value={productId}
              onChange={(event) => onProductChange(Number(event.target.value))}
              required
              className="form-input"
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatPrice(item.price)} (example)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="enquiry-name" className="form-label">
              Name
            </label>
            <input
              id="enquiry-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="enquiry-email" className="form-label">
              Email
            </label>
            <input
              id="enquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="enquiry-message" className="form-label">
              What would you like to know?
            </label>
            <textarea
              id="enquiry-message"
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              className="form-input"
            />
          </div>
          <button
            type="submit"
            aria-describedby="enquiry-note"
            className="action"
          >
            {submission.status === 'pending' ? 'Sending…' : 'Send enquiry'}
          </button>
        </fieldset>
        <p role="status" className="sr-only">
          {submission.status === 'pending' ? 'Sending your enquiry…' : ''}
        </p>
        {submission.status === 'error' && (
          <p role="alert">
            We couldn’t confirm your enquiry. Your details are still here;
            please try again. Local previews don’t process submissions.
          </p>
        )}
        {submission.status === 'success' && (
          <div>
            <p role="status">
              Your enquiry about {submission.productName} was received. No order
              or payment was made.
            </p>
            <button
              type="button"
              className="mt-4 underline"
              onClick={() => setSubmission({ status: 'idle' })}
            >
              Send another enquiry
            </button>
          </div>
        )}
      </form>
    </section>
  )
}
