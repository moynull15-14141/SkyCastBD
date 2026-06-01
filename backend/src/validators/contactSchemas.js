import { z } from 'zod';

export const contactMessageBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  message: z.string().trim().min(10).max(2000)
});
