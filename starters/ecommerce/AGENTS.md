# Stripe checkout example

A static product catalog with a server-created Stripe Checkout session. It is a checkout example, not an order-management or fulfillment system.

## Source and customization

- `src/data/products.ts`: product IDs, descriptions, USD prices, and images.
- `src/routes/index.tsx`: Product Company catalog.
- `src/routes/products/$productId.tsx`: product detail loader/page.
- `src/components/BuyButton.tsx`: configuration check, pending button, and Checkout redirect.
- `src/lib/stripe.ts`: configuration server function and Checkout session creation.
- `src/routes/checkout/success.tsx` and `src/routes/checkout/cancel.tsx`: return pages.

## Configuration and limits

`STRIPE_SECRET_KEY` is required server-side for checkout. Without it, the button becomes Checkout Unavailable. `SITE_URL` supplies the return-page origin; it falls back to `http://localhost:3000`, so configure the correct origin for a real site. Never expose the secret through a `VITE_*` variable.

The session buys one catalog item, quantity one, using its server-side price. There is no cart, inventory, webhook, verified payment status, order database, receipt delivery, or shipping workflow. Anyone can visit the success URL; its current purchase/shipping copy is not evidence of a payment or dispatched order. Checkout errors currently go to the console rather than an inline message. Unknown product IDs currently throw a generic error.

Keep the server catalog authoritative for prices and validate inputs when modifying checkout. Do not add an automatic order workflow unless requested. Replace Product Company in `src/routes/index.tsx`, catalog content in `src/data/products.ts`, and root metadata.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Tailwind, the Netlify adapter, Start, and React plugins. The source package pins Vite 7.3.7 and TypeScript 5.9.3; check package.json before changing versions.

Set `siteName` and `siteDescription` in `src/routes/__root.tsx`; these populate page/social metadata. The current defaults are Netlify App and A Netlify web app. Use actual visible headings/content listed above, not an assumed Application Name placeholder or missing Header component. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Installed Start packages require at least Node 22.12; Node 22.13 also supports the repository's newer lint/test tooling. Install dependencies from this starter directory, then run:

```bash
npm install --no-package-lock
npm run dev
npm run build
npx --no-install tsc --noEmit
npx --no-install vite preview --host 127.0.0.1
```

Only dev and build are defined in this starter's package.json. The build does not type-check. Run dev/build once before tsc to generate route/content types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- ecommerce` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
