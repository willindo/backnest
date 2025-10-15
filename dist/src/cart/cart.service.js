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
            createdAt: cart.createdAt.toISOString(),
            updatedAt: cart.updatedAt.toISOString(),
            items: cart.items.map((item) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                return ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    product: {
                        name: (_c = (_a = item.productName) !== null && _a !== void 0 ? _a : (_b = item.product) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Unknown Product',
                        price: Number((_f = (_d = item.productPrice) !== null && _d !== void 0 ? _d : (_e = item.product) === null || _e === void 0 ? void 0 : _e.price) !== null && _f !== void 0 ? _f : 0),
                        description: (_j = (_g = item.productDescription) !== null && _g !== void 0 ? _g : (_h = item.product) === null || _h === void 0 ? void 0 : _h.description) !== null && _j !== void 0 ? _j : null,
                        image: (_o = (_k = item.productImage) !== null && _k !== void 0 ? _k : (_m = (_l = item.product) === null || _l === void 0 ? void 0 : _l.images) === null || _m === void 0 ? void 0 : _m[0]) !== null && _o !== void 0 ? _o : null,
                    },
                });
            }),
        };
    }
    async findCartByUser(userId) {
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
        var _a, _b, _c;
        let cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            cart = await this.prisma.cart.create({ data: { userId } });
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const sizeValue = (_a = dto.size) !== null && _a !== void 0 ? _a : null;
        if (sizeValue) {
            await this.prisma.cartItem.upsert({
                where: {
                    cartId_productId_size: {
                        cartId: cart.id,
                        productId: dto.productId,
                        size: sizeValue,
                    },
                },
                update: { quantity: { increment: dto.quantity } },
                create: {
                    cartId: cart.id,
                    productId: dto.productId,
                    size: sizeValue,
                    quantity: dto.quantity,
                    productName: product.name,
                    productPrice: product.price,
                    productDescription: product.description,
                    productImage: (_b = product.images[0]) !== null && _b !== void 0 ? _b : null,
                },
            });
        }
        else {
            const existing = await this.prisma.cartItem.findFirst({
                where: { cartId: cart.id, productId: dto.productId, size: null },
            });
            if (existing) {
                await this.prisma.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: { increment: dto.quantity } },
                });
            }
            else {
                await this.prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: dto.productId,
                        size: null,
                        quantity: dto.quantity,
                        productName: product.name,
                        productPrice: product.price,
                        productDescription: product.description,
                        productImage: (_c = product.images[0]) !== null && _c !== void 0 ? _c : null,
                    },
                });
            }
        }
        return this.findCartByUser(userId);
    }
    async update(userId, dto) {
        const cart = await this.prisma.cart.findFirst({ where: { userId } });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = await this.prisma.cartItem.findUnique({
            where: { id: dto.itemId },
        });
        if (!item || item.cartId !== cart.id)
            throw new common_1.NotFoundException('Cart item not found');
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
        if (!item || item.cartId !== cart.id)
            throw new common_1.NotFoundException('Cart item not found');
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
    async verifyCart(userId) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const invalidItems = [];
        const items = cart.items.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const priceNum = Number((_c = (_a = item.productPrice) !== null && _a !== void 0 ? _a : (_b = item.product) === null || _b === void 0 ? void 0 : _b.price) !== null && _c !== void 0 ? _c : 0);
            const subtotal = priceNum * item.quantity;
            let reason;
            if (!item.product)
                reason = 'Product removed';
            else if (item.quantity > item.product.stock)
                reason = `Only ${item.product.stock} left in stock`;
            if (reason)
                invalidItems.push({ id: item.id, reason });
            return {
                id: item.id,
                productId: item.productId,
                productName: (_f = (_d = item.productName) !== null && _d !== void 0 ? _d : (_e = item.product) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : 'Unknown Product',
                productImage: (_k = (_g = item.productImage) !== null && _g !== void 0 ? _g : (_j = (_h = item.product) === null || _h === void 0 ? void 0 : _h.images) === null || _j === void 0 ? void 0 : _j[0]) !== null && _k !== void 0 ? _k : null,
                price: priceNum,
                quantity: item.quantity,
                subtotal,
                reason,
            };
        });
        const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
        const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
        return {
            cartId: cart.id,
            userId: cart.userId,
            items,
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