import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Size } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create Order after successful payment
  async createOrder(userId: string, data: CreateOrderDto) {
    const { addressId, items, totalAmount, couponId, giftCardId } = data;

    // Verify address ownership
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new ForbiddenException('Invalid address');

    // Create order with order items
    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        items: {
          create: (items ?? []).map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            size: item.size ? (item.size as Size) : undefined,
          })),
        },
        couponUsages: couponId
          ? {
              create: { couponId, userId },
            }
          : undefined,
        GiftCardUsage: giftCardId
          ? {
              create: { giftCardId, amountUsed: totalAmount },
            }
          : undefined,
      },
      include: {
        items: {
          include: { product: { select: { name: true, images: true } } },
        },
        address: true,
      },
    });

    return order;
  }

  // ✅ Fetch all orders for a user
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Fetch single order without ownership (internal use)
  async getOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        address: true,
      },
    });
  }

  // ✅ Fetch single order with ownership check
  async getOrderByIdWithOwnership(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        address: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  // ✅ Example invoice generator (safe and realistic)
  async getInvoiceData(orderId: string, userId: string) {
    const order = await this.getOrderByIdWithOwnership(orderId, userId);

    return {
      invoiceNo: `INV-${order.id.slice(0, 8).toUpperCase()}`,
      date: order.createdAt,
      customer: {
        name: order.address?.line1,
        address: `${order.address?.city}, ${order.address?.country}`,
      },
      items: order.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        subtotal: Number(item.priceAtPurchase) * item.quantity,
      })),
      totalAmount: order.totalAmount,
      tax: order.taxAmount,
      discount: order.discountAmount,
      grandTotal:
        Number(order.totalAmount) +
        Number(order.taxAmount) -
        Number(order.discountAmount),
    };
  }

  // ✅ For admin dashboard (not user-facing)
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
