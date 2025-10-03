import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CartDto, CartItemDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /** Map Prisma cart & cart items → CartDto */
  private mapCart(
    cart: Prisma.CartGetPayload<{ include: { items: true } }>,
  ): CartDto {
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          name: item.productName || 'Unknown Product',
          price: item.productPrice || 0,
          description: item.productDescription || undefined,
          image: item.productImage || undefined,
        },
      })),
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
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
}
