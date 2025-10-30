import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Product, Size } from '@prisma/client';
import {
  CreateProductInput,
  UpdateProductInput,
} from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // 🧩 Helper for ProductSize upserts
  private buildSizeUpserts(
    productId: string,
    sizes: { size: Size; quantity: number }[],
  ) {
    return sizes.map((s) => ({
      where: { productId_size: { productId, size: s.size } },
      update: { quantity: s.quantity ?? 0 },
      create: { size: s.size, quantity: s.quantity ?? 0 },
    }));
  }

  // 🏗️ Create Product
  async create(dto: CreateProductInput): Promise<Product> {
    const { sizes, ...rest } = dto;

    if (dto.price < 0)
      throw new BadRequestException('Price cannot be negative');
    if (dto.stock && dto.stock < 0)
      throw new BadRequestException('Stock cannot be negative');

    return this.prisma.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(dto.price),
        stock: dto.stock ?? 0,
        images: dto.images ?? [],
        gender: dto.gender ?? null,
        sizes: sizes?.length
          ? {
              create: sizes.map((s) => ({
                size: s.size,
                quantity: s.quantity ?? 0,
              })),
            }
          : undefined,
      },
      include: { sizes: true },
    });
  }

  // 📦 Get All Products (Paginated)
  async findAll(page = 1, limit = 10) {
    const total = await this.prisma.product.count();
    const totalPages = Math.ceil(total / limit);

    const data = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { sizes: true },
      orderBy: { createdAt: 'desc' },
    });

    return { total, page, limit, totalPages, data };
  }

  // 🔍 Get One Product
  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true },
    });
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  // ✏️ Update Product
  async update(id: string, dto: UpdateProductInput): Promise<Product> {
    const { sizes, ...rest } = dto;

    if (rest.price && rest.price < 0)
      throw new BadRequestException('Price cannot be negative');
    if (rest.stock && rest.stock < 0)
      throw new BadRequestException('Stock cannot be negative');

    try {
      await this.prisma.product.findUniqueOrThrow({ where: { id } });

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...rest,
          gender: rest.gender ?? null,
          sizes: sizes?.length
            ? { upsert: this.buildSizeUpserts(id, sizes) }
            : undefined,
        },
        include: { sizes: true },
      });
    } catch (err: any) {
      if (err.code === 'P2025')
        throw new NotFoundException(`Product with ID "${id}" not found`);
      console.error(err);
      throw err;
    }
  }

  // 🗑️ Delete Product
  async remove(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true },
    });
    if (!product)
      throw new NotFoundException(
        `Cannot delete. Product with ID "${id}" not found`,
      );

    await this.prisma.productSize.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({
      where: { id },
      include: { sizes: true },
    });
  }
}
