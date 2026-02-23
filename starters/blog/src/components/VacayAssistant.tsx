import { useEffect, useRef, useState } from 'react'
import { Send, X, Palmtree, Sun } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { Store } from '@tanstack/store'

import { useBlogChat } from '@/lib/blog-ai-hook'
import type { BlogChatMessages } from '@/lib/blog-ai-hook'

function Messages({ messages }: { messages: BlogChatMessages }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-amber-200/60 text-sm px-6 py-8">
        <div className="relative mb-4">
          <Sun className="w-12 h-12 text-amber-400/40 animate-pulse" />
          <Palmtree className="w-6 h-6 text-emerald-400/60 absolute -bottom-1 -right-1" />
        </div>
        <p className="text-center text-amber-100/80 font-medium">
          Aloha! 🌺 How can I help?
        </p>
        <p className="text-xs text-amber-200/40 mt-2 text-center max-w-[200px]">
          Ask about adventures, get trip ideas, or explore the islands!
        </p>
      </div>
    )
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
      {messages.map(({ id, role, parts }) => (
        <div
          key={id}
          className={`py-3 ${
            role === 'assistant'
              ? 'bg-linear-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5'
              : 'bg-transparent'
          }`}
        >
          {parts.map((part, index) => {
            if (part.type === 'text' && part.content) {
              return (
                <div key={index} className="flex items-start gap-3 px-4">
                  {role === 'assistant' ? (
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg shadow-orange-500/20">
                      🌴
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                      You
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-amber-50 prose dark:prose-invert max-w-none prose-sm prose-p:text-amber-50 prose-headings:text-amber-100 prose-strong:text-amber-200">
                    <Streamdown>{part.content}</Streamdown>
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      ))}
    </div>
  )
}

interface VacayAssistantProps {
  slug?: string
  postTitle?: string
}

// Export store for header control
export const showVacayAssistant = new Store(false)

export default function VacayAssistant({
  slug,
  postTitle,
}: VacayAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, sendMessage, isLoading } = useBlogChat(slug)
  const [input, setInput] = useState('')

  // Sync with store for header control
  useEffect(() => {
    return showVacayAssistant.subscribe(() => {
      setIsOpen(showVacayAssistant.state)
    })
  }, [])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    showVacayAssistant.setState(() => newState)
  }

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 right-4 z-[100] w-[400px] h-[520px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20 backdrop-blur-xl bg-linear-to-b from-slate-900/98 via-slate-900/95 to-slate-800/98">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 rotate-3 hover:rotate-0 transition-transform">
            <span className="text-lg">🌴</span>
          </div>
          <div>
            <h3 className="font-bold text-amber-100 text-base tracking-tight">
              Vacay Assistant
            </h3>
            {postTitle && (
              <p className="text-xs text-amber-300/50 truncate max-w-[220px]">
                📍 {postTitle}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="text-amber-300/50 hover:text-amber-100 transition-colors p-2 hover:bg-white/5 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <Messages messages={messages} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="px-4 py-3 border-t border-amber-500/10">
          <div className="flex items-center gap-2 text-amber-400/80 text-xs">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></span>
            </div>
            <span className="font-medium">Planning your adventure...</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative p-4 border-t border-amber-500/10 bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Hawaii adventures..."
              disabled={isLoading}
              className="w-full rounded-2xl border border-amber-500/20 bg-slate-800/50 pl-4 pr-12 py-3 text-sm text-amber-50 placeholder-amber-200/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-transparent resize-none overflow-hidden disabled:opacity-50 transition-all"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '100px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 100) + 'px'
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  input.trim() &&
                  !isLoading
                ) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-white disabled:opacity-30 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 transition-all hover:shadow-lg hover:shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
