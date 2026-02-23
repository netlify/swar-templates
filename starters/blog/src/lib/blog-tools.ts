import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

import { allPosts } from 'content-collections'

// Tool definition for getting the current blog post content
export const getPostBySlugToolDef = toolDefinition({
  name: 'getCurrentBlogPost',
  description:
    'Get the full content and metadata of the current blog post the user is viewing. Use this to answer questions about the article.',
  inputSchema: z.object({
    slug: z.string().describe('The slug of the current blog post'),
  }),
  outputSchema: z.object({
    title: z.string(),
    summary: z.string(),
    content: z.string(),
    categories: z.array(z.string()),
    date: z.string(),
    image: z.string(),
  }),
})

// Server implementation
export const getPostBySlug = getPostBySlugToolDef.server(({ slug }) => {
  const post = allPosts.find((post) => post.slug === slug)
  if (!post) {
    return {
      title: 'Post not found',
      summary: '',
      content: 'The requested blog post was not found.',
      categories: [],
      date: '',
      image: '',
    }
  }
  return {
    title: post.title,
    summary: post.summary,
    content: post.content,
    categories: post.categories,
    date: post.date,
    image: post.image,
  }
})

// Tool definition for listing all available blog posts
export const getAllBlogPostsToolDef = toolDefinition({
  name: 'getAllBlogPosts',
  description:
    'Get a list of all available blog posts with their titles, summaries, and categories. Useful for recommending related content or answering questions about other posts.',
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      summary: z.string(),
      categories: z.array(z.string()),
      date: z.string(),
    }),
  ),
})

// Server implementation
export const getAllBlogPosts = getAllBlogPostsToolDef.server(() => {
  return allPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    categories: post.categories,
    date: post.date,
  }))
})

// Tool definition for suggesting related posts
export const searchBlogPostsToolDef = toolDefinition({
  name: 'searchBlogPosts',
  description:
    "Search for blog posts by title, summary, or categories. Use this to find articles that match the user's query.",
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  outputSchema: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      summary: z.string(),
      categories: z.array(z.string()),
      sharedCategories: z.array(z.string()),
    }),
  ),
})

// Server implementation
export const searchBlogPosts = searchBlogPostsToolDef.server(({ query }) => {
  return allPosts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.summary.toLowerCase().includes(query.toLowerCase()) ||
        post.categories.some((cat) =>
          cat.toLowerCase().includes(query.toLowerCase()),
        ),
    )
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      categories: post.categories,
    }))
})
