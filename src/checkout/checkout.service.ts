// src/checkout/checkout.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async processCheckout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { sizes: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock availability
    for (const item of cart.items) {
      const sizeRecord = item.product.sizes.find((s) => s.size === item.size);
      if (!sizeRecord) {
        throw new BadRequestException(
          `Size ${item.size} not found for ${item.productName}`,
        );
      }
      if (sizeRecord.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.productName} (${item.size})`,
        );
      }
    }

    // Atomic transaction: lock stock, create order & payment
    return await this.prisma.$transaction(async (tx) => {
      // Deduct stock
      for (const item of cart.items) {
        await tx.productSize.updateMany({
          where: {
            productId: item.productId,
            size: item.size!, // ✅ type-safe
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Calculate total
      const total = cart.items.reduce(
        (sum, item) => sum + Number(item.productPrice) * item.quantity,
        0,
      );

      // Create order with size included in OrderItem
      const order = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.productPrice!,
              size: item.size, // ✅ store size for each OrderItem
            })),
          },
        },
      });

      // Create payment placeholder
      const payment = await tx.payment.create({
        data: {
          userId,
          orderId: order.id,
          amount: total,
          currency: 'INR',
          status: 'PENDING',
        },
      });

      // Empty cart after order creation
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return {
        message: 'Checkout initialized',
        orderId: order.id,
        paymentId: payment.id,
        amount: total,
        currency: 'INR',
      };
    });
  }
}
