import { z } from 'zod'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`)
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    )
  }, 'Use a valid YYYY-MM-DD calendar date')
const entryFields = {
  summary: z.string().trim().min(1),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  content: z.string(),
}
const validRange = (entry: { startDate: string; endDate?: string }) =>
  !entry.endDate || entry.endDate >= entry.startDate

export const jobSchema = z
  .object({
    ...entryFields,
    jobTitle: z.string().trim().min(1),
    company: z.string().trim().min(1),
    location: z.string().trim().min(1).optional(),
  })
  .refine(validRange, 'End date must not precede start date')
export const educationSchema = z
  .object({ ...entryFields, school: z.string().trim().min(1) })
  .refine(validRange, 'End date must not precede start date')

export function renderResumeMarkdown(content: string) {
  return sanitizeHtml(marked.parse(content, { async: false }), {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  })
}
