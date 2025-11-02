import { z } from 'zod';

export const AddressInputSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(4),
  country: z.string().default('India').optional(),
});

export const CheckoutBodySchema = z.object({
  cartId: z.string().optional(),
  addressId: z.string().uuid().nullable().optional(),
  address: AddressInputSchema.optional(),
  paymentMethod: z.string().default('razorpay').optional(),
  couponCode: z.string().optional(),
  giftCardCode: z.string().optional(),
});

export type AddressInput = z.infer<typeof AddressInputSchema>;
export type CheckoutBody = z.infer<typeof CheckoutBodySchema>;
