# Weather chat demo

A streaming weather conversation built with TanStack AI and provider adapters. The weather tool returns random sample conditions, temperature, and humidity; it does not call a weather service.

## Source and customization

- `src/routes/index.tsx`: Weather Chat heading, messages, input, send, and stop controls.
- `src/lib/ai-hook.ts`: chat client and SSE connection to `/api/chat`.
- `src/routes/api.chat.ts`: POST `/api/chat` route wrapper.
- `src/lib/chat.server.ts`: request validation, provider configuration, system prompt, streaming, and cancellation.
- `src/lib/weather-tools.ts`: Zod tool schemas and simulated weather implementation.

## Configuration and limits

Netlify AI Gateway is the default setup. On a linked Netlify project with AI Gateway available, Netlify injects provider keys and base URLs; users do not need their own provider keys. The server passes both values to the TanStack AI adapters:

| Provider  | Key                                             | Base URL                 | Default model      |
| --------- | ----------------------------------------------- | ------------------------ | ------------------ |
| Anthropic | `ANTHROPIC_API_KEY`                             | `ANTHROPIC_BASE_URL`     | `claude-haiku-4-5` |
| OpenAI    | `OPENAI_API_KEY`                                | `OPENAI_BASE_URL`        | `gpt-4.1-mini`     |
| Gemini    | `GEMINI_API_KEY` (or existing `GOOGLE_API_KEY`) | `GOOGLE_GEMINI_BASE_URL` | `gemini-2.5-flash` |

An explicit request's provider/model wins over server defaults `AI_PROVIDER`/`AI_MODEL`. The client sends these optional choices in AG-UI `forwardedProps`; legacy `data` is accepted when forwardedProps is absent. With no provider selected, the server chooses the first configured key in the order Anthropic, OpenAI, Gemini. It does not overwrite keys or base URLs, switch providers after failure, or fall back to Ollama. Set `AI_PROVIDER` to select an existing custom provider when several providers are configured. A missing key for the selected provider returns a visible configuration error.

Ollama is a separate opt-in: select `AI_PROVIDER=ollama` (or explicitly request Ollama), set `OLLAMA_HOST`, and optionally set `AI_MODEL` to an installed model. The default Ollama model is `mistral:7b`. `OLLAMA_BASE_URL` is not used. The host must be reachable from the server; deployed localhost is not a user's local machine. Merely setting OLLAMA_HOST does not select Ollama.

Keep keys, URLs, and provider calls on the server. For new Netlify AI integrations, use the Netlify AI Gateway skill and check the [supported models](https://docs.netlify.com/build/ai-gateway/overview/). The defaults above were checked against that list; custom model IDs must also be recognized by the installed adapter. Netlify's CLI or Vite integration can provide gateway configuration locally for an eligible linked project that already has a production deploy. Plain Vite without injected variables or custom server configuration shows an error. Do not deploy or call live providers just to validate this demo.

The endpoint accepts bounded AG-UI conversations, rejects unsupported roles/providers/models, and keeps only the server's weather tool. The client displays configuration/request/stream errors. Stop cancels the client request and provider stream. Tests mock every provider request, including injected URLs, follow-up turns, failures, and cancellation. Weather output is simulated and labeled in the UI, prompt, and tool. There are no saved conversations, accounts, or real weather integration.

Change the visible Weather Chat title in `src/routes/index.tsx` and the prompt/tool together when changing the demo's purpose.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Tailwind, the Netlify adapter, Start, and React plugins. The source package pins Vite 8.3.4 and TypeScript 6.0.3; check package.json before changing versions.

TypeScript 7.0.2 was tested and breaks the current Netlify adapter's build through ts-api-utils, which expects TypeScript's JavaScript compiler API. Keep TypeScript 6 until that dependency path supports the new compiler.

Set `siteName` and `siteDescription` in `src/routes/__root.tsx`; these populate page/social metadata. The current defaults are Netlify App and A Netlify web app. Use actual visible headings/content listed above, not an assumed Application Name placeholder or missing Header component. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

Use Node 22.13+ on the Node 22 line, Node 24, or Node 26+. Installed Start packages require at least Node 22.12; Node 22.13 also supports the repository's newer lint/test tooling. Install dependencies from this starter directory, then run:

```bash
npm install --no-package-lock
npm run dev
npm run build
npm run typecheck
npm test
npm run preview -- --host 127.0.0.1
```

The build does not type-check. Run dev/build once before typecheck to generate route types, and report any failures rather than treating a build as proof of type safety. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- ai-chat` to build and check the home page; also check changed routes and actions locally.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
