import { defineCollection, defineConfig } from '@content-collections/core'
import {
  jobSchema,
  educationSchema,
  renderResumeMarkdown,
} from './src/lib/resume-content'

const jobs = defineCollection({
  name: 'jobs',
  directory: 'content/jobs',
  include: '**/*.md',
  schema: jobSchema,
  transform: (document) => ({
    ...document,
    html: renderResumeMarkdown(document.content),
  }),
})

const education = defineCollection({
  name: 'education',
  directory: 'content/education',
  include: '**/*.md',
  schema: educationSchema,
  transform: (document) => ({
    ...document,
    html: renderResumeMarkdown(document.content),
  }),
})

export default defineConfig({
  content: [jobs, education],
})
