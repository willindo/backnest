import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  RawBodyRequest,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  constructor(
    private readonly paymentsService: PaymentsService,
    private config: ConfigService,
  ) {}

  // Called by frontend after internal order is created
  @Post('create-order')
  async createOrder(@Body() body: { orderId: string; amount: number }) {
    const { orderId, amount } = body;
    if (!orderId || !amount)
      throw new BadRequestException('orderId and amount required');

    const res = await this.paymentsService.createOrderForInternalOrder(
      orderId,
      amount,
    );
    // res currently returns { razorpayOrderId, amount, currency }
    return {
      ...res,
      id: res.razorpayOrderId,
      razorpayOrderId: res.razorpayOrderId,
      amount: Math.round(Number(res.amount) * 100), // paise if required
      currency: res.currency,
    };
  }

  // Called by client after Razorpay popup success
  @Post('verify')
  async verify(@Body() body: any) {
    // expected fields: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
    return this.paymentsService.verifyPayment(body);
  }

  // Webhook endpoint — use raw body and signature header
  // Configure Nest to expose raw body for this route (see main.ts changes below)
  @Post('webhook')
  async webhook(
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
      this.logger.warn('Invalid Razorpay webhook signature');
      return { ok: false };
    }

    const payload = JSON.parse(raw.toString());
    const event = payload.event;

    if (event === 'payment.captured') {
      const entity = payload.payload.payment.entity;
      const razorpayOrderId = entity.order_id;
      const razorpayPaymentId = entity.id;

      try {
        await this.paymentsService.verifyPayment({
          orderId:
            entity.notes?.internal_order_id ??
            (await this.lookupInternalOrderId(razorpayOrderId)),
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: '', // already verified
        });

        this.logger.log(
          `✅ Webhook processed: payment.captured [${razorpayPaymentId}]`,
        );
      } catch (err) {
        this.logger.error('Webhook reconciliation failed', err);
      }
    } else {
      this.logger.log(`Unhandled Razorpay event: ${event}`);
    }

    return { ok: true };
  }

  // optional helper that maps rp order to internal order via Payment table
  private async lookupInternalOrderId(razorpayOrderId: string) {
    const payment = await this.paymentsService['prisma'].payment.findFirst({
      where: { razorpayOrderId },
    });
    return payment?.orderId;
  }
}
