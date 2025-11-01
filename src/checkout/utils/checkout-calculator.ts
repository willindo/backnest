// src/checkout/utils/checkout-calculator.ts
export function calculateTotal(cartItems: any[]) {
  return cartItems.reduce((sum, item) => {
    const price = Number(item.productPrice ?? item.product.price);
    return sum + price * item.quantity;
  }, 0);
}
