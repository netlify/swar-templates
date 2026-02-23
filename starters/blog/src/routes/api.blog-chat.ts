import { createFileRoute } from '@tanstack/react-router'
import { chat, maxIterations, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { openaiText } from '@tanstack/ai-openai'
import { geminiText } from '@tanstack/ai-gemini'
import { ollamaText } from '@tanstack/ai-ollama'

import {
  getPostBySlug,
  getAllBlogPosts,
  searchBlogPosts,
} from '@/lib/blog-tools'
import type { Provider } from '@/lib/model-selection'

export const Route = createFileRoute('/api/blog-chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestSignal = request.signal

        if (requestSignal.aborted) {
          return new Response(null, { status: 499 })
        }

        const abortController = new AbortController()

        try {
          const body = await request.json()
          const { messages, slug } = body
          const data = body.data || {}

          const SYSTEM_PROMPT = slug
            ? `You are a helpful blog assistant. You help readers understand and engage with blog articles.

CAPABILITIES:
1. Use getPostBySlug to read the content of the article the user is currently viewing
2. Use getAllBlogPosts to see all available articles on the blog
3. Use searchBlogPosts to find articles that match the user's query

INSTRUCTIONS:
- When a user asks about "this article", "this post", or "what I'm reading", use getPostBySlug first
- Be conversational and helpful
- Summarize content when asked, highlight key points, and answer questions about the article
- If asked for recommendations, use getRelatedPosts to suggest similar content
- Keep responses concise but informative
- You can help explain concepts, provide additional context, or discuss themes from the articles

CONTEXT: The current article slug is "${slug}".`
            : `You are a helpful blog assistant. You help readers understand and engage with blog articles.

CAPABILITIES:
1. Use getAllBlogPosts to see all available articles on the blog
2. UsUse searchBlogPosts to find articles that match the user's query

INSTRUCTIONS:
- When a user asks for a recommendation, use searchBlogPosts to suggest similar content
- Keep responses concise but informative
- You can help explain concepts, provide additional context, or discuss themes from the articles`

          // Determine the best available provider
          let provider: Provider = data.provider || 'ollama'
          let model: string = data.model || 'mistral:7b'

          // Use the first available provider with an API key, fallback to ollama
          if (process.env.ANTHROPIC_API_KEY) {
            provider = 'anthropic'
            model = 'claude-haiku-4-5'
          } else if (process.env.OPENAI_API_KEY) {
            provider = 'openai'
            model = 'gpt-4o'
          } else if (process.env.GEMINI_API_KEY) {
            provider = 'gemini'
            model = 'gemini-2.0-flash-exp'
          }
          // else keep ollama as default

          // Adapter factory pattern for multi-vendor support
          const adapterConfig = {
            anthropic: () =>
              anthropicText((model || 'claude-haiku-4-5') as any),
            openai: () => openaiText((model || 'gpt-4o') as any),
            gemini: () => geminiText((model || 'gemini-2.0-flash-exp') as any),
            ollama: () => ollamaText((model || 'mistral:7b') as any),
          }

          const adapter = adapterConfig[provider]()

          const stream = chat({
            adapter,
            tools: [getPostBySlug, getAllBlogPosts, searchBlogPosts],
            systemPrompts: [SYSTEM_PROMPT],
            agentLoopStrategy: maxIterations(5),
            messages,
            abortController,
          })

          return toServerSentEventsResponse(stream, { abortController })
        } catch (error: any) {
          console.error('Blog chat error:', error)
          if (error.name === 'AbortError' || abortController.signal.aborted) {
            return new Response(null, { status: 499 })
          }
          return new Response(
            JSON.stringify({
              error: 'Failed to process chat request',
              message: error.message,
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
