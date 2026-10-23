import { z } from 'zod'
import profileData from '../../content/profile.json'

const webUrl = z
  .url()
  .refine(
    (value) => value.startsWith('https://') || value.startsWith('http://'),
    'Use an HTTP or HTTPS URL',
  )

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  headline: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  location: z.string().trim().min(1).optional(),
  email: z.email().optional(),
  phone: z
    .string()
    .regex(/^\+?[\d ()-]{5,30}$/)
    .refine((value) => /\d/.test(value), 'Include a phone number')
    .optional(),
  links: z
    .array(z.object({ label: z.string().trim().min(1), url: webUrl }))
    .default([]),
  skills: z.array(z.string().trim().min(1)).default([]),
  photo: z
    .object({
      src: z
        .string()
        .refine(
          (value) =>
            (value.startsWith('/') && !value.startsWith('//')) ||
            webUrl.safeParse(value).success,
          'Use a public image path or HTTP(S) URL',
        ),
      alt: z.string(),
    })
    .optional(),
})

export type ResumeProfile = z.infer<typeof profileSchema>
export const profile = profileSchema.parse(profileData)
export const resumeTitle = `${profile.name} | ${profile.headline}`
