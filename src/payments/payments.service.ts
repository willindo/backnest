import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RazorpayProvider } from './providers/razorpay.provider';
import * as crypto from 'crypto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: RazorpayProvider;
  private keySecret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID')!;
    this.keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET')!;
    this.logger.log('🪙 Razorpay keys loaded');
    this.razorpay = new RazorpayProvider(keyId, this.keySecret);
  }

  /**
   * Create a Razorpay order and persist Payment record linking to internal orderId.
   */
  async createOrderForInternalOrder(orderId: string, amountInRupees: number) {
    try {
      const amountPaise = Math.round(amountInRupees * 100);

      const rpOrder = await this.razorpay.createOrder({
        amount: amountPaise,
        currency: 'INR',
        receipt: `order_${orderId}`,
      });

      // upsert Payment record for tracking (store amount in paise)
      const dbOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
      });
      if (!dbOrder) throw new BadRequestException('Internal order not found');

      await this.prisma.payment.upsert({
        where: { razorpayOrderId: rpOrder.id },
        create: {
          userId: dbOrder.userId,
          orderId,
          razorpayOrderId: rpOrder.id,
          amount: amountPaise, // store paise (or change to rupees as you prefer)
          currency: rpOrder.currency ?? 'INR',
          status: 'PENDING',
        },
        update: {
          orderId,
          amount: amountPaise,
          currency: rpOrder.currency ?? 'INR',
          status: 'PENDING',
        },
      });

      return {
        razorpayOrderId: rpOrder.id,
        amount: amountInRupees,
        currency: rpOrder.currency ?? 'INR',
      };
    } catch (err) {
      this.logger.error('Failed creating Razorpay order', err);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  /**
   * Verify payment callback from client (with signature) and reconcile DB.
   * Expects: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
   */
  async verifyPayment({
    orderId: internalOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    // verify signature (razorpay_order_id | razorpay_payment_id)
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new BadRequestException('Invalid signature');
    }

    // reconcile DB: atomically update Payment row and Order
    return await this.prisma.$transaction(async (tx) => {
      // 1) Update payment rows that match this razorpayOrderId & internal order (idempotent)
      // If a payment row doesn't exist (rare), create one.
      let payment = await tx.payment.findFirst({
        where: { orderId: internalOrderId, razorpayOrderId: razorpay_order_id },
      });

      if (!payment) {
        payment = await tx.payment.create({
          data: {
            userId: (await tx.order.findUnique({
              where: { id: internalOrderId },
              select: { userId: true },
            }))!.userId,
            orderId: internalOrderId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            signature: razorpay_signature,
            amount: 0, // optional — keep as 0 or fetch from rp if needed
            status: 'PAID',
          },
        });
      } else {
        payment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'PAID',
          },
        });
      }

      // 2) Update order to point to internal payment id and mark paid/processing
      await tx.order.update({
        where: { id: internalOrderId },
        data: {
          latestPaymentId: payment.id,
          paymentStatus: 'PAID',
          status: 'PROCESSING',
        },
      });

      // 3) (Optional) reduce stock, clear cart, etc. — depending on your flow you may want to
      // perform these in a separate finalized step (or do them here). For webhook/client-verify
      // we generally finalize the order:
      const order = await tx.order.findUnique({
        where: { id: internalOrderId },
        include: { items: true },
      });

      if (order) {
        // reduce stock
        for (const item of order.items) {
          await tx.productSize.updateMany({
            where: {
              productId: item.productId,
              size: item.size ?? undefined,
            },
            data: { quantity: { decrement: item.quantity } },
          });
          // await this.productsService.recalculateProductStock(
          //   item.productId,
          //   tx,
          // );
        }

        // clear cart
        await tx.cart.update({
          where: { userId: order.userId! },
          data: { items: { deleteMany: {} } },
        });
      }

      return { success: true, paymentId: payment.id };
    });
  }

  /**
   * Called by webhook when Razorpay notifies us of a captured payment.
   * We already validated webhook signature at controller level so we just reconcile.
   */
  async reconcileCapturedPayment({
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
  }: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
  }) {
    // This is similar to verifyPayment but without signature verification.
    return await this.prisma.$transaction(async (tx) => {
      // find existing Payment by razorpayOrderId or orderId
      let payment = await tx.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id },
      });

      // If not found, create a payment row referencing the internal order & rp ids
      if (!payment) {
        const dbOrder = await tx.order.findUnique({
          where: { id: orderId },
          select: { userId: true },
        });
        if (!dbOrder) {
          throw new BadRequestException('Internal order not found');
        }

        payment = await tx.payment.create({
          data: {
            userId: dbOrder.userId,
            orderId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: 0, // optional
            currency: 'INR',
            status: 'PAID',
          },
        });
      } else {
        // update existing
        payment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: razorpay_payment_id,
            status: 'PAID',
          },
        });
      }

      // update order to mark paid and set latestPaymentId to our payment.id
      await tx.order.update({
        where: { id: orderId },
        data: {
          latestPaymentId: payment.id,
          paymentStatus: 'PAID',
          status: 'PROCESSING',
        },
      });

      // reduce stock + clear cart (same as above)
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          await tx.productSize.updateMany({
            where: {
              productId: item.productId,
              size: item.size ?? undefined,
            },
            data: { quantity: { decrement: item.quantity } },
          });
        }
        await tx.cart.update({
          where: { userId: order.userId! },
          data: { items: { deleteMany: {} } },
        });
      }

      return { success: true, paymentId: payment.id };
    });
  }

  /**
   * Webhook signature helper
   */
  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    webhookSecret: string,
  ) {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }

  /**
   * Low-level signature helper (if you use provider)
   * Not required if you implemented above logic directly.
   */
  verifyRpSignature(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    signature: string,
  ) {
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    return expected === signature;
  }
}
