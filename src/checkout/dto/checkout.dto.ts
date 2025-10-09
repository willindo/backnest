// src/checkout/dto/checkout.dto.ts
import { z } from 'zod';

/**
 * Minimal checkout request:
 * - optionally include addressId (if you support addresses)
 * - optionally include paymentMethod (placeholder)
 */
export const CheckoutBodySchema = z.object({
  cartId: z.string(),
  addressId: z.string().uuid().nullable().optional(),
  paymentMethod: z.string().optional(), // e.g., "stripe", "razorpay"
  // you can extend with shipping notes, coupon codes, etc.
});

export type CheckoutBody = z.infer<typeof CheckoutBodySchema>;
