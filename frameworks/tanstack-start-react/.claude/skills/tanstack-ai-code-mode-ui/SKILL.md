---
name: tanstack-ai-code-mode-ui
description: Architect a code mode setup where UI generation is driven by the LLM through injected UI bindings. Use only when the customer specifically requests "code mode" in relation to how the AI operates AND wants the model to build interfaces (dashboards, forms, visualizations, canvases, etc.) by calling UI functions from inside the sandbox, rather than returning structured UI payloads as tool results.
---

# Generating UI from Code Mode

This skill covers a pattern for letting an LLM build interactive UI by writing code inside a code mode sandbox, where UI operations are exposed as `external_*` binding functions. The LLM writes one TypeScript program that mixes data fetching, computation, and UI construction — each UI call emits a custom event that the client turns into a node in a rendered component tree.

Use this pattern when you want the model to drive the UI, not just return data. Examples: analytic dashboards, report canvases, form wizards, document generators, diagram builders, configurators, admin tools.

> Prerequisite: this skill assumes code mode is already set up. See `tanstack-ai-code-mode` for the base setup (drivers, `createCodeMode`, API route, client wiring).

## Why Inject UI Through Code Mode

Alternatives and why they are usually worse:

- **A tool that returns a structured UI payload** — forces the LLM to construct a large JSON tree in one shot, inflating tokens and making iterative composition hard.
- **Many small UI tools called individually by the LLM** — one round-trip per component, many LLM turns, slow and expensive.
- **UI bindings inside code mode** — the LLM writes ordinary loops/conditionals that build the tree; data fetching and UI construction interleave in a single program; only one LLM turn is needed to produce a full interface.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│ LLM                                                              │
│   emits: execute_typescript({ typescriptCode: "..." })           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│ Sandbox (Node isolate or QuickJS)                                │
│   user program can call:                                         │
│     external_<dataTool>(...)      ← from code mode `tools`       │
│     external_<uiBinding>(...)     ← from `getSkillBindings`      │
│                                                                  │
│   each external_<uiBinding> call:                                │
│     1. validates input                                           │
│     2. calls emitCustomEvent('ui:<something>', payload)          │
│     3. optionally updates server-side state                      │
└────────────────────────┬─────────────────────────────────────────┘
                         │ SSE custom events
┌────────────────────────▼─────────────────────────────────────────┐
│ Client (useChat → onCustomEvent)                                 │
│   receives ui:<something> events                                 │
│   dispatches into a local tree store                             │
│   renders the tree through a NodeRenderer                        │
└──────────────────────────────────────────────────────────────────┘
```

Three pieces you design:

1. A set of **UI bindings** — one function per component type you want the LLM to produce.
2. A **custom event protocol** — the shape of payloads emitted by the bindings.
3. A **client renderer** — receives events, maintains a tree, and renders each node with a React component.

## 1. Designing UI Bindings

Bindings are the functions the LLM will call from inside the sandbox. Each one should:

- Validate its input with a Zod schema (the sandbox calls it with whatever the model wrote).
- Produce a small, declarative event describing what to do to the UI tree.
- Emit that event via the context's `emitCustomEvent`.
- Optionally mirror the change into server-side state (useful if the server later needs to render, replay, or inspect the tree).

A binding implements the `ToolBinding` interface from `@tanstack/ai-code-mode`:

```typescript
import { z } from 'zod'
import { convertSchemaToJsonSchema } from '@tanstack/ai'
import type { ToolBinding } from '@tanstack/ai-code-mode'

const cardBindingSchema = z.object({
  id: z.string().describe('Unique ID for this component'),
  parentId: z.string().optional().describe('Parent container ID'),
  title: z.string().optional(),
})

const cardBinding: ToolBinding = {
  name: 'external_ui_card',
  description: 'Create a card container with optional title',
  inputSchema: convertSchemaToJsonSchema(cardBindingSchema) || {
    type: 'object',
    properties: {},
  },
  outputSchema: convertSchemaToJsonSchema(z.object({ success: z.boolean() })),
  execute: async (args, context) => {
    const input = cardBindingSchema.parse(args)

    context?.emitCustomEvent?.('ui:node', {
      op: 'add',
      id: input.id,
      type: 'card',
      parentId: input.parentId,
      props: { title: input.title },
    })

    return { success: true }
  },
}
```

A helper like `createUIBinding(name, description, schema, toEvent)` is worth writing once you have more than a handful of bindings — most of them follow the same pattern.

### Inject Bindings via `getSkillBindings`

Pass your bindings into `createCodeMode` so they become available as `external_*` inside the sandbox:

```typescript
import { createCodeMode } from '@tanstack/ai-code-mode'

const { tool, systemPrompt } = createCodeMode({
  driver,
  tools: dataTools,              // regular server tools (DB, APIs, etc.)
  timeout: 60000,
  memoryLimit: 128,
  getSkillBindings: async () => ({
    external_ui_card: cardBinding,
    external_ui_text: textBinding,
    external_ui_chart: chartBinding,
    // ...
  }),
})
```

`getSkillBindings` is called per-request, so you can return different bindings for different users, sessions, or feature flags.

## 2. Designing the Event Protocol

A tree-shaped UI needs four operations. Define them once and every binding emits one of these shapes:

```typescript
type UIEvent =
  | { op: 'add'; id: string; type: string; parentId?: string; props: Record<string, unknown> }
  | { op: 'update'; id: string; props: Record<string, unknown> }
  | { op: 'remove'; id: string }
  | { op: 'reorder'; parentId?: string; childIds: string[] }
```

Corresponding bindings:

- `external_ui_<type>(...)` — emits `add` events, one per component type.
- `external_ui_update({ id, props })` — emits `update`, for mutating existing nodes.
- `external_ui_remove({ id })` — emits `remove`.
- `external_ui_reorder({ parentId, childIds })` — emits `reorder`.

Keep the event shapes flat and serializable — they travel over SSE.

### Component Categories to Consider

A useful binding set typically includes components across these categories. Adjust to your domain.

| Category | Purpose | Examples |
|----------|---------|----------|
| **Layout** | Group/position children | vbox, hbox, grid, card, section, tabs |
| **Content** | Leaf text/visual | text (h1/h2/body/caption), markdown, badge, divider, spacer, image |
| **Data** | Display datasets | chart (line/bar/area/pie), dataTable, sparkline, metric, progress |
| **Input** | Interactive controls | button, input, select, slider, toggle |
| **Status** | Feedback states | placeholder/skeleton, error, empty, toast |

For each binding, give the model enough enum variants (`variant: 'default' | 'outlined' | 'elevated'`, `gap: 'sm' | 'md' | 'lg'`, etc.) to cover realistic layouts, but keep the surface small enough that it fits in a system prompt.

Tip: use `.catch('md')` on enum schemas so an invalid value from the model gracefully falls back to a sensible default rather than failing the whole program.

### IDs, Parents, and Auto-Generation

Two conventions that work well:

- **Container components require an explicit `id`** (the model will reference it as `parentId` of children).
- **Leaf components make `id` optional** and auto-generate one when omitted. This lets the model write terse code when it doesn't need to update that node later.

```typescript
function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
```

## 3. The Client Renderer

### Receiving Events

The `useChat` hook exposes an `onCustomEvent` callback:

```typescript
const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  onCustomEvent: (eventType, data) => {
    if (eventType === 'ui:node') {
      dispatchUIEvent(data as UIEvent)
    }
  },
})
```

### Tree State

Maintain a map of nodes plus an ordered list of root IDs:

```typescript
interface UINode {
  id: string
  type: string
  props: Record<string, unknown>
  children: string[]
}

interface UITree {
  nodes: Map<string, UINode>
  rootIds: string[]
}
```

A reducer applies `UIEvent`s:

- `add` — insert into `nodes`, append `id` to parent's `children` (or `rootIds` if no `parentId`).
- `update` — merge `props` into existing node.
- `remove` — delete node and its descendants, remove from parent.
- `reorder` — replace `children` (or `rootIds`) with the new `childIds` list.

### Node Renderer

Map each `type` string to a React component. Recurse through `children`:

```typescript
const componentMap: Record<string, React.ComponentType<any>> = {
  vbox: VBox,
  hbox: HBox,
  card: Card,
  text: Text,
  chart: Chart,
  dataTable: DataTable,
  // ...
}

function NodeRenderer({ node, nodes }: { node: UINode; nodes: Map<string, UINode> }) {
  const Component = componentMap[node.type]
  if (!Component) return null

  const children = node.children.map((childId) => {
    const child = nodes.get(childId)
    return child ? <NodeRenderer key={childId} node={child} nodes={nodes} /> : null
  })

  return <Component {...node.props} id={node.id}>{children}</Component>
}
```

Wrap each node in `motion.div` with `AnimatePresence` to get smooth add/remove animations as the model builds the UI incrementally.

## 4. Teach the Model the API

Put a system prompt alongside the code mode `systemPrompt` that lists every binding, its parameters, and one or two worked examples. The model can't discover the API at runtime — the prompt is the documentation.

A good shape for this prompt:

1. One sentence describing what the UI system does.
2. Listing of functions grouped by category, each with parameters and a short description.
3. One full example that fetches data, aggregates it, and builds a small UI.
4. A short list of best practices (create containers before children, keep trees focused, use meaningful IDs, interleave data fetching and UI calls).

Pass it as a third entry in `systemPrompts`:

```typescript
const stream = chat({
  adapter,
  messages,
  tools: [codeModeTool, ...managementTools],
  systemPrompts: [
    DOMAIN_SYSTEM_PROMPT,   // "You are an analyst for X"
    codeModeSystemPrompt,   // from createCodeMode — teaches the sandbox
    UI_SYSTEM_PROMPT,       // your binding API reference
  ],
  agentLoopStrategy: maxIterations(20),
  abortController,
})
```

## 5. End-to-End: A Single Component

Here is one component — `metric` (a big number with a label) — implemented all the way from binding to render. Every other component in the system follows the same shape.

### 5.1 Binding (server)

```typescript
// src/lib/ui/bindings.ts
import { z } from 'zod'
import { convertSchemaToJsonSchema } from '@tanstack/ai'
import type { ToolBinding } from '@tanstack/ai-code-mode'

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const metricSchema = z.object({
  id: z
    .string()
    .optional()
    .describe('Component ID (auto-generated if omitted)'),
  parentId: z
    .string()
    .optional()
    .describe('Parent container ID (root if omitted)'),
  value: z.union([z.number(), z.string()]).describe('The metric value'),
  label: z.string().describe('Label describing the metric'),
  format: z
    .enum(['number', 'currency', 'percent', 'compact'])
    .catch('number')
    .describe('Number format'),
  prefix: z.string().optional().describe('Prefix (e.g., "$")'),
  suffix: z.string().optional().describe('Suffix (e.g., "/week")'),
  variant: z
    .enum(['default', 'success', 'warning', 'error'])
    .catch('default')
    .describe('Color variant'),
})

export const metricBinding: ToolBinding = {
  name: 'external_ui_metric',
  description: 'Display a big number with a label',
  inputSchema: convertSchemaToJsonSchema(metricSchema) || {
    type: 'object',
    properties: {},
  },
  outputSchema: convertSchemaToJsonSchema(z.object({ success: z.boolean() })),
  execute: async (args, context) => {
    const input = metricSchema.parse(args)
    const id = input.id || generateId('metric')

    context?.emitCustomEvent?.('ui:node', {
      op: 'add',
      id,
      type: 'metric',
      parentId: input.parentId,
      props: {
        value: input.value,
        label: input.label,
        format: input.format,
        prefix: input.prefix,
        suffix: input.suffix,
        variant: input.variant,
      },
    })

    return { success: true, id }
  },
}
```

### 5.2 Inject the Binding (server)

```typescript
// src/routes/api.chat.ts (excerpt)
import { createCodeMode } from '@tanstack/ai-code-mode'
import { metricBinding } from '#/lib/ui/bindings'

const { tool, systemPrompt } = createCodeMode({
  driver,
  tools: dataTools,
  timeout: 60000,
  memoryLimit: 128,
  getSkillBindings: async () => ({
    external_ui_metric: metricBinding,
    // ...other bindings
  }),
})
```

### 5.3 System Prompt Entry

This is what you include in the `UI_SYSTEM_PROMPT` so the model knows the function exists:

```
external_ui_metric({ id?, parentId?, value, label, format?, prefix?, suffix?, variant? })
  Display a big number with a label.
  - value: number | string — the number to display
  - label: string — description shown below the number
  - format: 'number' | 'currency' | 'percent' | 'compact' (default: 'number')
  - prefix: string — e.g. '$'
  - suffix: string — e.g. '/week'
  - variant: 'default' | 'success' | 'warning' | 'error' (default: 'default')
```

### 5.4 Client Event Handler

```typescript
// src/routes/chat.tsx (excerpt)
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { useUITree } from '#/lib/ui/use-ui-tree'

function ChatPage() {
  const { tree, dispatchUIEvent } = useUITree()

  const { messages, sendMessage } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    onCustomEvent: (eventType, data) => {
      if (eventType === 'ui:node') {
        dispatchUIEvent(data as UIEvent)
      }
    },
  })

  return (
    <div className="flex">
      <ChatPanel messages={messages} onSend={sendMessage} />
      <UIRenderer nodes={tree.nodes} rootIds={tree.rootIds} />
    </div>
  )
}
```

### 5.5 Tree Reducer (client)

```typescript
// src/lib/ui/use-ui-tree.ts
import { useCallback, useState } from 'react'

export interface UINode {
  id: string
  type: string
  props: Record<string, unknown>
  children: string[]
}

interface UITree {
  nodes: Map<string, UINode>
  rootIds: string[]
}

export function useUITree() {
  const [tree, setTree] = useState<UITree>({
    nodes: new Map(),
    rootIds: [],
  })

  const dispatchUIEvent = useCallback((event: UIEvent) => {
    setTree((prev) => {
      const nodes = new Map(prev.nodes)
      let rootIds = prev.rootIds

      if (event.op === 'add') {
        nodes.set(event.id, {
          id: event.id,
          type: event.type,
          props: event.props,
          children: [],
        })
        if (event.parentId) {
          const parent = nodes.get(event.parentId)
          if (parent) {
            nodes.set(event.parentId, {
              ...parent,
              children: [...parent.children, event.id],
            })
          }
        } else {
          rootIds = [...rootIds, event.id]
        }
      } else if (event.op === 'update') {
        const node = nodes.get(event.id)
        if (node) {
          nodes.set(event.id, {
            ...node,
            props: { ...node.props, ...event.props },
          })
        }
      } else if (event.op === 'remove') {
        nodes.delete(event.id)
        rootIds = rootIds.filter((id) => id !== event.id)
        for (const [id, n] of nodes) {
          if (n.children.includes(event.id)) {
            nodes.set(id, {
              ...n,
              children: n.children.filter((c) => c !== event.id),
            })
          }
        }
      } else if (event.op === 'reorder') {
        if (event.parentId) {
          const parent = nodes.get(event.parentId)
          if (parent) {
            nodes.set(event.parentId, { ...parent, children: event.childIds })
          }
        } else {
          rootIds = event.childIds
        }
      }

      return { nodes, rootIds }
    })
  }, [])

  return { tree, dispatchUIEvent }
}
```

### 5.6 React Primitive

```typescript
// src/components/ui/Metric.tsx
interface MetricProps {
  id?: string
  value: number | string
  label: string
  format?: 'number' | 'currency' | 'percent' | 'compact'
  prefix?: string
  suffix?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

const variantClasses = {
  default: 'text-gray-900',
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
}

function formatValue(
  value: number | string,
  format: MetricProps['format'],
): string {
  if (typeof value === 'string') return value
  switch (format) {
    case 'currency':
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
    case 'percent':
      return `${(value * 100).toFixed(1)}%`
    case 'compact':
      return Intl.NumberFormat('en', { notation: 'compact' }).format(value)
    default:
      return value.toLocaleString('en-US')
  }
}

export function Metric({
  value,
  label,
  format = 'number',
  prefix,
  suffix,
  variant = 'default',
}: MetricProps) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <div className={`text-3xl font-semibold ${variantClasses[variant]}`}>
        {prefix}
        {formatValue(value, format)}
        {suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
```

### 5.7 Wire Into the NodeRenderer

```typescript
// src/components/ui/NodeRenderer.tsx
import { Metric } from './Metric'
import type { UINode } from '#/lib/ui/use-ui-tree'

const componentMap: Record<string, React.ComponentType<any>> = {
  metric: Metric,
  // vbox, hbox, card, chart, ...
}

export function NodeRenderer({
  node,
  nodes,
}: {
  node: UINode
  nodes: Map<string, UINode>
}) {
  const Component = componentMap[node.type]
  if (!Component) return null

  const children = node.children.map((childId) => {
    const child = nodes.get(childId)
    return child ? <NodeRenderer key={childId} node={child} nodes={nodes} /> : null
  })

  return (
    <Component {...node.props} id={node.id}>
      {children.length > 0 ? children : undefined}
    </Component>
  )
}

export function UIRenderer({
  nodes,
  rootIds,
}: {
  nodes: Map<string, UINode>
  rootIds: string[]
}) {
  return (
    <div className="flex flex-col gap-4 p-6">
      {rootIds.map((id) => {
        const node = nodes.get(id)
        return node ? <NodeRenderer key={id} node={node} nodes={nodes} /> : null
      })}
    </div>
  )
}
```

### 5.8 What the Model Writes

With the binding injected and the system prompt in place, the model produces code like this inside `execute_typescript`:

```typescript
const { rows } = await external_queryTable({ table: 'purchases' })

external_ui_metric({
  value: rows.reduce((s, r) => s + r.total, 0),
  label: 'Total Revenue',
  format: 'currency',
  prefix: '$',
})

return { rowCount: rows.length }
```

When that runs:

1. `external_queryTable` hits the server tool, returns data into the sandbox.
2. `external_ui_metric` is called — the binding validates the input, generates an id, and emits a `ui:node` event with `op: 'add'`.
3. The event travels over SSE to the client.
4. `useChat`'s `onCustomEvent` forwards it to `dispatchUIEvent`.
5. The reducer inserts a new `UINode` with `type: 'metric'`.
6. `UIRenderer` re-renders, `NodeRenderer` looks up `'metric'` in `componentMap`, and the `Metric` component appears on screen.

To add another component type (say `text`), repeat the same seven steps: schema → binding → prompt entry → React primitive → `componentMap` entry. The event protocol and the tree reducer stay the same.

## 6. Generic Multi-Component Example

The pattern scales naturally. The model writes a program like this inside `execute_typescript`:

```typescript
// Fetch data using normal data tools
const { rows } = await external_queryTable({ table: 'purchases' })

// Summary strip at the top
external_ui_hbox({ id: 'summary', gap: 'lg' })
external_ui_metric({
  parentId: 'summary',
  value: rows.length,
  label: 'Total Purchases',
})
external_ui_metric({
  parentId: 'summary',
  value: rows.reduce((s, r) => s + r.total, 0),
  label: 'Revenue',
  format: 'currency',
  prefix: '$',
})

// Chart below it
const byDay: Record<string, number> = {}
for (const r of rows) {
  byDay[r.purchased_at] = (byDay[r.purchased_at] || 0) + r.total
}
external_ui_chart({
  id: 'trend',
  type: 'line',
  data: Object.entries(byDay).map(([date, total]) => ({ date, total })),
  xKey: 'date',
  yKey: 'total',
})

return { rowsAnalyzed: rows.length }
```

Notice: one LLM turn, mixed data fetching and UI building, no hand-built JSON tree. The code is straightforward because the bindings are.

## Optional: Server-Side Mirror of the Tree

Some systems want the server to know the current tree as well — for persistence, replay, multi-client sync, or handling dependent tools. A common pattern:

- Each binding calls `emitCustomEvent(...)` AND a server-side `applyEvent(treeId, event)` function that updates an in-memory store keyed by some `treeId`.
- The `treeId` is a parameter on every binding (e.g. `reportId`, `canvasId`, `documentId`).
- A management tool like `new_<treeId>({ id, title })` creates a tree up front and auto-selects it on the client via its own custom event (`ui:created`).

This is only necessary if something outside the sandbox needs to read the tree. If the tree only lives in one browser session, skip it and keep the bindings pure event emitters.

## Advanced: Handlers and Reactive Bindings

Two optional features that extend the pattern:

- **Handlers** — let a binding accept TypeScript strings for event handlers (e.g. `onPress`). Validate them on the server against an allowlist of bindings they can call, then ship them to the client for execution when the event fires.
- **Subscriptions / signals** — let components subscribe to named signals (`subscriptions: ['balances']`) with a `dataSource` string that recomputes props when the signal changes. Requires a signal registry and an invalidation endpoint.

These add significant complexity (code validation, execution, invalidation plumbing). Only add them if your UI genuinely needs interactivity beyond what a rebuild-on-demand model provides.

## Best Practices

- **One binding per component type.** Don't build a single `external_ui_component({ type, ... })` god-binding — schemas per component give the model better constraints and better error messages.
- **Schemas are your contract with the model.** Use `z.enum([...]).catch(default)` generously, `.describe(...)` everything, and mark optional things optional.
- **Keep bindings pure emit + optional state update.** No side effects, no network calls inside a binding — that's what data tools are for.
- **Document everything in the system prompt.** The model only knows what you tell it.
- **Design events to be idempotent where possible** — makes reconnection, replay, and multi-client sync easier later.
- **Prefer declarative operations** (`add`, `update`, `remove`, `reorder`) over imperative ones (`moveLeft`, `bringToFront`) — simpler protocol, easier client state.
- **Start small.** A dozen well-chosen bindings covering layout + a few content + one or two data components is usually enough to produce surprisingly rich UIs.
