---
name: netlify-forms-tanstack
description: Handle Netlify Forms in TanStack Start. Use when implementing contact forms, signup forms, or any form submission handling on Netlify-hosted TanStack Start sites.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify Forms in TanStack Start

Apply the base netlify-forms skill for service activation, spam protection, and notifications. This addendum covers SSR registration, submission routing, and honest client states. A contact/signup-interest form is not account creation.

TanStack Start renders server responses and hydrates them in the browser. Netlify form detection scans static build output, not the SSR function's later responses. Place a hidden registration form in public; Vite copies it into dist/client for deploy-time scanning. Enable form detection for a generated site before its authorized deployment. Updating these instructions does not authorize a deployment or live test submission.

## Static registration

Every submitted field, form-name, and honeypot must match the React form. This file includes bot-field as well as its honeypot attribute.

```html file=public/contact-form.html
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Contact form registration</title></head>
  <body>
    <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden>
      <input type="hidden" name="form-name" value="contact" />
      <input name="name" />
      <input name="email" type="email" />
      <textarea name="message"></textarea>
      <input name="bot-field" />
    </form>
  </body>
</html>
```

## Complete component

POST to /contact-form.html, not /, which the SSR catch-all handles. Use URLSearchParams instead of a hand-written encoder. Capture FormData before disabling the fieldset. A resolved fetch is not proof of success: reject non-2xx responses and the unchanged static registration file that a plain Vite preview can return with status 200.

```tsx file=src/components/ContactForm.tsx
import { useState, type FormEvent } from 'react'

type State = 'idle' | 'pending' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<State>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'pending') return
    const body = new URLSearchParams()
    new FormData(event.currentTarget).forEach((value, key) => body.append(key, String(value)))
    setState('pending')
    try {
      const response = await fetch('/contact-form.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error('Submission failed')
      const isUnprocessedRegistration = /\bdata-netlify\s*=/i.test(await response.text())
      if (isUnprocessedRegistration) throw new Error('Form handling is unavailable')
      setState('success')
    } catch {
      setState('error')
    }
  }

  return <form name="contact" method="POST" action="/contact-form.html" data-netlify="true" netlify-honeypot="bot-field"
    onSubmit={submit} onChange={() => { if (state !== 'pending') setState('idle') }}>
    <input type="hidden" name="form-name" value="contact" />
    <p hidden><label>Leave empty<input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
    <fieldset disabled={state === 'pending'}>
      <legend>Contact details</legend>
      <label>Name<input name="name" autoComplete="name" required maxLength={100} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Message<textarea name="message" required maxLength={2000} /></label>
      <button type="submit">{state === 'pending' ? 'Sending…' : 'Send message'}</button>
    </fieldset>
    {state === 'error' && <p role="alert">Nothing was confirmed as sent. Your details are still here; please try again when form handling is available.</p>}
    {state === 'success' && <p role="status">Your message was received.</p>}
  </form>
}
```

Keep values on failure, prevent duplicate pending sends, and clear old success/error messages when fields change. Never log submitted personal details. Validate and add appropriate spam protection at a custom server endpoint if the destination is replaced.

## Verification

Check that the static file exists in dist/client after building and that field names match. Mock HTTP success, HTTP failure, network failure, pending submissions, and unprocessed-preview HTML locally. Vite alone does not deliver Netlify Forms submissions. Do not report live delivery from a local 200 response, and do not deploy or send live submissions without authorization.

Reference: https://docs.netlify.com/manage/forms/setup/
