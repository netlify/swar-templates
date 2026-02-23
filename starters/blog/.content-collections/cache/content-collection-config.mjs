// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
var posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    categories: z.array(z.string()),
    slug: z.string().optional(),
    image: z.string(),
    date: z.string(),
    content: z.string()
  }),
  transform: async (doc) => {
    return {
      ...doc,
      slug: doc.title.toLowerCase().replace(".md", "").replace(/[^\w-]+/g, "_")
    };
  }
});
var content_collections_default = defineConfig({
  collections: [posts]
});
export {
  content_collections_default as default
};
