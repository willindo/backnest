import { z } from 'zod';

// Add to Cart DTO
export const AddToCartDto = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type AddToCartDto = z.infer<typeof AddToCartDto>;

// Update Cart Item DTO
export const UpdateCartItemDto = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;

// Cart Item Response DTO
export const CartItemDto = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int(),
  product: z.object({
    name: z.string(),
    price: z.number(),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});
export type CartItemDto = z.infer<typeof CartItemDto>;

// Cart Response DTO
export const CartDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(CartItemDto),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CartDto = z.infer<typeof CartDto>;
