// File: src/cart/utils/cart-mapper.ts
import { Prisma } from '@prisma/client';
import { CartDto } from '../dto/cart.dto';

export function mapCart(
  cart: Prisma.CartGetPayload<{
    include: { items: { include: { product: true } } };
  }> | null,
): CartDto | null {
  if (!cart) return null;

  return {
    id: cart.id,
    userId: cart.userId,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        name: item.productName ?? item.product?.name ?? 'Unknown Product',
        price: Number(item.productPrice ?? item.product?.price ?? 0),
        description:
          item.productDescription ?? item.product?.description ?? null,
        image: item.productImage ?? item.product?.images?.[0] ?? null,
      },
    })),
  };
}
