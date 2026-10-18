import { z } from 'zod';
const pair = z.object({ ko: z.string(), en: z.string() }).strict();
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const highlight = z
  .object({
    id: z.string().min(1),
    text: pair,
    label: pair.optional(),
    emphasis: z
      .object({ ko: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).min(1) })
      .strict()
      .optional(),
    facts: z.record(z.string(), z.number()),
    evidenceId: z.string(),
    translationReviewed: z.literal(true),
  })
  .strict();
const employment = z.object({
  id: z.string(),
  company: pair,
  role: pair,
  start: month,
  end: month.nullable(),
  location: pair,
  service: pair,
  detail: pair.optional(),
  positions: z
    .array(z.object({ role: pair, start: month, end: month.nullable() }).strict())
    .min(1)
    .optional(),
  logo: z.string(),
  highlights: z.array(highlight).min(3),
});
export const resumeSchema = z.object({
  schemaVersion: z.literal(1),
  outputs: z
    .object({
      pdf: z
        .object({
          sections: z.array(z.enum(['about', 'experience', 'research', 'education', 'awards'])),
          teaching: z.boolean(),
          researchTopics: z.boolean(),
        })
        .strict(),
    })
    .strict(),
  profile: z.object({
    name: pair,
    role: pair,
    location: pair,
    email: z.email(),
    phone: z.string(),
    portrait: z.object({
      src: z.string().startsWith('/assets/images/'),
      width: z.number().positive(),
      height: z.number().positive(),
      alt: pair,
    }),
    links: z.array(z.object({ label: z.string(), url: z.url() })),
  }),
  hero: z.object({
    eyebrow: pair,
    headline: pair,
    summary: pair,
    featured: z
      .array(z.object({ highlight: z.string(), takeaway: pair, translationReviewed: z.literal(true) }))
      .length(2),
  }),
  ui: z.record(
    z.string(),
    z.union([pair, z.object({ ko: z.array(z.string()).length(5), en: z.array(z.string()).length(5) })]),
  ),
  experience: z.array(employment),
  teaching: z.array(
    z.object({ id: z.string(), company: pair, role: pair, start: month, end: month, logo: z.string() }),
  ),
  research: z.array(
    z.object({
      id: z.string(),
      topic: pair,
      paperTitle: z.string().min(1),
      venue: z.string(),
      year: z.number(),
      role: pair,
      paper: z.url(),
      highlights: z.array(highlight).length(3),
    }),
  ),
  education: z.array(
    z.object({
      id: z.string(),
      school: pair,
      program: pair,
      status: pair,
      start: month,
      end: month,
      logo: z.string(),
    }),
  ),
  awards: z.array(z.object({ id: z.string(), title: pair, date: month, description: pair })),
  languages: z.array(
    z.object({ id: z.string(), title: pair, issued: month, expires: month, description: pair }),
  ),
  profiles: z.record(
    z.string(),
    z.object({
      label: pair,
      public: z.boolean(),
      experience: z.record(z.string(), z.array(z.string()).length(3)),
      research: z.array(z.string()),
    }),
  ),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
