// src/orders/orders.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderInput } from './schemas/create-order.schema';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private calculateTotal(items: { quantity: number; price: number }[]) {
    return items.reduce((s, it) => s + it.quantity * it.price, 0);
  }

  /**
   * Creates an order either from body.items or from the user's cart.
   * Entire operation is wrapped in a transaction:
   *  - validate & decrement stock (ProductSize.quantity or Product.stock)
   *  - create Order & OrderItem (price snapshot)
   *  - clear user's cart items
   *
   * If any validation fails, transaction rolls back.
   */
  async createOrderFromPayload(userId: string, payload: CreateOrderInput) {
    // Resolve items: client-provided or from cart
    let itemsInput = payload.items ?? [];

    if (itemsInput.length === 0) {
      // build from cart
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
      if (!cart || !cart.items.length) {
        throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
      }

      itemsInput = cart.items.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        size: ci.size ?? undefined,
        price: Number(ci.productPrice),
      }));
    }

    // enrich prices where missing
    const itemsWithPrice = await Promise.all(
      itemsInput.map(async (it) => {
        if (typeof it.price === 'number') return it;
        const product = await this.prisma.product.findUnique({
          where: { id: it.productId },
        });
        if (!product)
          throw new HttpException(
            `Product ${it.productId} not found`,
            HttpStatus.BAD_REQUEST,
          );
        return { ...it, price: Number(product.price) };
      }),
    );

    const total = this.calculateTotal(
      itemsWithPrice as { quantity: number; price: number }[],
    );
    const paymentMethod = payload.paymentMethod ?? 'COD';
    const currency = payload.currency ?? 'INR';

    try {
      const createdOrder = await this.prisma.$transaction(async (tx) => {
        // 1) Validate & decrement stock
        for (const it of itemsWithPrice) {
          if (it.size) {
            // update ProductSize.quantity if size specified
            const updated = await tx.productSize.updateMany({
              where: {
                productId: it.productId,
                size: it.size as any,
                quantity: { gte: it.quantity },
              },
              data: { quantity: { decrement: it.quantity } },
            });
            if (updated.count === 0) {
              throw new HttpException(
                `Insufficient stock for product ${it.productId} size ${it.size}`,
                HttpStatus.CONFLICT,
              );
            }
          } else {
            // fallback to Product.stock
            const updated = await tx.product.updateMany({
              where: { id: it.productId, stock: { gte: it.quantity } },
              data: { stock: { decrement: it.quantity } },
            });
            if (updated.count === 0) {
              throw new HttpException(
                `Insufficient stock for product ${it.productId}`,
                HttpStatus.CONFLICT,
              );
            }
          }
        }

        // 2) Create order + items (snapshot price)
        const order = await tx.order.create({
          data: {
            userId,
            total: total as any,
            // ✅ fix enum mismatch
            status:
              paymentMethod === 'COD'
                ? OrderStatus.PROCESSING
                : OrderStatus.PENDING,
            paymentStatus:
              paymentMethod === 'COD'
                ? PaymentStatus.PAID
                : PaymentStatus.PENDING,
            // address: payload.address ? (payload.address as any) : null,
            // notes: payload.notes ?? null,
            items: {
              create: itemsWithPrice.map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
                priceAtPurchase: it.price as any,
              })),
            },
          },
          include: { items: true },
        });

        // 3) Clear cart items (if cart exists)
        await tx.cartItem.deleteMany({
          where: { cart: { userId } as any }, // delete items for user cart
        });

        return order;
      });

      return createdOrder;
    } catch (err: unknown) {
      // ✅ fix TS18046 by typing err
      if (err instanceof HttpException) throw err;
      if (err instanceof Error) {
        throw new HttpException(
          err.message ?? 'Order creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unknown error during order creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        user: false,
      },
    });
    if (!order)
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    return order;
  }

  async listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }

  /**
   * Cancel an order and restock items.
   * NOTE: orderItem currently does not persist `size`. If you need size-aware restock,
   * add `size` field to OrderItem and persist it when creating the order.
   */
  async cancelOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order)
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    if (order.status === OrderStatus.CANCELLED) return order;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Restock: best-effort to product.stock (since OrderItem doesn't store size)
        for (const it of order.items) {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { increment: it.quantity } },
          });
        }
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      });

      return this.getOrderById(orderId);
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      if (err instanceof Error) {
        throw new HttpException(
          err.message ?? 'Cancel failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Unknown error during cancellation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
