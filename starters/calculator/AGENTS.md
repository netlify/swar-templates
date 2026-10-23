# Calculator demo

A single-page arithmetic calculator using a React reducer. It supports digit/decimal entry, addition, subtraction, multiplication, division, clear, sign changes, and percent (divide the displayed value by 100).

## Source and customization

- `src/components/Calculator.tsx`: state, reducer, evaluation, display formatting, and buttons.
- `src/routes/index.tsx`: page container and Calculator mount.

## Behavior and limits

Operations are evaluated sequentially, without expression parsing or operator precedence. Division by zero displays Error. Calculations use JavaScript floating-point numbers; this is not a money or high-precision calculator. State resets on reload. There is no history, storage, API, or required environment variable.

The reducer tracks pending-operand entry separately from replacement of the displayed number. Percent divides the displayed value by 100 and remains usable by a pending operation: `200 × 10 % =` produces `20`. Typing after percent replaces that operand. Percent is not relative to the previous operand, so `200 + 10 % =` produces `200.1`, not `220`.

Leading decimals become `0.5` or `-0.5`, including after an operator or result. Sign change on zero allows entering a negative decimal; after choosing an operator it starts a negative second operand. Entered trailing decimal zeros are preserved. Division by zero and non-finite arithmetic display Error; digit/decimal entry, clear, or Backspace starts fresh. Repeated equals does not repeat the last operation. Choosing another operator before a second operand replaces the pending operator.

Keyboard controls work while the calculator is mounted: digits, `.`, `+`, `-`, `*`, `/`, `%`, Enter or `=` to evaluate, Backspace to delete a digit, Escape/Delete/C to clear, and F9 to toggle the sign. Modified shortcuts and text-editing fields are left alone. Space still activates a focused button normally; Enter evaluates even when a calculator button has focus. The result is announced through a live status region. There is no dedicated backspace button.

Customize the reducer, keyboard handler, and display in `src/components/Calculator.tsx`; update root metadata for the product name. Keep arithmetic/input interaction tests in `src/components/Calculator.test.tsx` aligned with the behavior above. Scientific notation can appear for very small/large results, but scientific operations are not implemented.

## Shared structure and development

TanStack Start and React 19 use file routes in `src/routes/`, `src/router.tsx`, and the generated `src/routeTree.gen.ts`. `vite.config.ts` runs Tailwind, the Netlify adapter, Start, and React plugins. The source package pins Vite 8.3.5 and TypeScript 6.0.3; the current Netlify adapter dependency path is incompatible with TypeScript 7's compiler API.

Set `siteName` and `siteDescription` in `src/routes/__root.tsx`; these populate page/social metadata. The current defaults are Netlify App and A Netlify web app. Use actual visible headings/content listed above, not an assumed Application Name placeholder or missing Header component. Global CSS is `src/styles.css`. Public files are copied from `public/` into the client output.

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

The build does not type-check. Run dev/build once before typecheck to generate route types, and report failures rather than treating a build as proof of type safety. Tests interact with the actual buttons and keyboard, covering percentages, decimals, chaining, operator replacement, overflow, division by zero, and recovery. `netlify.toml` builds with vite build, publishes `dist/client`, and configures the development proxy on 8888 to Vite on 3000. From the repository root, run `npm run smoke -- calculator`; also check arithmetic and shortcuts locally. CI runs the calculator's type-check, format check, and tests after the smoke build.

Loaders run on the server and during client navigation. Use server functions for secrets or server-only work, with runtime `.validator(...)` input validation. Use typed Link destinations/params, and use notFound() for missing records when implementing proper 404 behavior. Browser APIs belong in effects/event handlers, never an SSR render or initial state initializer.

Refresh compatible dependencies and remove unused/duplicate entries when implementing template changes. Check peer requirements and the installed APIs; don't force incompatible major versions. Preserve appearance and working behavior while fixing a specific issue. Do not add persistence, authentication, or external services unless the requested feature needs them.

Shared framework skill source lives under `frameworks/tanstack-start-react/.claude/skills` in this repository, separate from the standalone starter. Consult the named framework/Netlify skills when available in a generated project; do not assume a starter already contains a .claude directory.
