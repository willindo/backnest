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
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const total = await this.prisma.product.count();
    const products = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return { total, page, limit, data: products };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto as Prisma.ProductUpdateInput,
      });
    } catch {
      throw new NotFoundException(
        `Cannot update. Product with ID "${id}" not found`,
      );
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch {
      throw new NotFoundException(
        `Cannot delete. Product with ID "${id}" not found`,
      );
    }
  }
}
