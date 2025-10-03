import { z } from 'zod';
import { OrderItemModelSchema } from '../../generated/zod/schemas';

/**
 * OrderItem DTO
 * - `priceAtPurchase` is required (snapshotted at order creation)
 */
export const OrderItemDto = OrderItemModelSchema.pick({
  id: true,
  productId: true,
  quantity: true,
  priceAtPurchase: true,
});

export type OrderItemDto = z.infer<typeof OrderItemDto>;
