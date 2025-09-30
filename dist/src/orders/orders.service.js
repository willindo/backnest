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
    mapOrderToDto(order) {
        var _a;
        return {
            id: order.id,
            userId: order.userId,
            total: order.total,
            status: (_a = order.status) !== null && _a !== void 0 ? _a : 'PENDING',
            items: order.items.map((item) => {
                var _a;
                return ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    name: (_a = item.product) === null || _a === void 0 ? void 0 : _a.name,
                });
            }),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
        };
    }
    async findAll() {
        const orders = await this.prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return orders.map(this.mapOrderToDto);
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        return this.mapOrderToDto(order);
    }
    async checkout(userId) {
        return this.prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findFirst({
                where: { userId },
                include: { items: { include: { product: true } } },
            });
            if (!cart || cart.items.length === 0) {
                throw new common_1.NotFoundException('Cart is empty');
            }
            const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            const order = await tx.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
                include: { items: { include: { product: true } } },
            });
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return this.mapOrderToDto(order);
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map