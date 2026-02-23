import { createFileRoute } from '@tanstack/react-router'

import { allPosts } from 'content-collections'

import BlogPosts from '@/components/blog-posts'
import VacayAssistant from '@/components/VacayAssistant'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
      <VacayAssistant />
      <BlogPosts title="Hawaii Adventures" posts={allPosts} />
    </>
  )
}
