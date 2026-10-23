import { createFileRoute } from '@tanstack/react-router'
import { handleChatRequest } from '@/lib/chat.server'

export const Route = createFileRoute('/api/chat')({
  server: { handlers: { POST: ({ request }) => handleChatRequest(request) } },
})
