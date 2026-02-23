import { createFileRoute } from '@tanstack/react-router'
import { marked } from 'marked'

import { allPosts } from 'content-collections'

import VacayAssistant from '@/components/VacayAssistant'

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const post = allPosts.find((post) => post.slug === params.slug)
    if (!post) {
      throw new Error('Post not found')
    }
    return post
  },
  component: RouteComponent,
})

function RouteComponent() {
  const post = Route.useLoaderData()

  return (
    <div className="min-h-screen flex flex-col">
      <VacayAssistant slug={post.slug} postTitle={post.title} />

      <div
        className="relative h-[66vh]"
        style={{
          backgroundImage: `url(/${post.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative -mt-[40vh]">
        <div className="container mx-auto max-w-4xl px-4 text-white">
          <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
            <div className="p-8 md:p-12">
              {/* Title section */}
              <h1 className="text-4xl font-serif italic md:text-5xl font-bold  mb-4 drop-shadow-lg">
                {post.title}
              </h1>

              {/* Summary section */}
              <p className="text-lg text-white mb-8 drop-shadow">
                {post.summary}
              </p>

              {/* Main content */}
              <div className="prose prose-lg max-w-none prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-a:text-teal-300">
                <div
                  dangerouslySetInnerHTML={{ __html: marked(post.content) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
