import { OrderItemDto } from './order-item.dto';
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    userId?: string;
}
