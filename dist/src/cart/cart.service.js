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
const cart_mapper_1 = require("./utils/cart-mapper");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateCartTx(tx, userId) {
        let cart = await tx.cart.findFirst({ where: { userId } });
        if (!cart)
            cart = await tx.cart.create({ data: { userId } });
        return cart;
    }
    async findCartByUser(userId) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        const dto = (0, cart_mapper_1.mapCart)(cart);
        if (!dto)
            throw new common_1.NotFoundException('Cart not found');
        return dto;
    }
    async add(userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            var _a, _b, _c;
            const cart = await this.getOrCreateCartTx(tx, userId);
            const product = await tx.product.findUnique({
                where: { id: dto.productId },
                include: { sizes: true },
            });
            if (!product)
                throw new common_1.NotFoundException('Product not found');
            const sizeValue = (_a = dto.size) !== null && _a !== void 0 ? _a : null;
            let stock = product.stock;
            if (sizeValue) {
                const sizeRecord = await tx.productSize.findUnique({
                    where: {
                        productId_size: {
                            productId: dto.productId,
                            size: sizeValue,
                        },
                    },
                });
                if (!sizeRecord)
                    throw new common_1.BadRequestException(`Size ${sizeValue} not found`);
                stock = sizeRecord.quantity;
            }
            if (stock < dto.quantity)
                throw new common_1.BadRequestException(`Only ${stock} items left in stock`);
            const existingItem = await tx.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    productId: dto.productId,
                    size: sizeValue,
                },
            });
            if (existingItem) {
                await tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: { increment: dto.quantity },
                        productName: product.name,
                        productPrice: product.price,
                        productDescription: product.description,
                        productImage: (_b = product.images[0]) !== null && _b !== void 0 ? _b : null,
                    },
                });
            }
            else {
                await tx.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: dto.productId,
                        size: sizeValue,
                        quantity: dto.quantity,
                        productName: product.name,
                        productPrice: product.price,
                        productDescription: product.description,
                        productImage: (_c = product.images[0]) !== null && _c !== void 0 ? _c : null,
                    },
                });
            }
            const updated = await tx.cart.findUnique({
                where: { id: cart.id },
                include: { items: { include: { product: true } } },
            });
            return (0, cart_mapper_1.mapCart)(updated);
        });
    }
    async update(userId, dto) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: { items: true },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = cart.items.find((i) => i.id === dto.itemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found in cart');
        const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            include: { sizes: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        let stock = product.stock;
        if (item.size) {
            const sizeRecord = await this.prisma.productSize.findUnique({
                where: {
                    productId_size: { productId: item.productId, size: item.size },
                },
            });
            if (!sizeRecord)
                throw new common_1.BadRequestException(`Size ${item.size} not found`);
            stock = sizeRecord.quantity;
        }
        if (dto.quantity > stock)
            throw new common_1.BadRequestException(`Only ${stock} left in stock`);
        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: dto.quantity },
        });
        return this.findCartByUser(userId);
    }
    async remove(userId, itemId) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: { items: true },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = cart.items.find((i) => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found in cart');
        await this.prisma.cartItem.delete({ where: { id: item.id } });
        return this.findCartByUser(userId);
    }
    async clear(userId) {
        const cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        return { message: 'Cart cleared successfully' };
    }
    async verifyCart(userId) {
        var _a, _b, _c, _d;
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: {
                items: { include: { product: { include: { sizes: true } } } },
            },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const verifiedItems = [];
        const invalidItems = [];
        let subtotal = 0;
        let totalQuantity = 0;
        for (const item of cart.items) {
            const product = item.product;
            if (!product) {
                invalidItems.push({ id: item.id, reason: 'Product not found' });
                continue;
            }
            let price = Number(product.price);
            let availableStock = product.stock;
            let reason;
            if (item.size) {
                const sizeRecord = product.sizes.find((s) => s.size === item.size);
                if (!sizeRecord) {
                    reason = `Size ${item.size} unavailable`;
                }
                else if (sizeRecord.quantity < item.quantity) {
                    reason = `Only ${sizeRecord.quantity} left in stock`;
                }
                availableStock = (_a = sizeRecord === null || sizeRecord === void 0 ? void 0 : sizeRecord.quantity) !== null && _a !== void 0 ? _a : 0;
            }
            else if (product.stock < item.quantity) {
                reason = `Only ${product.stock} left in stock`;
                availableStock = product.stock;
            }
            const isValid = !reason;
            const subtotalItem = Number(price) * item.quantity;
            verifiedItems.push({
                id: item.id,
                productId: item.productId,
                productName: (_b = item.productName) !== null && _b !== void 0 ? _b : product.name,
                productImage: (_d = (_c = item.productImage) !== null && _c !== void 0 ? _c : product.images[0]) !== null && _d !== void 0 ? _d : null,
                price: price,
                quantity: item.quantity,
                subtotal: subtotalItem,
                reason,
            });
            if (isValid) {
                subtotal += subtotalItem;
                totalQuantity += item.quantity;
            }
            else {
                invalidItems.push({ id: item.id, reason: reason });
            }
        }
        return {
            cartId: cart.id,
            userId,
            items: verifiedItems,
            subtotal,
            totalQuantity,
            invalidItems,
            isValid: invalidItems.length === 0,
            verifiedAt: new Date(),
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map