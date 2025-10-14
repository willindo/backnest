// src/payments/providers/razorpay.provider.ts
import Razorpay from 'razorpay';

export class RazorpayProvider {
  private rp: Razorpay;

  constructor(keyId: string, keySecret: string) {
    this.rp = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createOrder(opts: {
    amount: number;
    currency: string;
    receipt?: string;
  }) {
    return this.rp.orders.create({
      amount: opts.amount,
      currency: opts.currency,
      receipt: opts.receipt ?? `rcpt_${Date.now()}`,
    });
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
    keySecret: string,
  ) {
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  }
}
