import { z } from 'zod';
export declare const OrderItemDto: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    id: z.ZodString;
    priceAtPurchase: z.ZodNumber;
}, z.core.$strict>;
export type OrderItemDto = z.infer<typeof OrderItemDto>;
