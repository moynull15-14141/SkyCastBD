import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can contain lowercase letters, numbers, and single hyphens only.');

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(''));

export const blogBodySchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: slugSchema.optional(),
  content: z.string().trim().min(20),
  featuredImage: optionalUrlSchema,
  status: z.enum(['draft', 'published']).default('draft'),
  date: z.coerce.date().optional(),
  seo: z
    .object({
      metaTitle: z.string().trim().max(70).optional().or(z.literal('')),
      metaDescription: z.string().trim().max(170).optional().or(z.literal('')),
      keywords: z.string().trim().max(255).optional().or(z.literal(''))
    })
    .default({})
});

export const blogQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'all']).optional(),
  includeDrafts: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

export const blogSlugParamSchema = z.object({
  slug: slugSchema
});
