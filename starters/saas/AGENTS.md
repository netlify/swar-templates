# SaaS starter

A SaaS landing page with example pricing, an FAQ, and a plan-interest form. It uses TanStack Start, React 19, Vite 8, Tailwind CSS 4, and strict TypeScript 6.0, with the Netlify Vite adapter.

The starter does not implement a SaaS product, authentication, trials, billing, account settings, integrations, or subscription management. Plan names, prices, and descriptions are examples. Replace them with the product's verified offer. Do not add claims about certifications, encryption, availability, integrations, or support guarantees without evidence.

## Files and routes

- `src/lib/content.ts`: site name and description, plans, FAQ answers, form name, and submission endpoint. Keep pricing and FAQ copy consistent here.
- `src/routes/index.tsx`: landing page and pricing cards. Each plan links to its enquiry.
- `src/routes/faq.tsx`: native `details`/`summary` disclosures. Keep their keyboard and expanded-state behavior when restyling.
- `src/routes/contact.tsx`: `/contact?plan=starter`, `pro`, or `enterprise`. Search validation defaults unknown plans to Starter. Changing the select updates the URL without clearing other fields.
- `src/components/InterestForm.tsx`: labelled native fields, browser validation, pending, failure/retry, and received states. This is an enquiry, never an account or subscription action.
- `src/components/SiteNavigation.tsx`: shared home, pricing, FAQ, and enquiry links, plus a skip link.
- `src/routes/__root.tsx`: HTML shell, shared navigation, main landmark, footer, and default social metadata. Each route supplies its own title and description.
- `public/__forms.html`: static Netlify Forms registration, copied to `dist/client/__forms.html` during build.
- `src/router.tsx`: registered router types and scroll restoration. `src/routeTree.gen.ts` is generated; don't edit it.

## Enquiry delivery

The default uses Netlify Forms with the form name `plan-interest`. It sends `plan`, `name`, `email`, optional `company`, `message`, `subject`, and the honeypot `bot-field`. Keep every submitted field and the form name in sync with `public/__forms.html`.

For a generated site using Netlify Forms, follow the Netlify Forms skill, run its enable script, and enable form detection for that site before its authorized deployment. The static registration file is required for server-rendered apps. See [Netlify's setup guide](https://docs.netlify.com/manage/forms/setup/).

POST to the static registration path `/__forms.html`, not `/`, which is handled by SSR. Requests use `application/x-www-form-urlencoded` with `form-name=plan-interest`. Only show the received state after a successful response. Keep entered details and the selected plan when requests fail. Do not log enquiry details.

`vite dev` and `vite preview` do not process Netlify Forms. They may return the unchanged registration HTML with status 200. The form detects the remaining `data-netlify` attribute and reports that nothing was sent. This local response must never be presented as a successful enquiry. Tests mock delivery; they do not submit to a live site.

To use another destination, change `interestForm.endpoint` in `src/lib/content.ts` to a trusted form endpoint that accepts the URL-encoded fields and returns a 2xx response only after accepting the enquiry. Add server validation and the destination's required spam protection there. Keep secrets on the server. Do not put credentials in a client-side URL. Do not send personal data to an example or unconfigured destination.

## Development

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Node types stay on 22 to match the oldest supported runtime. TypeScript 6.0 is pinned because the current ESLint parser supports versions below 6.1.

```bash
npm install
npm run dev          # Port 3000
npm run build        # Client and SSR build, generates route types
npm run typecheck    # Build alone does not type-check
npm run lint
npm run format:check
npm run format
npm test             # Both .test.ts and .test.tsx files
npm run preview
```

Run build once before type-checking a fresh copy to generate route types. Run all checks after changes, then check the primary actions and FAQ keyboard interactions locally. Tests use generic contact data and mocked delivery.

Dependencies use exact versions. Refresh supported packages and remove unused/duplicate entries when changing the template. Check peer compatibility rather than forcing incompatible major upgrades. Vite reads the `@/*` alias from `tsconfig.json` through `resolve.tsconfigPaths`; no separate paths plugin is needed.

## Editing the product

Set the product name, metadata, pricing, plan descriptions, action labels, and FAQ in `src/lib/content.ts`. Keep action labels honest about their destination. If account creation or checkout is added later, implement it before changing enquiry buttons to signup or purchase language.

Keep labelled inputs, native validation, visible focus, pending protection, and announced error/success messages. Preserve the shared navigation and responsive layout. Use typed `Link` components for routes and `hash="pricing"` for the pricing section. Honor reduced motion when adding animation.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use `notFound()` for missing records and keep browser APIs in effects or event handlers, not SSR renders or initial state initializers.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the matching framework/Netlify skills when available in a generated project; don't assume the starter contains a `.claude` directory.
