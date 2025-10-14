import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  RawBodyRequest,
  Logger,
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
    if (!orderId || !amount) throw new Error('orderId and amount required');
    return this.paymentsService.createOrderForInternalOrder(orderId, amount);
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
    const webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET')!;
    if (
      !this.paymentsService.verifyWebhookSignature(
        raw,
        signature,
        webhookSecret,
      )
    ) {
      this.logger.warn('Invalid webhook signature');
      return { ok: false };
    }

    const payload = JSON.parse(raw.toString());
    // handle events: payment.captured, payment.failed, order.paid etc.
    // Example: when payment captured, update DB
    if (payload.event === 'payment.captured') {
      const {
        payload: {
          payment: { entity },
        },
      } = payload;
      // entity contains order_id and id (payment id)
      const razorpayOrderId = entity.order_id;
      const razorpayPaymentId = entity.id;
      // You may want to find internal order by payment record
      await this.paymentsService
        .verifyPayment({
          orderId:
            entity.notes?.internal_order_id ??
            (await this.lookupInternalOrderId(razorpayOrderId)),
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: '', // webhook verification already done; pass empty string or adjust verifyPayment to skip signature check when from webhook
        })
        .catch((err) =>
          this.logger.error('Webhook reconciliation failed', err),
        );
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
