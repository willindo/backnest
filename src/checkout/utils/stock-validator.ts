// src/checkout/utils/stock-validator.ts
import { BadRequestException } from '@nestjs/common';
import { CartItem, Product } from '@prisma/client';

export function validateStock(cartItems: any[]) {
  for (const item of cartItems) {
    const sizeRecord = item.product.sizes.find(
      (s: { size: string; quantity: number }) => s.size === item.size,
    );
    if (!sizeRecord) {
      throw new BadRequestException(
        `Size ${item.size} not found for product ${item.product.name}`,
      );
    }
    if (sizeRecord.quantity < item.quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${item.product.name} (${item.size})`,
      );
    }
  }
}
