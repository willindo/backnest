import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Product, Role } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<Product> {
    return await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock ?? 0,
        images: dto.images ?? [],
        categoryId: dto.categoryId,
        gender: dto.gender,
        sizes: dto.sizes?.length
          ? {
              create: dto.sizes.map((s) => ({
                size: s.size,
                quantity: s.quantity,
              })),
            }
          : {
              create: [
                { size: 'XS', quantity: 0 },
                { size: 'S', quantity: 0 },
                { size: 'M', quantity: 0 },
                { size: 'L', quantity: 0 },
                { size: 'XL', quantity: 0 },
                { size: 'XXL', quantity: 0 },
              ],
            },
      },
      include: { sizes: true },
    });
  }

  async findAll(page = 1, limit = 10) {
    const total = await this.prisma.product.count();
    const products = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { sizes: true },
      orderBy: { createdAt: 'desc' },
    });
    return { total, page, limit, data: products };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true },
    });
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      const { sizes, ...rest } = dto;

      // Optional: validate existence first
      await this.prisma.product.findUniqueOrThrow({ where: { id } });

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...rest,
          sizes: sizes?.length
            ? {
                upsert: sizes.map((s) => ({
                  where: {
                    productId_size: {
                      productId: id,
                      size: s.size as any, // Prisma enum type
                    },
                  },
                  update: {
                    quantity: s.quantity ?? 0,
                  },
                  create: {
                    size: s.size as any,
                    quantity: s.quantity ?? 0,
                  },
                })),
              }
            : undefined,
        },
        include: { sizes: true },
      });
    } catch (err) {
      console.error(err);
      throw new NotFoundException(
        `Cannot update. Product with ID "${id}" not found`,
      );
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      return await this.prisma.product.delete({
        where: { id },
        include: { sizes: true },
      });
    } catch {
      throw new NotFoundException(
        `Cannot delete. Product with ID "${id}" not found`,
      );
    }
  }
}
