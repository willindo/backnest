import {
  Body,
  Controller,
  Post,
  Headers,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * STEP 1 — Create Razorpay Order
   * Called by frontend after internal order (our DB order) is created.
   */
  @Post('create-order')
  async createOrder(
    @Body() body: { orderId: string; amount: number },
  ): Promise<any> {
    const { orderId, amount } = body;
    if (!orderId || !amount) {
      throw new BadRequestException('orderId and amount are required');
    }

    const order = await this.paymentsService.createOrderForInternalOrder(
      orderId,
      amount,
    );

    return {
      razorpayOrderId: order.razorpayOrderId,
      amount: order.amount,
      currency: order.currency,
      key: this.config.get<string>('RAZORPAY_KEY_ID'),
    };
  }

  /**
   * STEP 2 — Verify Payment
   * Called by frontend after Razorpay checkout popup success.
   */
  @Post('verify')
  async verifyPayment(@Body() body: any) {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      throw new BadRequestException('Missing Razorpay verification fields');
    }

    return this.paymentsService.verifyPayment({
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  }

  /**
   * STEP 3 — Razorpay Webhook
   * Receives server-to-server notifications from Razorpay
   * (useful for redundancy, reconciliation, or failed client callbacks).
   *
   * Ensure `rawBody` is exposed for this route via main.ts:
   * ```ts
   * app.use('/payments/webhook', express.raw({ type: 'application/json' }));
   * ```
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const raw = req.rawBody as Buffer;
    const webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) throw new BadRequestException('Webhook secret missing');

    const isValid = this.paymentsService.verifyWebhookSignature(
      raw,
      signature,
      webhookSecret,
    );

    if (!isValid) {
      this.logger.warn('❌ Invalid Razorpay webhook signature');
      return { ok: false };
    }

    const payload = JSON.parse(raw.toString());
    const event = payload.event;
    this.logger.log(`📦 Webhook event received: ${event}`);

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;
      const internalOrderId =
        payment.notes?.internal_order_id ??
        (await this.lookupInternalOrderId(razorpayOrderId));

      if (!internalOrderId) {
        this.logger.warn(`No internal order found for ${razorpayOrderId}`);
        return { ok: true };
      }

      await this.paymentsService.reconcileCapturedPayment({
        orderId: internalOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      });

      this.logger.log(`✅ Webhook processed: ${razorpayPaymentId}`);
    }

    return { ok: true };
  }

  // optional helper (kept private)
  private async lookupInternalOrderId(razorpayOrderId: string) {
    try {
      const payment = await this.paymentsService['prisma'].payment.findFirst({
        where: { razorpayOrderId },
      });
      return payment?.orderId;
    } catch (err) {
      this.logger.error('Failed to lookup internal order', err);
      return null;
    }
  }
}
