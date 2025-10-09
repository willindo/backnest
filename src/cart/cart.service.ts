import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CartDto, CartItemDto } from './dto';
import { Prisma } from '@prisma/client';
import { VerifiedCartResponse, VerifiedItem } from './types/verify-cart.types';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /** Map Prisma cart & cart items → CartDto */
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
          price: item.productPrice ?? item.product?.price ?? 0,
          description:
            item.productDescription ?? item.product?.description ?? null,
          image: item.productImage ?? item.product?.images?.[0] ?? null,

          createdAt: cart.createdAt.toISOString(),
          updatedAt: cart.updatedAt.toISOString(),
        },
      })),
    };
  }

  async findCartByUser(userId: string): Promise<CartDto> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists)
      throw new NotFoundException(`User ${userId} does not exist`);

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

  async add(userId: string, dto: AddToCartDto): Promise<CartDto> {
    let cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: dto.productId },
      },
      update: { quantity: { increment: dto.quantity } },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        productName: product.name,
        productPrice: product.price,
        productDescription: product.description,
        productImage: product.images.length > 0 ? product.images[0] : null,
      },
    });

    return this.findCartByUser(userId);
  }

  async update(userId: string, dto: UpdateCartItemDto): Promise<CartDto> {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

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
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

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
      let reason: string | undefined;

      // Check if product exists
      if (!item.product) {
        reason = 'Product removed';
      }
      // Check stock
      else if (item.quantity > item.product.stock) {
        reason = `Only ${item.product.stock} left in stock`;
      }

      if (reason) invalidItems.push({ id: item.id, reason });

      return {
        id: item.id,
        productId: item.productId,
        productName:
          item.productName ?? item.product?.name ?? 'Unknown Product',
        productImage: item.productImage ?? item.product?.images?.[0] ?? null,
        price: item.productPrice ?? item.product?.price ?? 0,
        quantity: item.quantity,
        subtotal:
          (item.productPrice ?? item.product?.price ?? 0) * item.quantity,
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
