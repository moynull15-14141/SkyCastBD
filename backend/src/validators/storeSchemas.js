import { z } from 'zod';

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB object id.');

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(''));

export const productBodySchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().min(10).max(2000),
    regularPrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0).optional().default(0),
    imageUrl: optionalUrlSchema,
    stockStatus: z.enum(['In Stock', 'Out of Stock']).default('In Stock')
  })
  .refine((value) => !value.salePrice || value.salePrice <= value.regularPrice, {
    path: ['salePrice'],
    message: 'Sale price cannot be higher than regular price.'
  });

export const productParamSchema = z.object({
  id: objectIdSchema
});

export const productQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(100)
});

export const orderBodySchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  shippingAddress: z.string().trim().min(10).max(500),
  selectedProduct: z.object({
    id: objectIdSchema,
    title: z.string().trim().min(2).max(160)
  }),
  paymentMethod: z.enum(['bKash', 'Nagad', 'DBBL']),
  transactionId: z.string().trim().min(4).max(120)
});

export const orderQuerySchema = z.object({
  status: z.enum(['Pending', 'Completed', 'all']).optional(),
  limit: z.coerce.number().int().positive().max(200).default(200)
});
