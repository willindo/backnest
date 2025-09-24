import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Find a user's cart with items and product details
  async findCartByUser(userId: string) {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  // Add item to cart
  async add(userId: string, dto: AddToCartDto) {
    // Ensure cart exists
    let cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // Upsert cart item
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      update: { quantity: { increment: dto.quantity } },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  // Update quantity of cart item
  async update(userId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    return this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
      data: { quantity: dto.quantity },
    });
  }

  // Remove item from cart
  async remove(userId: string, productId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');

    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });
  }
}
