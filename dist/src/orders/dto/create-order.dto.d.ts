import { z } from 'zod';
export declare const CreateOrderDto: z.ZodUnion<readonly [z.ZodObject<{
    userId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    userId: z.ZodString;
    cartId: z.ZodString;
}, z.core.$strip>]>;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
