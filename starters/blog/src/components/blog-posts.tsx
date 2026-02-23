import { Link } from '@tanstack/react-router'

import { type Post } from 'content-collections'

import { Card, CardContent } from '@/components/ui/card'

export default function BlogPosts({
  title,
  posts,
}: {
  title: string
  posts: Post[]
}) {
  return (
    <div>
      <div className="container mx-auto max-w-7xl">
        <h1 className="mb-16 text-7xl font-bold text-teal-900 text-center font-serif  italic">
          {title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4">
          {posts.map((post, index) => (
            <Link
              to={`/posts/${post.slug}`}
              key={post._meta.path}
              className="group relative block"
            >
              <Card
                className={`relative overflow-hidden transform transition-all duration-500 bg-white
                ${
                  index % 2 === 0
                    ? 'rotate-[-1deg] hover:rotate-[-2deg]'
                    : 'rotate-[1deg] hover:rotate-[2deg]'
                }
                hover:scale-105 hover:z-10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                before:absolute before:inset-0 before:z-10 before:border-[12px] before:border-white
                after:absolute after:inset-0 after:z-0 after:bg-[radial-gradient(#00000005_1px,transparent_1px)] after:bg-[length:4px_4px]`}
              >
                <div className="relative z-20">
                  {/* Postcard Stamp */}
                  <div className="absolute top-4 right-4 w-16 h-20 border-2 border-dashed border-teal-900/20 rounded-sm" />

                  {/* Image Container */}
                  <div className="aspect-[3/2] relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 z-10 transition-opacity group-hover:opacity-0" />
                    <img
                      src={`/${post.image}`}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Content */}
                  <CardContent className="p-6 bg-transparent">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-serif italic text-teal-900 group-hover:text-teal-800 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-teal-800/80 font-serif">
                        {post.summary}
                      </p>
                      <p className="text-teal-700/60 text-sm italic font-serif">
                        {post.date}
                      </p>
                    </div>
                  </CardContent>

                  {/* Decorative Lines */}
                  <div className="absolute left-0 right-0 bottom-0 h-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#0F766E20_2px,#0F766E20_4px)]" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#0F766E20_2px,#0F766E20_4px)]" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
