// File: src/cart/cart.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { VerifiedCartResponse, VerifiedItem } from './types/verify-cart.types';
import { Size } from '@prisma/client';
import { mapCart } from './utils/cart-mapper';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // ================================
  // 🔹 Utility: Get or Create Cart
  // ================================
  private async getOrCreateCartTx(tx: any, userId: string) {
    let cart = await tx.cart.findFirst({ where: { userId } });
    if (!cart) cart = await tx.cart.create({ data: { userId } });
    return cart;
  }

  // ================================
  // 🔹 Find Cart for Logged-in User
  // ================================
  async findCartByUser(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    const dto = mapCart(cart);
    if (!dto) throw new NotFoundException('Cart not found');
    return dto;
  }

  // ================================
  // 🔹 Add Product to Cart (Fixed)
  // ================================
  async add(userId: string, dto: AddToCartDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.getOrCreateCartTx(tx, userId);

      const product = await tx.product.findUnique({
        where: { id: dto.productId },
        include: { sizes: true },
      });
      if (!product) throw new NotFoundException('Product not found');

      const sizeValue = dto.size ?? null;
      let stock = product.stock;

      if (sizeValue) {
        const sizeRecord = await tx.productSize.findUnique({
          where: {
            productId_size: {
              productId: dto.productId,
              size: sizeValue as Size,
            },
          },
        });
        if (!sizeRecord)
          throw new BadRequestException(`Size ${sizeValue} not found`);
        stock = sizeRecord.quantity;
      }

      if (stock < dto.quantity)
        throw new BadRequestException(`Only ${stock} items left in stock`);

      // 🧩 Determine existing cart item manually
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dto.productId,
          size: sizeValue, // can be null
        },
      });

      if (existingItem) {
        // ✅ Update quantity if already exists
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: { increment: dto.quantity },
            productName: product.name,
            productPrice: product.price,
            productDescription: product.description,
            productImage: product.images[0] ?? null,
          },
        });
      } else {
        // ✅ Otherwise create a new item
        await tx.cartItem.create({
          data: {
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
      }

      const updated = await tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } },
      });

      return mapCart(updated);
    });
  }

  // ================================
  // 🔹 Update Cart Item Quantity
  // ================================
  async update(userId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i.id === dto.itemId);
    if (!item) throw new NotFoundException('Item not found in cart');

    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
      include: { sizes: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    let stock = product.stock;
    if (item.size) {
      const sizeRecord = await this.prisma.productSize.findUnique({
        where: {
          productId_size: { productId: item.productId, size: item.size },
        },
      });
      if (!sizeRecord)
        throw new BadRequestException(`Size ${item.size} not found`);
      stock = sizeRecord.quantity;
    }

    if (dto.quantity > stock)
      throw new BadRequestException(`Only ${stock} left in stock`);

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });

    return this.findCartByUser(userId);
  }

  // ================================
  // 🔹 Remove a Cart Item
  // ================================
  async remove(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item not found in cart');

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    return this.findCartByUser(userId);
  }

  // ================================
  // 🔹 Clear Entire Cart
  // ================================
  async clear(userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared successfully' };
  }

  // ================================
  // 🔹 Verify Cart Validity
  // ================================
  async verifyCart(userId: string): Promise<VerifiedCartResponse> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: { include: { product: { include: { sizes: true } } } },
      },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const verifiedItems: VerifiedItem[] = [];
    const invalidItems: { id: string; reason: string }[] = [];
    let subtotal = 0;
    let totalQuantity = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        invalidItems.push({ id: item.id, reason: 'Product not found' });
        continue;
      }

      let price = Number(product.price);
      let availableStock = product.stock;
      let reason: string | undefined;

      if (item.size) {
        const sizeRecord = product.sizes.find((s) => s.size === item.size);
        if (!sizeRecord) {
          reason = `Size ${item.size} unavailable`;
        } else if (sizeRecord.quantity < item.quantity) {
          reason = `Only ${sizeRecord.quantity} left in stock`;
        }
        availableStock = sizeRecord?.quantity ?? 0;
      } else if (product.stock < item.quantity) {
        reason = `Only ${product.stock} left in stock`;
        availableStock = product.stock;
      }

      const isValid = !reason;
      const subtotalItem = Number(price) * item.quantity;

      verifiedItems.push({
        id: item.id,
        productId: item.productId,
        productName: item.productName ?? product.name,
        productImage: item.productImage ?? product.images[0] ?? null,
        price: price,
        quantity: item.quantity,
        subtotal: subtotalItem,
        reason,
      });

      if (isValid) {
        subtotal += subtotalItem;
        totalQuantity += item.quantity;
      } else {
        invalidItems.push({ id: item.id, reason: reason! });
      }
    }

    return {
      cartId: cart.id,
      userId,
      items: verifiedItems,
      subtotal,
      totalQuantity,
      invalidItems,
      isValid: invalidItems.length === 0,
      verifiedAt: new Date(),
    };
  }
}
