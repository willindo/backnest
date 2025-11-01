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
    console.log('🪙 Razorpay keys loaded:', {
      keyId,
      hasSecret: !!this.keySecret,
    });
    this.razorpay = new RazorpayProvider(keyId, this.keySecret);
  }

  /**
   * Create a Razorpay order and persist Payment record linking to internal orderId.
   */
  async createOrderForInternalOrder(orderId: string, amountInRupees: number) {
    try {
      // amount in paise for Razorpay
      const amountPaise = Math.round(amountInRupees * 100);

      const rpOrder = await this.razorpay.createOrder({
        amount: amountPaise,
        currency: 'INR',
        receipt: `order_${orderId}`,
      });

      // Persist Payment record — idempotent safe (if you re-call, update existing)
      await this.prisma.payment.upsert({
        where: { razorpayOrderId: rpOrder.id }, // UNIQUE constraint key
        create: {
          userId: (await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true },
          }))!.userId,
          orderId,
          razorpayOrderId: rpOrder.id, // store Razorpay Order ID
          amount: amountPaise,
          currency: rpOrder.currency ?? 'INR',
          status: 'PENDING',
        },
        update: {
          razorpayOrderId: rpOrder.id,
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
   * Verify payment callback from client (or webhook) and reconcile DB
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
    const ok = this.razorpay.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      this.keySecret,
    );
    if (!ok) {
      throw new BadRequestException('Invalid signature');
    }

    // Update Payment and Order atomically
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId: internalOrderId, razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id, // payment id from Razorpay
          signature: razorpay_signature,
          status: 'PAID',
        },
      });

      await tx.order.update({
        where: { id: internalOrderId },
        data: {
          latestPaymentId: razorpay_payment_id, // ✅ now valid
          paymentStatus: 'PAID',
          status: 'PROCESSING',
        },
      });
    });

    return { success: true };
  }

  /**
   * Webhook verification helper — verify using webhook secret and return boolean
   */
  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
    webhookSecret: string,
  ) {
    // const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }
}
