---
name: tanstack-ai-code-mode
description: Set up and use TanStack AI Code Mode with sandboxed TypeScript execution. Use only when the customer specifically requests "code mode" in relation to how the AI operates — for example, adding code mode to a TanStack Start project, configuring isolate drivers, defining server tools, or wiring up the code mode chat API endpoint.
---

# TanStack AI Code Mode Setup

Code Mode is a pattern from `@tanstack/ai-code-mode` where the LLM writes a single TypeScript program that calls your server tools as `external_*` functions inside a sandboxed VM, instead of making many individual tool calls. This reduces LLM round-trips, saves tokens, and produces faster responses.

## Prerequisites

- **Node.js 24** — required for `isolated-vm` (the native V8 sandbox). Falls back to QuickJS on other versions.
- At least one AI provider key: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GEMINI_API_KEY` in `.env.local`.

## Core Packages

```
@tanstack/ai                  # chat(), toolDefinition(), toServerSentEventsStream()
@tanstack/ai-code-mode        # createCodeMode() — produces tool + systemPrompt
@tanstack/ai-isolate-node     # V8 isolate sandbox driver (requires Node 24)
@tanstack/ai-isolate-quickjs  # QuickJS fallback sandbox driver
```

Provider adapters (pick at least one):

```
@tanstack/ai-anthropic
@tanstack/ai-openai
@tanstack/ai-gemini
```

Add `isolated-vm` to `pnpm.onlyBuiltDependencies` in `package.json` so the native addon compiles:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "isolated-vm", "lightningcss"]
  }
}
```

## Step 1: Create the Isolate Driver

Create a factory that tries the Node isolate first, falling back to QuickJS:

```typescript
// src/lib/create-isolate-driver.ts
import type { IsolateDriver } from '@tanstack/ai-code-mode'

export type IsolateVM = 'node' | 'quickjs'

const driverCache = new Map<IsolateVM, IsolateDriver>()

export async function createIsolateDriver(
  vm: IsolateVM = 'node',
): Promise<IsolateDriver> {
  const cached = driverCache.get(vm)
  if (cached) return cached

  let driver: IsolateDriver

  switch (vm) {
    case 'quickjs': {
      const { createQuickJSIsolateDriver } =
        await import('@tanstack/ai-isolate-quickjs')
      driver = createQuickJSIsolateDriver()
      break
    }
    case 'node':
    default: {
      try {
        const { createNodeIsolateDriver } =
          await import('@tanstack/ai-isolate-node')
        driver = createNodeIsolateDriver()
      } catch {
        const { createQuickJSIsolateDriver } =
          await import('@tanstack/ai-isolate-quickjs')
        driver = createQuickJSIsolateDriver()
      }
      break
    }
  }

  driverCache.set(vm, driver)
  return driver
}
```

Cache the driver — creating it is expensive (VM startup).

## Step 2: Define Server Tools

Tools are defined with `toolDefinition()` from `@tanstack/ai`. Each tool has a name, description, Zod input/output schemas, and a `.server()` handler. Inside the code mode sandbox, tools are available as `external_<toolName>(...)`.

```typescript
// src/lib/tools/database-tools.ts
import { z } from 'zod'
import { toolDefinition } from '@tanstack/ai'

export const queryTableTool = toolDefinition({
  name: 'queryTable',
  description: 'Query a database table with filtering, column selection, ordering, and limits.',
  inputSchema: z.object({
    table: z.enum(['customers', 'products', 'purchases']),
    columns: z.array(z.string()).optional(),
    where: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    orderBy: z.string().optional(),
    orderDirection: z.enum(['asc', 'desc']).optional(),
    limit: z.number().optional(),
  }),
  outputSchema: z.object({
    rows: z.array(z.record(z.string(), z.any())),
    totalMatchingRows: z.number(),
  }),
}).server(async ({ table, columns, where, orderBy, orderDirection, limit }) => {
  // Your database query logic here
  // Inside the sandbox, the LLM calls: external_queryTable({ table: 'customers', ... })
})

export const databaseTools = [queryTableTool]
```

## Step 3: Create the Code Mode Tool

Call `createCodeMode()` with the driver, tools, and optional configuration. It returns a `tool` (the `execute_typescript` tool definition) and a `systemPrompt` that teaches the LLM how to use the sandbox.

```typescript
import { createCodeMode } from '@tanstack/ai-code-mode'
import { createIsolateDriver } from '#/lib/create-isolate-driver'
import { databaseTools } from '#/lib/tools/database-tools'

let codeModeCache: {
  tool: ReturnType<typeof createCodeMode>['tool']
  systemPrompt: string
} | null = null

async function getCodeModeTools() {
  if (!codeModeCache) {
    const driver = await createIsolateDriver('node')
    const { tool, systemPrompt } = createCodeMode({
      driver,
      tools: databaseTools,
      timeout: 60000,      // max execution time in ms
      memoryLimit: 128,    // max memory in MB
    })
    codeModeCache = { tool, systemPrompt }
  }
  return codeModeCache
}
```

Cache this too — `createCodeMode` only needs to run once.

### Optional: Skill Bindings

If you have additional functions you want available inside the sandbox (beyond your tools), pass them via `getSkillBindings`:

```typescript
const { tool, systemPrompt } = createCodeMode({
  driver,
  tools: databaseTools,
  timeout: 60000,
  memoryLimit: 128,
  getSkillBindings: async () => myAdditionalBindings(),
})
```

Skill bindings follow the `ToolBinding` interface from `@tanstack/ai-code-mode` and become available as `external_<name>()` functions inside the sandbox alongside the tool-based ones.

## Step 4: Wire Up the API Route

Create a TanStack Start server route that accepts chat messages and streams responses via SSE:

```typescript
// src/routes/_reporting/api.reports.ts
import { createFileRoute } from '@tanstack/react-router'
import { chat, maxIterations, toServerSentEventsStream } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'

export const Route = createFileRoute('/_reporting/api/reports')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const { messages } = body
        const abortController = new AbortController()

        const { tool, systemPrompt } = await getCodeModeTools()

        const stream = chat({
          adapter: anthropicText('claude-haiku-4-5'),
          messages,
          tools: [tool],                       // code mode tool
          systemPrompts: [
            'Your domain-specific system prompt here.',
            systemPrompt,                      // code mode instructions
          ],
          agentLoopStrategy: maxIterations(20), // max tool-call loops
          abortController,
          maxTokens: 8192,
        })

        const sseStream = toServerSentEventsStream(stream, abortController)

        return new Response(sseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      },
    },
  },
})
```

Key points:
- Pass `tool` (from `createCodeMode`) in the `tools` array — this is the `execute_typescript` tool the LLM will call.
- Include `systemPrompt` (from `createCodeMode`) in `systemPrompts` — it tells the LLM how to write sandbox code.
- You can mix code mode tools with regular tools in the same `tools` array.
- Use `maxIterations()` as the `agentLoopStrategy` to cap tool-call rounds.

## Step 5: Client-Side Chat

Use `useChat` from `@tanstack/ai-react` with `fetchServerSentEvents`:

```typescript
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'

const { messages, sendMessage, isLoading, stop } = useChat({
  connection: fetchServerSentEvents('/api/reports'),
  onCustomEvent: (eventType, data, context) => {
    // Handle sandbox custom events (e.g., VM execution events)
  },
})
```

Render tool calls for `execute_typescript` with the `CodeBlock`, `JavaScriptVM`, and `ExecutionResult` components from `src/components/db-demo/`.

## How It Works at Runtime

1. User sends a message via `useChat`.
2. Server calls `chat()` with the code mode tool.
3. LLM responds with an `execute_typescript` tool call containing TypeScript code.
4. The code runs in the sandboxed V8 isolate (or QuickJS fallback).
5. Inside the sandbox, the code calls `external_queryTable(...)` etc. — these bridge to your server-side tool handlers.
6. Results stream back to the client as SSE events.
7. The LLM sees the execution result and can respond with text or make further tool calls.

## File Structure Reference

```
src/
├── lib/
│   ├── create-isolate-driver.ts   # VM driver factory with caching
│   └── tools/
│       └── database-tools.ts      # Tool definitions (toolDefinition + .server())
├── routes/
│   └── _reporting/
│       └── api.reports.ts         # POST endpoint: chat() + code mode
└── components/
    └── db-demo/
        ├── CodeBlock.tsx          # Renders execute_typescript code
        ├── JavaScriptVM.tsx       # Real-time VM event stream
        ├── ExecutionResult.tsx    # Execution outcome display
        └── ChatInput.tsx          # Chat input with auto-resize
```

## Netlify Deployment

This project deploys on Netlify with:
- `netlify.toml` — build command, publish dir, Node version
- `@netlify/vite-plugin-tanstack-start` — SSR adapter for Netlify
- `@netlify/database` — managed Postgres accessed via `getDatabase()`
- Drizzle ORM with `drizzle-orm/netlify-db` adapter for typed schema access
- Migrations in `netlify/database/migrations/`
