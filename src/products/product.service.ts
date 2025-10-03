// src/products/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async findAll(page = 0, limit = 10) {
    const total = await this.prisma.product.count();
    const data = await this.prisma.product.findMany({
      skip: page * limit,
      take: limit,
    });
    return { data, total };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(
        `Cannot update. Product with ID "${id}" not found`,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch {
      throw new NotFoundException(
        `Cannot delete. Product with ID "${id}" not found`,
      );
    }
  }
}
