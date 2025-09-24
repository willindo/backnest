import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Fetch all orders with items and product info
  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });
  }

  // Fetch single order by ID
  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  // Checkout: create order from cart
  async checkout(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Fetch user's cart with items and product data
      const cart = await tx.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true, // for price
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total
      const total = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      // Create order with items
      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // required
            })),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }
}
