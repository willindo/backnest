import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CheckoutBody } from './dto/checkout.dto';
import { InvalidCartItem } from './dto/verify-cart.dto';
import { VerifiedCartResponse } from '../cart/types/verify-cart.types';
import { Prisma } from '@prisma/client';
@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string, payload: CheckoutBody) {
    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const cart = await tx.cart.findUnique({
            where: { userId },
            include: {
              items: { include: { product: true } },
            },
          });

          if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
          }

          let total = 0;
          const orderItemsCreate = [];

          // Decrement stock safely
          for (const item of cart.items) {
            const price = Number(item.product?.price ?? item.productPrice ?? 0);
            total += price * item.quantity;

            // Check and decrement inventory
            if (item.size) {
              // Variant exists → decrement ProductSize.quantity
              const sizeRecord = await tx.productSize.findFirst({
                where: { productId: item.productId, size: item.size },
              });

              if (!sizeRecord) {
                throw new BadRequestException(
                  `Product size not found for ${item.product?.name}`,
                );
              }

              if (sizeRecord.quantity < item.quantity) {
                throw new BadRequestException(
                  `Insufficient stock for ${item.product?.name} (${item.size})`,
                );
              }

              await tx.productSize.update({
                where: { id: sizeRecord.id },
                data: { quantity: { decrement: item.quantity } },
              });
            } else {
              // No size → decrement Product.stock
              if (item.product.stock < item.quantity) {
                throw new BadRequestException(
                  `Insufficient stock for ${item.product?.name}`,
                );
              }

              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            }

            orderItemsCreate.push({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: price,
            });
          }

          // Create Order
          const order = await tx.order.create({
            data: {
              userId,
              total,
              status: 'PENDING',
              items: { create: orderItemsCreate },
            },
            include: { items: true },
          });

          // Clear cart
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

          return order;
        },
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      console.error(err);
      throw new InternalServerErrorException('Checkout failed');
    }
  }
  async verifyCart(userId: string): Promise<VerifiedCartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart) throw new BadRequestException('Cart not found');

    const invalidItems: { id: string; reason: string }[] = [];
    const verifiedItems = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        invalidItems.push({ id: item.id, reason: 'Product not found' });
        continue;
      }

      const price = Number(product.price ?? item.productPrice ?? 0);
      subtotal += price * item.quantity;
      totalQuantity += item.quantity;

      if (item.size) {
        const sizeRecord = await this.prisma.productSize.findFirst({
          where: { productId: item.productId, size: item.size },
          select: { quantity: true },
        });

        if (!sizeRecord) {
          invalidItems.push({
            id: item.id,
            reason: `Variant (${item.size}) not found`,
          });
        } else if (sizeRecord.quantity < item.quantity) {
          invalidItems.push({
            id: item.id,
            reason: `Only ${sizeRecord.quantity} left for size ${item.size}`,
          });
        }
      } else if (product.stock < item.quantity) {
        invalidItems.push({
          id: item.id,
          reason: `Only ${product.stock} left in stock`,
        });
      }

      verifiedItems.push({
        id: item.id,
        productId: item.productId,
        productName: product.name,
        productImage: product.images?.[0] ?? null,
        price,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      });
    }

    return {
      cartId: cart.id,
      userId: cart.userId,
      items: verifiedItems,
      subtotal,
      totalQuantity,
      invalidItems,
      isValid: invalidItems.length === 0,
      verifiedAt: new Date(),
    };
  }
}
