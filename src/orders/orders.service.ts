// src/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create order from either cartId or direct items.
   * Copies product.price -> orderItem.priceAtPurchase.
   * Performs stock check + decrement atomically.
   */
  async create(payload: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1) Resolve items array (productId + quantity)
      let items: { productId: string; quantity: number }[] = [];

      if ('cartId' in payload) {
        // Fetch cart with items and product reference
        const cart = await tx.cart.findUnique({
          where: { id: payload.cartId },
          include: {
            items: {
              include: { product: true }, // assumes cartItem has product relation
            },
          },
        });
        if (!cart)
          throw new NotFoundException(`Cart ${payload.cartId} not found`);
        if (!cart.items || cart.items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }

        items = cart.items.map((ci: any) => ({
          productId: ci.productId,
          quantity: ci.quantity,
        }));
      } else {
        // Direct items flow
        items = (payload as any).items;
      }

      const productIds = items.map((i) => i.productId);

      // 2) fetch current product prices & stock
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, stock: true, name: true },
      });

      // Map id -> product
      const prodMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist
      for (const it of items) {
        if (!prodMap.has(it.productId)) {
          throw new NotFoundException(`Product ${it.productId} not found`);
        }
      }

      // 3) Check stock & decrement atomically
      // Perform updateMany for each product with condition stock >= quantity
      for (const it of items) {
        const updated = await tx.product.updateMany({
          where: {
            id: it.productId,
            stock: { gte: it.quantity },
          },
          data: {
            stock: { decrement: it.quantity },
          },
        });
        if (updated.count === 0) {
          throw new ConflictException(
            `Insufficient stock for product ${it.productId}`,
          );
        }
      }

      // 4) Calculate total and build orderItems payload with priceAtPurchase
      const orderItemsCreate = items.map((it) => {
        const p = prodMap.get(it.productId)!;
        const priceAtPurchase = p.price;
        return {
          productId: it.productId,
          quantity: it.quantity,
          priceAtPurchase,
        };
      });

      const total = orderItemsCreate.reduce(
        (s, it) => s + it.priceAtPurchase * it.quantity,
        0,
      );

      // 5) Create order + order items (nested create)
      const order = await tx.order.create({
        data: {
          userId: 'userId' in payload ? (payload as any).userId : null,
          status: 'status' in payload ? (payload as any).status : 'PENDING',
          total,
          items: {
            create: orderItemsCreate.map((it) => ({
              quantity: it.quantity,
              priceAtPurchase: it.priceAtPurchase,
              product: { connect: { id: it.productId } }, // FIX
            })),
          },
        },
        include: { items: true },
      });

      // 6) If we used a cartId, clear the cart items (optional: keep history)
      if ('cartId' in payload) {
        await tx.cartItem.deleteMany({ where: { cartId: payload.cartId } });
      }

      return order;
    });
  }

  // simple finders
  async findAll() {
    return this.prisma.order.findMany({ include: { items: true } });
  }

  async findOne(id: string) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!o) throw new NotFoundException(`Order ${id} not found`);
    return o;
  }
}
