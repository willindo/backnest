// src/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Create a new product
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          // 🔹 auto-generate slug if missing
          slug: dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-'),
          description: dto.description ?? undefined,
          price: dto.price,
          currency: dto.currency ?? 'INR', // 🔹 fallback to default
          stock: dto.stock ?? 0,
          images: dto.images ?? [],
          sku: dto.sku ?? undefined,
        },
      });
      return new ProductResponseDto(this.mapToResponse(product));
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product slug or SKU already exists');
      }
      throw error;
    }
  }

  // 🔹 Get all products with optional pagination
  async findAll(
    skip = 0,
    take = 20,
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    const data = products.map(
      (p) => new ProductResponseDto(this.mapToResponse(p)),
    );
    return { data, total };
  }

  // 🔹 Get a single product by ID
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    return new ProductResponseDto(this.mapToResponse(product));
  }

  // 🔹 Update a product
  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...dto,
          description: dto.description ?? undefined,
          currency: dto.currency ?? undefined,
          stock: dto.stock ?? undefined,
          images: dto.images ?? undefined,
          sku: dto.sku ?? undefined,
        },
      });

      return new ProductResponseDto(this.mapToResponse(product));
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Product slug or SKU already exists');
      }
      throw error;
    }
  }

  // 🔹 Delete a product
  async remove(id: string): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.delete({ where: { id } });
      return new ProductResponseDto(this.mapToResponse(product));
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      throw error;
    }
  }

  // ✅ Map Prisma Product to response DTO object
  private mapToResponse(product: Product) {
    return {
      ...product,
      description: product.description ?? undefined,
      currency: product.currency ?? undefined,
      images: product.images ?? [],
      sku: product.sku ?? undefined, // 🔹 Fix null → undefined
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
