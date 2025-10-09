import { z } from 'zod';

/**
 * ✅ Single invalid item schema — clean, reusable structure.
 */
export const InvalidCartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  reason: z.string(),
});

/**
 * ✅ Response DTO for verifyCart()
 */
export const VerifyCartResponseSchema = z.object({
  isValid: z.boolean(),
  invalidItems: z.array(InvalidCartItemSchema),
});

export type InvalidCartItem = z.infer<typeof InvalidCartItemSchema>;
export type VerifyCartResponse = z.infer<typeof VerifyCartResponseSchema>;
