import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      priceAtPurchase: z.number(),
      size: z.string().optional(),
    }),
  ),
  totalAmount: z.number(),
  couponId: z.string().optional(),
  giftCardId: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
