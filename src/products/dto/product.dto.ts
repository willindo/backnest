import { z } from 'zod';
import {
  ProductModelSchema,
  ProductCreateInputObjectSchema,
  ProductUpdateInputObjectSchema,
} from '../../generated/zod/schemas';

// Create DTO (from generator, usually strict)
export const CreateProductDto = z.object({
  name: z.string(),
  price: z.number(),
  stock: z.number().default(0),
  description: z.string().optional(),
  images: z.array(z.string()).optional(), // if storing URLs
});
export type CreateProductDto = z.infer<typeof CreateProductDto>;

// Update DTO (make patch-style optional)
export const UpdateProductDto = (
  ProductUpdateInputObjectSchema as z.ZodObject<any>
).partial();
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;

// Response DTO
export const ProductResponseDto = ProductModelSchema;
export type ProductResponseDto = z.infer<typeof ProductResponseDto>;
