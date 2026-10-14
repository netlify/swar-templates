import {
  chat,
  chatParamsFromRequestBody,
  EventType,
  maxIterations,
  toServerSentEventsResponse,
  type StreamChunk,
} from '@tanstack/ai'
import { ANTHROPIC_MODELS, createAnthropicChat } from '@tanstack/ai-anthropic'
import { OPENAI_CHAT_MODELS, createOpenaiChat } from '@tanstack/ai-openai'
import { GEMINI_MODELS, createGeminiChat } from '@tanstack/ai-gemini'
import { createOllamaChat } from '@tanstack/ai-ollama'
import { z } from 'zod'
import { getWeather } from './weather-tools'

const providerSchema = z.enum(['anthropic', 'openai', 'gemini', 'ollama'])
const text = z.string().max(16000)
const selectionSchema = z.object({
  provider: providerSchema.optional(),
  model: z.string().trim().min(1).max(200).optional(),
})
const messageBase = {
  id: z.string().min(1).max(200),
  metadata: z.record(z.string(), z.unknown()).optional(),
}
const messageSchema = z.discriminatedUnion('role', [
  z.object({ ...messageBase, role: z.literal('user'), content: text.min(1) }),
  z.object({
    ...messageBase,
    role: z.literal('assistant'),
    content: text.optional(),
    toolCalls: z
      .array(
        z.object({
          id: z.string().max(200),
          type: z.literal('function'),
          encryptedValue: text.optional(),
          function: z.object({
            name: z.literal('getWeather'),
            arguments: text,
          }),
        }),
      )
      .max(20)
      .optional(),
  }),
  z.object({
    ...messageBase,
    role: z.literal('tool'),
    content: text,
    toolCallId: z.string().max(200),
  }),
  z.object({
    ...messageBase,
    role: z.literal('reasoning'),
    content: text,
    encryptedValue: text.optional(),
  }),
])

const requestSchema = z.object({
  threadId: z.string().min(1).max(200),
  runId: z.string().min(1).max(200),
  messages: z.array(messageSchema).min(1).max(100),
  tools: z.array(z.never()).max(0),
  context: z.array(z.never()).max(0),
  forwardedProps: selectionSchema.optional(),
  data: selectionSchema.optional(),
})

class ChatConfigurationError extends Error {}

function createAdapter(
  data: z.infer<typeof requestSchema>['data'],
  env: NodeJS.ProcessEnv,
) {
  const configuredProvider =
    data?.provider ?? (env.AI_PROVIDER?.trim() || undefined)
  const provider =
    configuredProvider ??
    (env.ANTHROPIC_API_KEY
      ? 'anthropic'
      : env.OPENAI_API_KEY
        ? 'openai'
        : env.GEMINI_API_KEY || env.GOOGLE_API_KEY
          ? 'gemini'
          : undefined)
  if (!providerSchema.safeParse(provider).success) {
    throw new ChatConfigurationError(
      'Chat is not configured. Use Netlify AI Gateway in a linked Netlify environment, or configure a provider on the server.',
    )
  }
  const model = data?.model ?? env.AI_MODEL
  switch (provider) {
    case 'anthropic': {
      if (!env.ANTHROPIC_API_KEY)
        throw new ChatConfigurationError(
          'The selected Anthropic provider is not configured on the server.',
        )
      const selectedModel = z
        .enum(ANTHROPIC_MODELS)
        .parse(model ?? 'claude-haiku-4-5')
      return createAnthropicChat(selectedModel, env.ANTHROPIC_API_KEY, {
        baseURL: env.ANTHROPIC_BASE_URL,
      })
    }
    case 'openai': {
      if (!env.OPENAI_API_KEY)
        throw new ChatConfigurationError(
          'The selected OpenAI provider is not configured on the server.',
        )
      const selectedModel = z
        .enum(OPENAI_CHAT_MODELS)
        .parse(model ?? 'gpt-4.1-mini')
      return createOpenaiChat(selectedModel, env.OPENAI_API_KEY, {
        baseURL: env.OPENAI_BASE_URL,
      })
    }
    case 'gemini': {
      const key = env.GOOGLE_API_KEY || env.GEMINI_API_KEY
      if (!key)
        throw new ChatConfigurationError(
          'The selected Gemini provider is not configured on the server.',
        )
      const selectedModel = z
        .enum(GEMINI_MODELS)
        .parse(model ?? 'gemini-2.5-flash')
      return createGeminiChat(selectedModel, key, {
        baseURL: env.GOOGLE_GEMINI_BASE_URL,
      })
    }
    case 'ollama': {
      if (!env.OLLAMA_HOST)
        throw new ChatConfigurationError(
          'Ollama requires OLLAMA_HOST on the server. It is not available through AI Gateway.',
        )
      return createOllamaChat(model ?? 'mistral:7b', { host: env.OLLAMA_HOST })
    }
    default:
      throw new ChatConfigurationError(
        'The selected chat provider is not supported.',
      )
  }
}

const systemPrompt =
  'You are a weather demo assistant. Use getWeather when asked about a city. Its temperature in Celsius, condition, and humidity are randomly simulated, not live observations or forecasts. Clearly describe results as simulated. Do not give safety or travel advice based on this sample data. Keep responses concise.'
const providerFailure =
  'The chat provider could not complete the request. Please try again.'

async function* safeStream(
  stream: AsyncIterable<StreamChunk>,
  request: Request,
  controller: AbortController,
  onAbort: () => void,
): AsyncGenerator<StreamChunk> {
  try {
    for await (const chunk of stream) {
      if (controller.signal.aborted) return
      if (chunk.type === 'RUN_ERROR') {
        yield {
          type: EventType.RUN_ERROR,
          timestamp: Date.now(),
          message: providerFailure,
        }
        return
      }
      yield chunk
    }
  } catch {
    if (!controller.signal.aborted) {
      yield {
        type: EventType.RUN_ERROR,
        timestamp: Date.now(),
        message: providerFailure,
      }
    }
  } finally {
    request.signal.removeEventListener('abort', onAbort)
  }
}

const maxBodyChars = 128000
const maxUtf8BytesPerChar = 3

async function readBodyWithinBytes(request: Request, maxBytes: number) {
  if (!request.body) return ''
  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) return text + decoder.decode()
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      return undefined
    }
    text += decoder.decode(value, { stream: true })
  }
}

export async function handleChatRequest(
  request: Request,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (request.signal.aborted) return new Response(null, { status: 499 })
  let body: z.infer<typeof requestSchema>
  try {
    const raw = await readBodyWithinBytes(
      request,
      maxBodyChars * maxUtf8BytesPerChar,
    )
    if (raw === undefined || raw.length > maxBodyChars)
      return Response.json(
        { error: 'The conversation is too large. Start a new chat.' },
        { status: 413 },
      )
    body = requestSchema.parse(JSON.parse(raw))
  } catch {
    return Response.json(
      { error: 'Send a valid chat request with user or assistant messages.' },
      { status: 400 },
    )
  }

  const controller = new AbortController()
  const onAbort = () => controller.abort(request.signal.reason)
  request.signal.addEventListener('abort', onAbort, { once: true })
  if (request.signal.aborted) onAbort()
  try {
    const adapter = createAdapter(body.forwardedProps ?? body.data, env)
    const { messages, threadId, runId } = await chatParamsFromRequestBody(body)
    const stream = chat({
      adapter,
      messages,
      threadId,
      runId,
      tools: [getWeather],
      systemPrompts: [systemPrompt],
      agentLoopStrategy: maxIterations(5),
      abortController: controller,
    })
    return toServerSentEventsResponse(
      safeStream(stream, request, controller, onAbort),
      {
        abortController: controller,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    request.signal.removeEventListener('abort', onAbort)
    if (controller.signal.aborted) return new Response(null, { status: 499 })
    if (error instanceof ChatConfigurationError)
      return Response.json({ error: error.message }, { status: 503 })
    if (error instanceof z.ZodError)
      return Response.json(
        {
          error:
            'The selected model is not supported by this provider adapter.',
        },
        { status: 400 },
      )
    return Response.json({ error: providerFailure }, { status: 502 })
  }
}
