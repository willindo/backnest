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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const product_response_dto_1 = require("./dto/product-response.dto");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        var _a, _b, _c, _d, _e;
        try {
            const product = await this.prisma.product.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    description: (_a = dto.description) !== null && _a !== void 0 ? _a : undefined,
                    price: dto.price,
                    currency: (_b = dto.currency) !== null && _b !== void 0 ? _b : undefined,
                    stock: (_c = dto.stock) !== null && _c !== void 0 ? _c : undefined,
                    images: (_d = dto.images) !== null && _d !== void 0 ? _d : [],
                    sku: (_e = dto.sku) !== null && _e !== void 0 ? _e : undefined,
                },
            });
            return new product_response_dto_1.ProductResponseDto(this.mapToResponse(product));
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Product slug or SKU already exists');
            }
            throw error;
        }
    }
    async findAll(skip = 0, take = 20) {
        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count(),
        ]);
        const data = products.map((p) => new product_response_dto_1.ProductResponseDto(this.mapToResponse(p)));
        return { data, total };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException(`Product with id ${id} not found`);
        return new product_response_dto_1.ProductResponseDto(this.mapToResponse(product));
    }
    async update(id, dto) {
        var _a, _b, _c, _d, _e;
        try {
            const product = await this.prisma.product.update({
                where: { id },
                data: Object.assign(Object.assign({}, dto), { description: (_a = dto.description) !== null && _a !== void 0 ? _a : undefined, currency: (_b = dto.currency) !== null && _b !== void 0 ? _b : undefined, stock: (_c = dto.stock) !== null && _c !== void 0 ? _c : undefined, images: (_d = dto.images) !== null && _d !== void 0 ? _d : undefined, sku: (_e = dto.sku) !== null && _e !== void 0 ? _e : undefined }),
            });
            return new product_response_dto_1.ProductResponseDto(this.mapToResponse(product));
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Product slug or SKU already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const product = await this.prisma.product.delete({ where: { id } });
            return new product_response_dto_1.ProductResponseDto(this.mapToResponse(product));
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Product with id ${id} not found`);
            }
            throw error;
        }
    }
    mapToResponse(product) {
        var _a, _b, _c, _d;
        return Object.assign(Object.assign({}, product), { description: (_a = product.description) !== null && _a !== void 0 ? _a : undefined, currency: (_b = product.currency) !== null && _b !== void 0 ? _b : undefined, images: (_c = product.images) !== null && _c !== void 0 ? _c : [], sku: (_d = product.sku) !== null && _d !== void 0 ? _d : undefined, createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString() });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map