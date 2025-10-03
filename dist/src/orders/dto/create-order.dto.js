"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = void 0;
const zod_1 = require("zod");
exports.CreateOrderDto = zod_1.z.union([
    zod_1.z.object({
        userId: zod_1.z.string(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string(),
            quantity: zod_1.z.number().int().positive(),
        })),
    }),
    zod_1.z.object({
        userId: zod_1.z.string(),
        cartId: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=create-order.dto.js.map