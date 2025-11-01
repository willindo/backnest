// src/checkout/checkout.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { validateStock } from './utils/stock-validator';
import { calculateTotal } from './utils/checkout-calculator';
import { Decimal } from '@prisma/client/runtime/library';
import { Coupon, GiftCard, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CheckoutsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Step 1: Start Checkout Process
   * Validates stock, calculates total, applies discounts, creates Order draft.
   */
  async startCheckout(
    userId: string,
    couponCode?: string,
    giftCardCode?: string,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { sizes: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // ✅ Validate stock before proceeding
    validateStock(cart.items);

    // ✅ Calculate total cart price
    const subtotal = calculateTotal(cart.items);

    // ✅ Apply marketing discounts
    let discountAmount = 0;
    let appliedCoupon: Coupon | null = null;
    let appliedGiftCard: GiftCard | null = null;

    if (couponCode) {
      appliedCoupon = await this.validateCoupon(userId, couponCode, subtotal);
      discountAmount = this.calculateCouponDiscount(appliedCoupon, subtotal);
    }

    if (giftCardCode) {
      appliedGiftCard = await this.validateGiftCard(giftCardCode);
      const useAmount = Math.min(
        Number(appliedGiftCard.balance),
        subtotal - discountAmount,
      );
      discountAmount += useAmount;
    }

    const finalAmount = subtotal - discountAmount;

    // ✅ Create pending order
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount: new Decimal(finalAmount),
        discountAmount: new Decimal(discountAmount),
        taxAmount: new Decimal(0),
        shippingCost: new Decimal(0),
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.productPrice ?? item.product.price,
            size: item.size,
          })),
        },
      },
      include: { items: true },
    });

    return {
      message: 'Checkout initiated successfully',
      subtotal,
      discountAmount,
      finalAmount,
      orderId: order.id,
      appliedCoupon: appliedCoupon?.code,
      appliedGiftCard: appliedGiftCard?.code,
    };
  }

  /**
   * Step 2: Confirm Payment (after Razorpay or any gateway success)
   */
  async confirmPayment(
    userId: string,
    orderId: string,
    paymentData: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      signature: string;
      amount: number;
    },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      // ✅ Create payment record
      const payment = await tx.payment.create({
        data: {
          userId,
          orderId,
          razorpayPaymentId: paymentData.razorpayPaymentId,
          razorpayOrderId: paymentData.razorpayOrderId,
          signature: paymentData.signature,
          amount: new Decimal(paymentData.amount),
          status: PaymentStatus.PAID,
        },
      });

      // ✅ Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          latestPaymentId: payment.id,
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      // ✅ Reduce product stock
      for (const item of order.items) {
        await tx.productSize.updateMany({
          where: {
            productId: item.productId,
            size: item.size!,
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      // ✅ Clear cart after successful checkout
      await tx.cart.update({
        where: { userId },
        data: { items: { deleteMany: {} } },
      });

      return {
        message: 'Payment confirmed & order finalized successfully',
        orderId: order.id,
        paymentId: payment.id,
      };
    });
  }

  /**
   * Validate Coupon (expiry, usage, min purchase)
   */
  private async validateCoupon(userId: string, code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.active)
      throw new BadRequestException('Invalid or inactive coupon');

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate)
      throw new BadRequestException('Coupon not yet active');
    if (coupon.endDate && now > coupon.endDate)
      throw new BadRequestException('Coupon expired');

    if (coupon.minPurchase && subtotal < coupon.minPurchase)
      throw new BadRequestException(
        `Minimum purchase ₹${coupon.minPurchase} required`,
      );

    const alreadyUsed = await this.prisma.couponUsage.findFirst({
      where: { userId, couponId: coupon.id },
    });

    if (alreadyUsed) throw new BadRequestException('Coupon already used');

    return coupon;
  }

  private calculateCouponDiscount(coupon: Coupon, subtotal: number) {
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.discountType === 'FIXED') {
      discount = coupon.discountValue;
    }
    return discount;
  }

  /**
   * Validate Gift Card
   */
  private async validateGiftCard(code: string) {
    const giftCard = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!giftCard || !giftCard.isActive)
      throw new BadRequestException('Invalid or inactive gift card');

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt)
      throw new BadRequestException('Gift card expired');

    if (Number(giftCard.balance) <= 0)
      throw new BadRequestException('Gift card has no balance');

    return giftCard;
  }
}
