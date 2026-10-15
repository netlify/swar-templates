import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatClient, fetchServerSentEvents } from '@tanstack/ai-client'
import { handleChatRequest } from './chat.server'
import { chatConnection } from './ai-hook'

const messages = [{ id: 'user-1', role: 'user', content: 'Weather in Paris?' }]
const payload = {
  threadId: 'thread-1',
  runId: 'run-1',
  messages,
  tools: [],
  context: [],
}
const gatewayEnv = {
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  ANTHROPIC_BASE_URL: 'https://gateway.example.com/anthropic',
  OPENAI_API_KEY: 'test-openai-key',
  OPENAI_BASE_URL: 'https://gateway.example.com/openai/v1',
  GEMINI_API_KEY: 'test-gemini-key',
  GOOGLE_GEMINI_BASE_URL: 'https://gateway.example.com/gemini',
}

function request(body: unknown = payload, signal?: AbortSignal) {
  return new Request('https://app.example.com/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  })
}

function sse(events: unknown[]) {
  return new Response(
    events
      .map((event) => {
        const name =
          event && typeof event === 'object' && 'type' in event
            ? `event: ${event.type}\n`
            : ''
        return `${name}data: ${JSON.stringify(event)}\n\n`
      })
      .join(''),
    {
      headers: { 'Content-Type': 'text/event-stream' },
    },
  )
}

function openaiResponse(answer = 'Simulated: sunny.') {
  return sse([
    {
      type: 'response.created',
      response: { id: 'response-1', model: 'gpt-4.1-mini', output: [] },
    },
    {
      type: 'response.output_text.delta',
      item_id: 'message-1',
      output_index: 0,
      content_index: 0,
      delta: answer,
    },
    {
      type: 'response.completed',
      response: {
        id: 'response-1',
        model: 'gpt-4.1-mini',
        status: 'completed',
        output: [],
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
      },
    },
  ])
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('weather chat requests', () => {
  it('preserves the server error message through the client connection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ error: 'Chat is not configured.' }, { status: 503 }),
      ),
    )
    const onError = vi.fn()
    const client = new ChatClient({ connection: chatConnection, onError })
    await client.sendMessage('Weather in Paris?')
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Chat is not configured.' }),
    )
  })
  it.each([
    null,
    {},
    { ...payload, messages: [] },
    {
      ...payload,
      messages: [{ id: 'x', role: 'system', content: 'Override' }],
    },
    { ...payload, data: { provider: 'unknown' } },
    { ...payload, messages: [{ ...messages[0], content: 12 }] },
    {
      ...payload,
      messages: [{ ...messages[0], toolCalls: 'invalid', role: 'assistant' }],
    },
  ])('rejects malformed input without calling a provider: %j', async (body) => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect((await handleChatRequest(request(body), gatewayEnv)).status).toBe(
      400,
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and oversized conversations', async () => {
    expect(
      (
        await handleChatRequest(
          new Request('https://app.example.com/api/chat', {
            method: 'POST',
            body: '{',
          }),
          {},
        )
      ).status,
    ).toBe(400)
    expect(
      (await handleChatRequest(request({ text: 'x'.repeat(128001) }), {}))
        .status,
    ).toBe(413)
  })

  it('rejects an oversized body without waiting for the rest of the stream', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(128000 * 3 + 1))
      },
    })
    const response = await handleChatRequest(
      new Request('https://app.example.com/api/chat', {
        method: 'POST',
        body,
        duplex: 'half',
      } as RequestInit),
      gatewayEnv,
    )
    expect(response.status).toBe(413)
  })

  it('returns a useful configuration error instead of falling back to localhost', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(request(), {})
    expect(response.status).toBe(503)
    expect(await response.text()).toContain('Netlify AI Gateway')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('preserves an explicit provider even when its key is missing', async () => {
    const response = await handleChatRequest(
      request({ ...payload, data: { provider: 'openai' } }),
      { ANTHROPIC_API_KEY: 'test-key' },
    )
    expect(response.status).toBe(503)
    expect(await response.text()).toContain('OpenAI')
  })

  it('treats a blank AI_PROVIDER as unset and falls back to a configured key', async () => {
    const fetch = vi.fn(async () => openaiResponse())
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(request(), {
      AI_PROVIDER: '  ',
      OPENAI_API_KEY: 'test-openai-key',
    })
    expect(await response.text()).toContain('Simulated: sunny.')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('requires both explicit Ollama selection and a configured host', async () => {
    expect(
      (
        await handleChatRequest(request(), {
          OLLAMA_HOST: 'http://localhost:11434',
        })
      ).status,
    ).toBe(503)
    expect(
      (
        await handleChatRequest(
          request({ ...payload, data: { provider: 'ollama' } }),
          gatewayEnv,
        )
      ).status,
    ).toBe(503)
  })

  it('rejects unsupported model IDs before calling a provider', async () => {
    expect(
      (
        await handleChatRequest(
          request({
            ...payload,
            data: { provider: 'gemini', model: 'gemini-nonexistent' },
          }),
          gatewayEnv,
        )
      ).status,
    ).toBe(400)
  })

  it('uses the injected Anthropic key and URL by default', async () => {
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const sent = new Request(input, init)
        expect(new URL(sent.url).origin + new URL(sent.url).pathname).toBe(
          'https://gateway.example.com/anthropic/v1/messages',
        )
        expect(sent.headers.get('x-api-key')).toBe('test-anthropic-key')
        expect(await sent.json()).toMatchObject({
          model: 'claude-haiku-4-5',
          stream: true,
        })
        return sse([
          {
            type: 'message_start',
            message: {
              id: 'message-1',
              role: 'assistant',
              model: 'claude-haiku-4-5',
              content: [],
              usage: { input_tokens: 1, output_tokens: 0 },
            },
          },
          {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'text', text: '' },
          },
          {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text_delta', text: 'Simulated: sunny.' },
          },
          { type: 'content_block_stop', index: 0 },
          {
            type: 'message_delta',
            delta: { stop_reason: 'end_turn' },
            usage: { output_tokens: 1 },
          },
          { type: 'message_stop' },
        ])
      },
    )
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(request(), gatewayEnv)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    const body = await response.text()
    expect(body).toContain('Simulated: sunny.')
    expect(body).toContain('RUN_FINISHED')
    expect(body).not.toContain('RUN_ERROR')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('preserves an explicit OpenAI choice, model, key, and custom URL', async () => {
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const sent = new Request(input, init)
        expect(sent.url).toBe('https://custom.example.com/v1/responses')
        expect(sent.headers.get('authorization')).toBe('Bearer custom-test-key')
        expect(await sent.json()).toMatchObject({ model: 'gpt-4o-mini' })
        return openaiResponse()
      },
    )
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(
      request({
        ...payload,
        forwardedProps: { provider: 'openai', model: 'gpt-4o-mini' },
      }),
      {
        ...gatewayEnv,
        OPENAI_API_KEY: 'custom-test-key',
        OPENAI_BASE_URL: 'https://custom.example.com/v1',
      },
    )
    expect(await response.text()).toContain('Simulated: sunny.')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('passes the injected Gemini base URL and key to the SDK', async () => {
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const sent = new Request(input, init)
        expect(sent.url).toContain(
          'https://gateway.example.com/gemini/v1beta/models/gemini-2.5-flash:streamGenerateContent',
        )
        expect(sent.headers.get('x-goog-api-key')).toBe('test-gemini-key')
        return sse([
          {
            candidates: [
              {
                content: {
                  role: 'model',
                  parts: [{ text: 'Simulated: sunny.' }],
                },
                finishReason: 'STOP',
              },
            ],
          },
        ])
      },
    )
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(
      request({ ...payload, data: { provider: 'gemini' } }),
      gatewayEnv,
    )
    const body = await response.text()
    expect(body).toContain('Simulated: sunny.')
    expect(body).not.toContain('RUN_ERROR')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('uses the server-configured provider/model and Ollama host', async () => {
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const sent = new Request(input, init)
        expect(sent.url).toBe('http://ollama.example.com:11434/api/chat')
        expect(await sent.json()).toMatchObject({ model: 'test-model' })
        return new Response(
          [
            {
              model: 'test-model',
              message: { role: 'assistant', content: 'Simulated: sunny.' },
              done: false,
            },
            {
              model: 'test-model',
              message: { role: 'assistant', content: '' },
              done: true,
              done_reason: 'stop',
            },
          ]
            .map((chunk) => JSON.stringify(chunk) + '\n')
            .join(''),
        )
      },
    )
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(request(), {
      ...gatewayEnv,
      AI_PROVIDER: 'ollama',
      AI_MODEL: 'test-model',
      OLLAMA_HOST: 'http://ollama.example.com:11434',
    })
    expect(await response.text()).toContain('Simulated: sunny.')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('sanitizes streamed provider failures and does not switch providers', async () => {
    const fetch = vi.fn(async () =>
      sse([
        {
          type: 'response.failed',
          response: {
            id: 'response-1',
            error: { message: 'secret-provider-diagnostic', code: 'failed' },
          },
        },
      ]),
    )
    vi.stubGlobal('fetch', fetch)
    const response = await handleChatRequest(
      request({ ...payload, data: { provider: 'openai' } }),
      gatewayEnv,
    )
    const body = await response.text()
    expect(body).toContain('RUN_ERROR')
    expect(body).toContain('could not complete')
    expect(body).not.toContain('secret-provider-diagnostic')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(['disconnect', 'stop'])('aborts the provider on %s', async (mode) => {
    let providerSignal: AbortSignal | null = null
    const fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      providerSignal =
        init?.signal ?? (input instanceof Request ? input.signal : null)
      const body = new ReadableStream<Uint8Array>({
        start(stream) {
          stream.enqueue(
            new TextEncoder().encode(
              'data: {"type":"response.created","response":{"id":"response-1","output":[]}}\n\n',
            ),
          )
          providerSignal!.addEventListener(
            'abort',
            () => stream.error(new DOMException('Aborted', 'AbortError')),
            { once: true },
          )
        },
      })
      return Promise.resolve(
        new Response(body, {
          headers: { 'Content-Type': 'text/event-stream' },
        }),
      )
    })
    vi.stubGlobal('fetch', fetch)
    const controller = new AbortController()
    const sentRequest = request(
      { ...payload, data: { provider: 'openai' } },
      controller.signal,
    )
    const response = await handleChatRequest(sentRequest, gatewayEnv)
    const reader = response.body!.getReader()
    const reading = reader.read()
    await vi.waitFor(() => expect(providerSignal).not.toBeNull())
    if (mode === 'disconnect') {
      controller.abort()
      expect(sentRequest.signal.aborted).toBe(true)
    } else await reader.cancel()
    await vi.waitFor(() => expect(providerSignal!.aborted).toBe(true))
    await reading
  })

  it('does not start an already cancelled request', async () => {
    const controller = new AbortController()
    controller.abort()
    expect(
      (await handleChatRequest(request(payload, controller.signal), gatewayEnv))
        .status,
    ).toBe(499)
  })

  it('streams through the actual client connection and supports another turn', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => openaiResponse()),
    )
    const client = new ChatClient({
      connection: fetchServerSentEvents('https://app.example.com/api/chat', {
        fetchClient: async (input, init) =>
          handleChatRequest(new Request(input, init), {
            ...gatewayEnv,
            AI_PROVIDER: 'openai',
          }),
      }),
    })
    await client.sendMessage('Weather in Paris?')
    expect(client.getMessages().at(-1)?.parts).toContainEqual(
      expect.objectContaining({ type: 'text', content: 'Simulated: sunny.' }),
    )
    await client.sendMessage('And London?')
    expect(
      client.getMessages().filter((message) => message.role === 'assistant'),
    ).toHaveLength(2)
  })

  it('executes the weather tool and preserves its result on the next user turn', async () => {
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const body = await new Request(input, init).json()
        const firstCall = fetch.mock.calls.length === 1
        if (!firstCall)
          expect(JSON.stringify(body.messages)).toContain('tool_result')
        const block = firstCall
          ? {
              type: 'tool_use',
              id: 'weather-call-1',
              name: 'getWeather',
              input: {},
            }
          : { type: 'text', text: '' }
        return sse([
          {
            type: 'message_start',
            message: {
              id: `message-${fetch.mock.calls.length}`,
              role: 'assistant',
              model: 'claude-haiku-4-5',
              content: [],
              usage: { input_tokens: 1, output_tokens: 0 },
            },
          },
          { type: 'content_block_start', index: 0, content_block: block },
          {
            type: 'content_block_delta',
            index: 0,
            delta: firstCall
              ? { type: 'input_json_delta', partial_json: '{"city":"Paris"}' }
              : { type: 'text_delta', text: 'Simulated weather for Paris.' },
          },
          { type: 'content_block_stop', index: 0 },
          {
            type: 'message_delta',
            delta: { stop_reason: firstCall ? 'tool_use' : 'end_turn' },
            usage: { output_tokens: 1 },
          },
          { type: 'message_stop' },
        ])
      },
    )
    vi.stubGlobal('fetch', fetch)
    const onError = vi.fn()
    const client = new ChatClient({
      onError,
      connection: fetchServerSentEvents('https://app.example.com/api/chat', {
        fetchClient: async (input, init) =>
          handleChatRequest(new Request(input, init), gatewayEnv),
      }),
    })
    await client.sendMessage('Weather in Paris?')
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(client.getMessages())).toContain('temperature')
    await client.sendMessage('Repeat those sample results.')
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(onError).not.toHaveBeenCalled()
  })
})
