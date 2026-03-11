---
name: netlify-forms-ts
description: Handle Netlify Forms in TanStack Start. Use when implementing contact forms, signup forms, or any form submission handling on Netlify-hosted TanStack Start sites.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify Forms — TanStack Start Addendum

> **Base skill**: General Netlify Forms usage (HTML setup, spam filtering, honeypot fields, notifications) is covered by the `netlify-forms` skill in the agent-runner base skills. This skill covers **only** the TanStack Start-specific requirement on top of that.

---

## The Problem: Netlify Can't Detect React-Rendered Forms

TanStack Start renders pages via React on the client side. Netlify's build-time form detection works by scanning the **static HTML output** of your build. Because TanStack Start's forms live inside React components, Netlify never sees them during the build — so the form is never registered and submissions will return 404.

---

## The Solution: Dummy Static Form in `./public/`

Place a minimal static HTML file in `./public/` containing a hidden form that mirrors your React form's fields. Netlify scans `public/` at build time, registers the form name, and starts accepting submissions to it.

### `public/contact-form.html`

```html
<!DOCTYPE html>
<html>
  <body>
    <!-- This file exists only so Netlify registers the form at build time. -->
    <!-- It is never shown to users. -->
    <form name="contact" netlify netlify-honeypot="bot-field" hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <textarea name="message"></textarea>
    </form>
  </body>
</html>
```

**Rules:**
- `name="contact"` must exactly match the `name` attribute in your React component's fetch call.
- Include every field your React form submits — Netlify validates field names against the registered form.
- Add `netlify-honeypot="bot-field"` here if your React form uses a honeypot field.

---

## The React Component

Submit via AJAX using `fetch` with `application/x-www-form-urlencoded` encoding. Do **not** use a plain `<form action="/">` — that causes a full-page reload and breaks TanStack Router's client-side navigation.

```tsx
import { useState } from 'react'

function encode(data: Record<string, string>) {
  return Object.entries(data)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('&')
}

export function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFields({ ...fields, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ 'form-name': 'contact', ...fields }),
    })
    setSubmitted(true)
  }

  if (submitted) return <p>Thanks! We'll be in touch.</p>

  return (
    <form onSubmit={handleSubmit}>
      {/* Required hidden field — tells Netlify which registered form this maps to */}
      <input type="hidden" name="form-name" value="contact" />

      <label>
        Name
        <input type="text" name="name" value={fields.name} onChange={handleChange} required />
      </label>
      <label>
        Email
        <input type="email" name="email" value={fields.email} onChange={handleChange} required />
      </label>
      <label>
        Message
        <textarea name="message" value={fields.message} onChange={handleChange} required />
      </label>
      <button type="submit">Send</button>
    </form>
  )
}
```

**Key points:**
- The hidden `<input name="form-name" value="contact" />` is mandatory — it tells Netlify which form to associate the submission with.
- `e.preventDefault()` prevents full-page navigation.
- The `fetch` body uses URL-encoded encoding, not JSON — Netlify Forms requires this format.

---

## Checklist

- [ ] `public/contact-form.html` exists with a `netlify` attribute and all field names
- [ ] React component has `<input type="hidden" name="form-name" value="contact" />`
- [ ] `fetch` posts to `'/'` with `Content-Type: application/x-www-form-urlencoded`
- [ ] Form `name` in `public/` HTML matches `form-name` value in the React component
- [ ] Deployed to Netlify (forms don't work in local dev — test on a deploy preview)
