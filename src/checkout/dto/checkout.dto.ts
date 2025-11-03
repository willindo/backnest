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
  addressId: z.string().optional(),
  address: AddressInputSchema.optional(),
  paymentMethod: z.string(),
  couponCode: z.string().optional(),
  giftCardCode: z.string().optional(),
  // 👇 New guest info
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().positive(),
        size: z.string().optional(),
        productPrice: z.number().optional(),
      }),
    )
    .optional(),
});

export type AddressInput = z.infer<typeof AddressInputSchema>;
export type CheckoutBody = z.infer<typeof CheckoutBodySchema>;
// export const CheckoutBodySchema = z.object({
//   cartId: z.string().optional(),
//   addressId: z.string().uuid().nullable().optional(),
//   address: AddressInputSchema.optional(),
//   paymentMethod: z.string().default('razorpay').optional(),
//   couponCode: z.string().optional(),
//   giftCardCode: z.string().optional(),
// });
