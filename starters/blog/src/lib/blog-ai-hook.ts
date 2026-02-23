import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from '@tanstack/ai-react'
import type { InferChatMessages } from '@tanstack/ai-react'

// Default chat options for type inference
const defaultChatOptions = createChatClientOptions({
  connection: fetchServerSentEvents('/api/blog-chat'),
})

export type BlogChatMessages = InferChatMessages<typeof defaultChatOptions>

export const useBlogChat = (slug?: string) => {
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents('/api/blog-chat', {
      body: {
        slug,
      },
    }),
  })

  return useChat(chatOptions)
}
