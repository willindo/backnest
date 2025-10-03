import { z } from 'zod';
export declare const OrderItemDto: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    priceAtPurchase: z.ZodNumber;
}, z.core.$strict>;
export type OrderItemDto = z.infer<typeof OrderItemDto>;
