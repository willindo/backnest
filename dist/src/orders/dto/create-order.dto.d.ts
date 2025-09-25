import { OrderItemDto } from './order-item.dto';
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress?: string;
    userId?: number;
}
