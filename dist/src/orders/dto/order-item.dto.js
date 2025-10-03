"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemDto = void 0;
const schemas_1 = require("../../generated/zod/schemas");
exports.OrderItemDto = schemas_1.OrderItemModelSchema.pick({
    id: true,
    productId: true,
    quantity: true,
    priceAtPurchase: true,
});
//# sourceMappingURL=order-item.dto.js.map