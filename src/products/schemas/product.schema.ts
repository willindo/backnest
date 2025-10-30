import { z } from 'zod';

export const SizeEnum = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
export const GenderEnum = z.enum(['MENS', 'WOMENS', 'BOYS', 'GIRLS', 'UNISEX']);

export const ProductSizeSchema = z.object({
  size: SizeEnum,
  quantity: z.number().min(0),
});

export const CreateProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().min(0),
  gender: GenderEnum.nullable().optional(),
  sizes: z.array(ProductSizeSchema).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// ✅ Add these lines
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
