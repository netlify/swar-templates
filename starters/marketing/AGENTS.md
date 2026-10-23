# Product marketing and enquiries

A promotional landing page with benefits, optional alternating product sections, detail routes, and a Netlify Forms product-enquiry flow. It has no cart, checkout, payment provider, or accounts. Products, images, and prices are clearly labeled examples.

## Source and customization

- `src/data/site.ts`: brand, description, benefits, showCatalog, and enquiryForm destination/name.
- `src/data/products.ts`: typed product copy, IDs, example USD prices, local placeholder images/alt text, and strict ID lookup.
- `src/components/MarketingPage.tsx`: promotional introduction, benefits, optional catalogue, and product selection.
- `src/components/ProductPage.tsx`: detail layout and enquiry action.
- `src/components/EnquiryForm.tsx`: controlled product selection and submission states.
- `src/routes/products/$productId.tsx`: product loader, metadata, and notFound handling.
- `public/__forms.html`: static form registration for Netlify.

## Behavior and limits

The homepage's primary action opens the enquiry section. Each product action selects that product without clearing contact details; detail pages initialize the form with their own product. Success names the product submitted, even if another action changes selection while the request is pending. There is no order placement or payment. Unknown, missing, or noncanonical IDs produce a 404 with a link back to the collection, not a generic application error.

Set site.showCatalog to false to keep a promotional page with benefits and an enquiry form without product cards or detail links. Detail routes remain available; removing them is separate from hiding the catalogue. Keep at least one product configured for enquiries. Replace the local image placeholders and their alt text when adding real products. Product benefits and example prices are not verified commercial claims.

## Enquiry destination and states

The default enquiryForm endpoint is `/__forms.html` and form name is product-enquiry, both configured in `src/data/site.ts`. The component POSTs URL-encoded form-name, subject, product-id, product-name, name, email, message, and bot-field. Keep the static registration in sync with the form name and every submitted field. Netlify form detection must be enabled on the generated site. Vite previews don't process submissions.

The form disables fields and blocks duplicate requests while pending. It checks response.ok and rejects unchanged registration HTML, so a plain preview's HTTP 200 is not mistaken for delivery. HTTP errors, network failures, and the 15-second timeout preserve details and selection for retry. Accepted responses show success for the submitted product and require Send another enquiry before another submission. Acceptance does not prove an email notification or downstream delivery.

To use another service, change enquiryForm.endpoint to a configured endpoint that accepts this URL-encoded payload and returns an appropriate success/error status. Configure CORS if it is cross-origin. Keep secrets server-side, and update form registration if its name/fields change. The default flow requires no application environment variables. Do not deploy or submit to a live form for testing without explicit authorization.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Tailwind, the Netlify adapter, Start, and React plugins. Check package.json for pinned versions. TypeScript stays on 6 because the Netlify adapter's build tooling uses compiler APIs absent from TypeScript 7.

Set site.name and site.description in `src/data/site.ts`; root page/social metadata uses these values. Product routes override titles and descriptions with the loaded product's copy. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Installed Start packages require at least Node 22.12; Node 22.13 also supports the repository's newer lint/test tooling. Install dependencies from this starter directory, then run:

```bash
npm install --no-package-lock
npm run dev
npm run build
npm run typecheck
npm test
npm run format:check
npm run preview -- --host 127.0.0.1
```

The build does not type-check. Run dev/build once before typecheck to generate route types. Tests mock submission delivery and cover product context, static registration, accepted responses, HTTP rejection, network failure, timeout, pending duplicates, retry, configurable destination, catalogue visibility, and exact ID lookup. Check real product routes, HTTP 404s, metadata, image loading, anchor focus, and narrow layouts in a local browser as well. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- marketing` to build and check the home page.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
