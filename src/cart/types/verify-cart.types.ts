export interface VerifiedItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  reason?: string;
}

export interface VerifiedCartResponse {
  cartId: string;
  userId: string;
  items: VerifiedItem[];
  subtotal: number;
  totalQuantity: number;
  invalidItems: { id: string; reason: string }[];
  isValid: boolean;
  verifiedAt: Date;
}
