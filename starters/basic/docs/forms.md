# Form pattern

`src/examples/validated-form.tsx` is an unmounted, type-checked example. It uses React Hook Form, Zod, and the local Form components. It has no backend or persistence. Import it into a route only when building a feature that needs it, then replace its email schema and copy with that feature's fields.

The example validates before submission, links field errors to the input, disables submission while pending, preserves input on failure, and announces success only after the required handler resolves. The handler must reject when the server rejects the request. `fetch` resolving does not mean the response succeeded.

After implementing your own `/api/contact` handler, connect it like this:

```tsx
import { ValidatedForm } from '@/examples/validated-form'

export function ContactForm() {
  return (
    <ValidatedForm
      onSubmit={async (values) => {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!response.ok) {
          throw new Error('Submission failed')
        }
      }}
    />
  )
}
```

The endpoint is an example address, not a route supplied by Basic. Validate input again on the server. Don't return success until the requested operation has completed.

For Netlify Forms, use the supplied Netlify Forms skill instead of this JSON endpoint: mirror the fields in static HTML, send URL-encoded data to that static path, and check the response status. Keep the example's validation, pending, and failure behaviour.

Keep a visible label for every field. Give required fields both a schema rule and a `required` attribute. Use `FormDescription` for hints and `FormMessage` for field errors. Show submission failures in a separate `role="alert"` message without displaying internal exception details. Test invalid input, a rejected response, pending submission, success, and retry.
