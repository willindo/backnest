// src/cart/dto/cart-response.dto.ts
export type CartItemProductDto = {
  id: string;
  name: string;
  price: number;
  description: string | null;
};

export type CartItemDto = {
  id: string;
  productId: string;
  quantity: number;
  product?: CartItemProductDto;
};

export type CartDto = {
  id: string;
  userId: string;
  items: CartItemDto[];
  createdAt: string;
  updatedAt: string;
};
