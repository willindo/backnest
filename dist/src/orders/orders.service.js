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
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(userId, data) {
        const { addressId, items, totalAmount, couponId, giftCardId } = data;
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address)
            throw new common_1.ForbiddenException('Invalid address');
        const order = await this.prisma.order.create({
            data: {
                userId,
                addressId,
                totalAmount,
                items: {
                    create: (items !== null && items !== void 0 ? items : []).map((item) => ({
                        product: { connect: { id: item.productId } },
                        quantity: item.quantity,
                        priceAtPurchase: item.priceAtPurchase,
                        size: item.size ? item.size : undefined,
                    })),
                },
                couponUsages: couponId
                    ? {
                        create: { couponId, userId },
                    }
                    : undefined,
                GiftCardUsage: giftCardId
                    ? {
                        create: { giftCardId, amountUsed: totalAmount },
                    }
                    : undefined,
            },
            include: {
                items: {
                    include: { product: { select: { name: true, images: true } } },
                },
                address: true,
            },
        });
        return order;
    }
    async getUserOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: { include: { product: true } },
                address: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrderById(orderId) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                address: true,
            },
        });
    }
    async getOrderByIdWithOwnership(orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                address: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return order;
    }
    async getInvoiceData(orderId, userId) {
        var _a, _b, _c;
        const order = await this.getOrderByIdWithOwnership(orderId, userId);
        return {
            invoiceNo: `INV-${order.id.slice(0, 8).toUpperCase()}`,
            date: order.createdAt,
            customer: {
                name: (_a = order.address) === null || _a === void 0 ? void 0 : _a.line1,
                address: `${(_b = order.address) === null || _b === void 0 ? void 0 : _b.city}, ${(_c = order.address) === null || _c === void 0 ? void 0 : _c.country}`,
            },
            items: order.items.map((item) => ({
                product: item.product.name,
                quantity: item.quantity,
                price: item.priceAtPurchase,
                subtotal: Number(item.priceAtPurchase) * item.quantity,
            })),
            totalAmount: order.totalAmount,
            tax: order.taxAmount,
            discount: order.discountAmount,
            grandTotal: Number(order.totalAmount) +
                Number(order.taxAmount) -
                Number(order.discountAmount),
        };
    }
    async getAllOrders() {
        return this.prisma.order.findMany({
            include: { user: true, items: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map