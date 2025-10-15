// src/cart/cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CartDto } from './dto';
import { Prisma } from '@prisma/client';
import { VerifiedCartResponse, VerifiedItem } from './types/verify-cart.types';
import { Size } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private mapCart(
    cart: Prisma.CartGetPayload<{
      include: { items: { include: { product: true } } };
    }>,
  ): CartDto {
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

  async findCartByUser(userId: string): Promise<CartDto> {
    // No need for explicit user check
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return this.mapCart(cart);
  }

  async add(
    userId: string,
    dto: AddToCartDto & { size?: string | null },
  ): Promise<CartDto> {
    let cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const sizeValue = dto.size ?? null;

    if (sizeValue) {
      await this.prisma.cartItem.upsert({
        where: {
          cartId_productId_size: {
            cartId: cart.id,
            productId: dto.productId,
            size: sizeValue,
          },
        },
        update: { quantity: { increment: dto.quantity } },
        create: {
          cartId: cart.id,
          productId: dto.productId,
          size: sizeValue,
          quantity: dto.quantity,
          productName: product.name,
          productPrice: product.price,
          productDescription: product.description,
          productImage: product.images[0] ?? null,
        },
      });
    } else {
      const existing = await this.prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: dto.productId, size: null },
      });
      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: dto.quantity } },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: dto.productId,
            size: null,
            quantity: dto.quantity,
            productName: product.name,
            productPrice: product.price,
            productDescription: product.description,
            productImage: product.images[0] ?? null,
          },
        });
      }
    }

    return this.findCartByUser(userId);
  }

  async update(userId: string, dto: UpdateCartItemDto): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item || item.cartId !== cart.id)
      throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.update({
      where: { id: dto.itemId },
      data: { quantity: dto.quantity },
    });
    return this.findCartByUser(userId);
  }

  async remove(userId: string, itemId: string): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.cartId !== cart.id)
      throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.findCartByUser(userId);
  }

  async clear(userId: string): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.findCartByUser(userId);
  }

  async verifyCart(userId: string): Promise<VerifiedCartResponse> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const invalidItems: { id: string; reason: string }[] = [];

    const items: VerifiedItem[] = cart.items.map((item) => {
      const priceNum = Number(item.productPrice ?? item.product?.price ?? 0);
      const subtotal = priceNum * item.quantity;
      let reason: string | undefined;

      if (!item.product) reason = 'Product removed';
      else if (item.quantity > item.product.stock)
        reason = `Only ${item.product.stock} left in stock`;

      if (reason) invalidItems.push({ id: item.id, reason });

      return {
        id: item.id,
        productId: item.productId,
        productName:
          item.productName ?? item.product?.name ?? 'Unknown Product',
        productImage: item.productImage ?? item.product?.images?.[0] ?? null,
        price: priceNum,
        quantity: item.quantity,
        subtotal,
        reason,
      };
    });

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      cartId: cart.id,
      userId: cart.userId,
      items,
      subtotal,
      totalQuantity,
      invalidItems,
      isValid: invalidItems.length === 0,
      verifiedAt: new Date(),
    };
  }
}
