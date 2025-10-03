import { z } from 'zod';

/**
 * When creating an order, we don’t pass prices manually —
 * Service layer fetches product prices and snapshots them into `priceAtPurchase`.
 *
 * Two valid flows:
 * 1. Create order directly with product + quantity
 * 2. Create order from a cartId (service expands to items + prices)
 */
export const CreateOrderDto = z.union([
  // Direct product-based order
  z.object({
    userId: z.string(),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    ),
  }),

  // Order from a cart
  z.object({
    userId: z.string(),
    cartId: z.string(),
  }),
]);

export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
