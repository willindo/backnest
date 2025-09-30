import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { CartDto, CartItemDto } from './dto/cart-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /** Map Prisma cart & cart items to CartDto */
  private mapCart(
    cart: Prisma.CartGetPayload<{
      include: { items: { include: { product: true } } };
    }>,
  ): CartDto {
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(
        (item): CartItemDto => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                description: item.product.description,
              }
            : undefined,
        }),
      ),
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };
  }

  async findCartByUser(userId: string): Promise<CartDto> {
    // make sure user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) throw new Error(`User ${userId} does not exist`);

    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      // create cart and include items
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    // now cart always has items array
    return this.mapCart(cart);
  }

  async add(userId: string, dto: AddToCartDto): Promise<CartDto> {
    let cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: dto.productId },
      },
      update: { quantity: { increment: dto.quantity } },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });

    return this.findCartByUser(userId);
  }

  // src/cart/cart.service.ts
  async update(userId: string, dto: UpdateCartItemDto): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item || item.cartId !== cart.id) {
      throw new Error('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: dto.itemId },
      data: { quantity: dto.quantity },
    });

    return this.findCartByUser(userId);
  }

  async remove(userId: string, itemId: string): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.cartId !== cart.id) {
      throw new Error('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.findCartByUser(userId);
  }
  async clear(userId: string): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.findCartByUser(userId);
  }
}
