import { z } from 'zod';
import { OrderModelSchema } from '../../generated/zod/schemas';
import { OrderItemDto } from './order-item.dto';

/**
 * Response shape for returning full orders with items
 */
export const OrderResponseDto = OrderModelSchema.extend({
  items: z.array(OrderItemDto),
});

export type OrderResponseDto = z.infer<typeof OrderResponseDto>;
