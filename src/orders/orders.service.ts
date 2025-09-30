import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { Order, OrderItem, Product } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Map Prisma order to frontend DTO
  private mapOrderToDto(
    order: Order & { items: (OrderItem & { product: Product | null })[] },
  ): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      total: order.total,
      status: order.status ?? 'PENDING',
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.product?.name,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  // Fetch all orders
  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map(this.mapOrderToDto);
  }

  // Fetch single order
  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return this.mapOrderToDto(order);
  }

  // Create order from user's cart
  async checkout(userId: string): Promise<OrderResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      // Fetch user's cart with product info
      const cart = await tx.cart.findFirst({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new NotFoundException('Cart is empty');
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
          status: 'PENDING',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return this.mapOrderToDto(order);
    });
  }
}
