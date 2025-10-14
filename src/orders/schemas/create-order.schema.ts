// src/orders/schemas/create-order.schema.ts
import { z } from 'zod';

/**
 * CreateOrderSchema
 * - items: optional (if absent, server will build from user's cart)
 * - each item: productId, quantity, optional size, optional price snapshot
 * - paymentMethod: helpful hint for order status (COD -> mark PAID)
 * - address: free-form JSON (shipping)
 */
export const OrderItemInput = z.object({
  productId: z.string().uuid().or(z.string()), // allow uuid or string id depending on your ids
  quantity: z.number().int().min(1),
  size: z.string().optional(), // should match Size enum if provided
  price: z.number().positive().optional(),
});

export const CreateOrderSchema = z.object({
  // optional: client can supply items; otherwise server will create order from cart
  items: z.array(OrderItemInput).optional(),
  paymentMethod: z
    .enum(['COD', 'RAZORPAY', 'STRIPE'])
    .optional()
    .default('COD'),
  currency: z.string().optional().default('INR'),
  address: z.any().optional(),
  notes: z.string().optional(),
  // Only used for testing when auth not enabled; server prefers req.user.id
  userId: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
