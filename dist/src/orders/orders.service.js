"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateTotal(items) {
        return items.reduce((s, it) => s + it.quantity * it.price, 0);
    }
    async createOrderFromPayload(userId, payload) {
        var _a, _b, _c, _d;
        let itemsInput = (_a = payload.items) !== null && _a !== void 0 ? _a : [];
        if (itemsInput.length === 0) {
            const cart = await this.prisma.cart.findUnique({
                where: { userId },
                include: { items: true },
            });
            if (!cart || !cart.items.length) {
                throw new common_1.HttpException('Cart is empty', common_1.HttpStatus.BAD_REQUEST);
            }
            itemsInput = cart.items.map((ci) => {
                var _a;
                return ({
                    productId: ci.productId,
                    quantity: ci.quantity,
                    size: (_a = ci.size) !== null && _a !== void 0 ? _a : undefined,
                    price: Number(ci.productPrice),
                });
            });
        }
        const itemsWithPrice = await Promise.all(itemsInput.map(async (it) => {
            if (typeof it.price === 'number')
                return it;
            const product = await this.prisma.product.findUnique({
                where: { id: it.productId },
            });
            if (!product)
                throw new common_1.HttpException(`Product ${it.productId} not found`, common_1.HttpStatus.BAD_REQUEST);
            return Object.assign(Object.assign({}, it), { price: Number(product.price) });
        }));
        const total = this.calculateTotal(itemsWithPrice);
        const paymentMethod = (_b = payload.paymentMethod) !== null && _b !== void 0 ? _b : 'COD';
        const currency = (_c = payload.currency) !== null && _c !== void 0 ? _c : 'INR';
        try {
            const createdOrder = await this.prisma.$transaction(async (tx) => {
                for (const it of itemsWithPrice) {
                    if (it.size) {
                        const updated = await tx.productSize.updateMany({
                            where: {
                                productId: it.productId,
                                size: it.size,
                                quantity: { gte: it.quantity },
                            },
                            data: { quantity: { decrement: it.quantity } },
                        });
                        if (updated.count === 0) {
                            throw new common_1.HttpException(`Insufficient stock for product ${it.productId} size ${it.size}`, common_1.HttpStatus.CONFLICT);
                        }
                    }
                    else {
                        const updated = await tx.product.updateMany({
                            where: { id: it.productId, stock: { gte: it.quantity } },
                            data: { stock: { decrement: it.quantity } },
                        });
                        if (updated.count === 0) {
                            throw new common_1.HttpException(`Insufficient stock for product ${it.productId}`, common_1.HttpStatus.CONFLICT);
                        }
                    }
                }
                const order = await tx.order.create({
                    data: {
                        userId,
                        total: total,
                        status: paymentMethod === 'COD'
                            ? client_1.OrderStatus.PROCESSING
                            : client_1.OrderStatus.PENDING,
                        paymentStatus: paymentMethod === 'COD'
                            ? client_1.PaymentStatus.PAID
                            : client_1.PaymentStatus.PENDING,
                        items: {
                            create: itemsWithPrice.map((it) => ({
                                productId: it.productId,
                                quantity: it.quantity,
                                priceAtPurchase: it.price,
                            })),
                        },
                    },
                    include: { items: true },
                });
                await tx.cartItem.deleteMany({
                    where: { cart: { userId } },
                });
                return order;
            });
            return createdOrder;
        }
        catch (err) {
            if (err instanceof common_1.HttpException)
                throw err;
            if (err instanceof Error) {
                throw new common_1.HttpException((_d = err.message) !== null && _d !== void 0 ? _d : 'Order creation failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException('Unknown error during order creation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOrderById(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                user: false,
            },
        });
        if (!order)
            throw new common_1.HttpException('Order not found', common_1.HttpStatus.NOT_FOUND);
        return order;
    }
    async listForUser(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } },
        });
    }
    async cancelOrder(orderId) {
        var _a;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.HttpException('Order not found', common_1.HttpStatus.NOT_FOUND);
        if (order.status === client_1.OrderStatus.CANCELLED)
            return order;
        try {
            await this.prisma.$transaction(async (tx) => {
                for (const it of order.items) {
                    await tx.product.update({
                        where: { id: it.productId },
                        data: { stock: { increment: it.quantity } },
                    });
                }
                await tx.order.update({
                    where: { id: orderId },
                    data: { status: client_1.OrderStatus.CANCELLED },
                });
            });
            return this.getOrderById(orderId);
        }
        catch (err) {
            if (err instanceof common_1.HttpException)
                throw err;
            if (err instanceof Error) {
                throw new common_1.HttpException((_a = err.message) !== null && _a !== void 0 ? _a : 'Cancel failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException('Unknown error during cancellation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map