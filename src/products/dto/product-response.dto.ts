// src/products/dto/product-response.dto.ts
import { Role } from '@prisma/client';

export class ProductResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description?: string;
  price!: number;
  currency!: string;
  stock!: number;
  images!: string[];
  sku?: string;
  createdAt!: string;
  updatedAt!: string;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}
