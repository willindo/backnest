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
    findAll() {
        return this.prisma.order.findMany({
            include: { items: { include: { product: true } } },
        });
    }
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } },
        });
    }
    async checkout(userId) {
        return this.prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findFirst({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            if (!cart || cart.items.length === 0) {
                throw new Error('Cart is empty');
            }
            const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            const order = await tx.order.create({
                data: {
                    userId,
                    total,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
                include: {
                    items: { include: { product: true } },
                },
            });
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return order;
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map