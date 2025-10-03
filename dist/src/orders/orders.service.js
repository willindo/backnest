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
    async create(payload) {
        return this.prisma.$transaction(async (tx) => {
            let items = [];
            if ('cartId' in payload) {
                const cart = await tx.cart.findUnique({
                    where: { id: payload.cartId },
                    include: {
                        items: {
                            include: { product: true },
                        },
                    },
                });
                if (!cart)
                    throw new common_1.NotFoundException(`Cart ${payload.cartId} not found`);
                if (!cart.items || cart.items.length === 0) {
                    throw new common_1.BadRequestException('Cart is empty');
                }
                items = cart.items.map((ci) => ({
                    productId: ci.productId,
                    quantity: ci.quantity,
                }));
            }
            else {
                items = payload.items;
            }
            const productIds = items.map((i) => i.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, price: true, stock: true, name: true },
            });
            const prodMap = new Map(products.map((p) => [p.id, p]));
            for (const it of items) {
                if (!prodMap.has(it.productId)) {
                    throw new common_1.NotFoundException(`Product ${it.productId} not found`);
                }
            }
            for (const it of items) {
                const updated = await tx.product.updateMany({
                    where: {
                        id: it.productId,
                        stock: { gte: it.quantity },
                    },
                    data: {
                        stock: { decrement: it.quantity },
                    },
                });
                if (updated.count === 0) {
                    throw new common_1.ConflictException(`Insufficient stock for product ${it.productId}`);
                }
            }
            const orderItemsCreate = items.map((it) => {
                const p = prodMap.get(it.productId);
                const priceAtPurchase = p.price;
                return {
                    productId: it.productId,
                    quantity: it.quantity,
                    priceAtPurchase,
                };
            });
            const total = orderItemsCreate.reduce((s, it) => s + it.priceAtPurchase * it.quantity, 0);
            const order = await tx.order.create({
                data: {
                    userId: 'userId' in payload ? payload.userId : null,
                    status: 'status' in payload ? payload.status : 'PENDING',
                    total,
                    items: {
                        create: orderItemsCreate.map((it) => ({
                            quantity: it.quantity,
                            priceAtPurchase: it.priceAtPurchase,
                            product: { connect: { id: it.productId } },
                        })),
                    },
                },
                include: { items: true },
            });
            if ('cartId' in payload) {
                await tx.cartItem.deleteMany({ where: { cartId: payload.cartId } });
            }
            return order;
        });
    }
    async findAll() {
        return this.prisma.order.findMany({ include: { items: true } });
    }
    async findOne(id) {
        const o = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!o)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return o;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map