import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Send, Square } from 'lucide-react'
import { Streamdown } from 'streamdown'

import { useAIChat } from '@/lib/ai-hook'
import type { ChatMessages } from '@/lib/ai-hook'

function Messages({ messages }: { messages: ChatMessages }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!messages.length) {
    return null
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto pb-4 min-h-0"
    >
      <div className="max-w-3xl mx-auto w-full px-4">
        {messages.map((message) => (
          <div key={message.id} className="p-4 border-b">
            <div className="flex items-start gap-4 max-w-3xl mx-auto w-full">
              <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-medium flex-shrink-0">
                {message.role === 'assistant' ? 'AI' : 'Y'}
              </div>
              <div className="flex-1 min-w-0">
                {message.parts.map((part, index) => {
                  if (part.type === 'text' && part.content) {
                    return (
                      <div
                        className="flex-1 min-w-0 prose max-w-none prose-sm"
                        key={index}
                      >
                        <Streamdown>{part.content}</Streamdown>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Home() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading, stop } = useAIChat()

  return (
    <div className="relative flex h-[calc(100vh-80px)]">
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl mx-auto w-full">
              <h1 className="text-4xl font-bold mb-4">
                Weather Chat
              </h1>
              <p className="mb-6">
                Ask me about the weather! Try "What's the weather in Paris?"
              </p>
            </div>
          </div>
        )}
        <Messages messages={messages} />

        <div className="sticky bottom-0 left-0 right-0 border-t z-10">
          <div className="max-w-3xl mx-auto w-full px-4 py-3">
            {isLoading && (
              <div className="flex items-center justify-center mb-3">
                <button
                  onClick={stop}
                  className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (input.trim()) {
                  sendMessage(input)
                  setInput('')
                }
              }}
            >
              <div className="relative max-w-xl mx-auto flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the weather..."
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 border rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
