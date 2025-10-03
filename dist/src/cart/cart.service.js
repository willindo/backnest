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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapCart(cart) {
        return {
            id: cart.id,
            userId: cart.userId,
            items: (cart.items || []).map((item) => ({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                product: item.product
                    ? {
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        description: item.product.description,
                    }
                    : undefined,
            })),
            createdAt: cart.createdAt.toISOString(),
            updatedAt: cart.updatedAt.toISOString(),
        };
    }
    async findCartByUser(userId) {
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!userExists)
            throw new common_1.NotFoundException(`User ${userId} does not exist`);
        let cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } },
            });
        }
        return this.mapCart(cart);
    }
    async add(userId, dto) {
        let cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            cart = await this.prisma.cart.create({ data: { userId } });
        await this.prisma.cartItem.upsert({
            where: {
                cartId_productId: { cartId: cart.id, productId: dto.productId },
            },
            update: { quantity: { increment: dto.quantity } },
            create: {
                cartId: cart.id,
                productId: dto.productId,
                quantity: dto.quantity,
            },
        });
        return this.findCartByUser(userId);
    }
    async update(userId, dto) {
        const cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = await this.prisma.cartItem.findUnique({
            where: { id: dto.itemId },
        });
        if (!item || item.cartId !== cart.id) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.update({
            where: { id: dto.itemId },
            data: { quantity: dto.quantity },
        });
        return this.findCartByUser(userId);
    }
    async remove(userId, itemId) {
        const cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
        });
        if (!item || item.cartId !== cart.id) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.delete({ where: { id: itemId } });
        return this.findCartByUser(userId);
    }
    async clear(userId) {
        const cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return this.findCartByUser(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map