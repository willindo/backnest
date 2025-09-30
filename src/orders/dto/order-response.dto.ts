import { OrderItemDto } from './order-item.dto';

export class OrderResponseDto {
  id!: string; // order ID
  userId!: string; // user who created the order
  total!: number; // total price of the order
  status!: string; // order status, e.g., 'PENDING'
  items!: Array<{
    productId: string;
    quantity: number;
    price: number;
    name?: string; // product name snapshot
  }>;
  createdAt!: string; // ISO string
  updatedAt!: string; // ISO string
}
