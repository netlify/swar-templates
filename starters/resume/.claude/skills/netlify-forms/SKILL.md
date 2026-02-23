---
name: netlify-forms
description: Handle Netlify Forms including HTML form setup, spam filtering with honeypot fields, AJAX submissions, and form notifications. Use when implementing contact forms, signup forms, or any form submission handling on Netlify-hosted sites.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify Forms

Netlify Forms automatically handles form submissions without requiring server-side code. Forms are detected at build time and submissions are stored in the Netlify dashboard.

## When to Use

- Adding contact forms to static sites
- Capturing user signups or feedback
- Form submissions without a backend
- Spam filtering without external services

## Basic HTML Form

Add `data-netlify="true"` to any HTML form:

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <p>
    <label>Name: <input type="text" name="name" required /></label>
  </p>
  <p>
    <label>Email: <input type="email" name="email" required /></label>
  </p>
  <p>
    <label>Message: <textarea name="message" required></textarea></label>
  </p>
  <p>
    <button type="submit">Send</button>
  </p>
</form>
```

**Critical**: The hidden `form-name` input MUST match the form's `name` attribute.

## Spam Filtering with Honeypot

Add a honeypot field that bots will fill but humans won't see:

```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="contact" />
  
  <!-- Honeypot field - hidden from humans -->
  <p class="hidden" style="display:none;">
    <label>Don't fill this out: <input name="bot-field" /></label>
  </p>
  
  <p>
    <label>Name: <input type="text" name="name" required /></label>
  </p>
  <p>
    <label>Email: <input type="email" name="email" required /></label>
  </p>
  <p>
    <button type="submit">Send</button>
  </p>
</form>
```

## AJAX/JavaScript Submission

For SPAs or enhanced UX, submit forms via JavaScript:

```typescript
async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  
  const form = event.currentTarget;
  const formData = new FormData(form);
  
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString(),
    });
    
    if (response.ok) {
      // Success - show thank you message or redirect
      console.log('Form submitted successfully');
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Important**: Even with AJAX submission, you need the form HTML present in your built output for Netlify to detect it.

## React Component Example

```tsx
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p>Thank you for your message!</p>;
  }

  return (
    <form 
      name="contact" 
      method="POST" 
      data-netlify="true" 
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p style={{ display: 'none' }}>
        <label>Don't fill this out: <input name="bot-field" /></label>
      </p>
      
      <label>
        Name:
        <input type="text" name="name" required />
      </label>
      
      <label>
        Email:
        <input type="email" name="email" required />
      </label>
      
      <label>
        Message:
        <textarea name="message" required />
      </label>
      
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending...' : 'Send'}
      </button>
      
      {status === 'error' && <p>Something went wrong. Please try again.</p>}
    </form>
  );
}
```

## SPA/Framework Considerations

For React, Vue, or other SPAs where forms are rendered client-side:

1. **Option A**: Include a hidden static HTML form in your `index.html` or a static file:

```html
<!-- In public/index.html or a static HTML file -->
<form name="contact" netlify netlify-honeypot="bot-field" hidden>
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
</form>
```

2. **Option B**: Use a prerendered/SSR page that includes the form markup at build time.

## File Uploads

Forms can accept file uploads:

```html
<form name="upload" method="POST" data-netlify="true" enctype="multipart/form-data">
  <input type="hidden" name="form-name" value="upload" />
  <input type="file" name="attachment" />
  <button type="submit">Upload</button>
</form>
```

**Limits**: 
- Max 10MB per file
- Max 10MB total per submission

## Custom Success Page

Redirect to a thank-you page after submission:

```html
<form name="contact" method="POST" data-netlify="true" action="/thank-you">
  <!-- form fields -->
</form>
```

## Form Notifications

Configure email notifications in Netlify UI:
1. Go to Site settings → Forms → Form notifications
2. Add email notification for form submissions
3. Optionally integrate with Slack, webhooks, or Zapier

## Common Issues

### Form not detected
- Ensure `data-netlify="true"` is present in static HTML at build time
- Check that `name` attribute matches the hidden `form-name` value
- For SPAs, include a hidden static form or use SSR

### Submissions not appearing
- Check the Forms tab in Netlify dashboard
- Verify the form name matches exactly
- Check spam folder in Forms dashboard

### 404 on submission
- Ensure you're posting to `/` or the page URL where the form exists
- Include `Content-Type: application/x-www-form-urlencoded` header for AJAX

## Environment Variables

No environment variables required - Netlify Forms work automatically on Netlify-hosted sites.
