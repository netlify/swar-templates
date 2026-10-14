# Weather chat demo

A streaming weather conversation built with TanStack AI and provider adapters. The weather tool returns random sample conditions, temperature, and humidity; it does not call a weather service.

## Source and customization

- `src/routes/index.tsx`: Weather Chat heading, messages, input, send, and stop controls.
- `src/lib/ai-hook.ts`: chat client and SSE connection to `/api/chat`.
- `src/routes/api.chat.ts`: POST `/api/chat`, system prompt, provider selection, streaming, and error responses.
- `src/lib/weather-tools.ts`: Zod tool schemas and simulated weather implementation.

## Configuration and limits

The route selects Anthropic when `ANTHROPIC_API_KEY` exists, otherwise OpenAI with `OPENAI_API_KEY`, otherwise Gemini with `GEMINI_API_KEY`. These checks override a requested provider/model. When none of those keys is set, it keeps the requested provider even if that provider's key is unset; Ollama is selected only when the request omits a provider or explicitly requests Ollama. The Gemini adapter accepts `GOOGLE_API_KEY` too, but that variable alone does not trigger this route's Gemini branch. The Ollama adapter reads `OLLAMA_HOST`, defaulting to the server's `http://localhost:11434`; deployed localhost is not a user's local machine. `OLLAMA_BASE_URL` is not read by this adapter.

Keep keys and provider calls on the server. For new Netlify AI integrations, use the Netlify AI Gateway skill and its supported models, honor existing credentials, and use Ollama only when explicitly requested. The current route has no explicit gateway configuration; do not claim otherwise. Do not copy its hardcoded model names into new integrations without checking current support. Weather output is simulated, and the demo has no saved conversations, accounts, or real weather integration. Provider requests and cancellation need interaction checks beyond a build.

Change the visible Weather Chat title in `src/routes/index.tsx` and the prompt/tool together when changing the demo's purpose.

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

Only dev and build are defined in this starter's package.json. The build does not type-check. Run dev/build once before tsc to generate route/content types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- ai-chat` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
