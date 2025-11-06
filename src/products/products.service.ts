import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Product, Size, Gender } from '@prisma/client';
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

  async recalculateProductStock(productId: string, tx = this.prisma) {
    const total = await tx.productSize.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    const totalStock = total._sum.quantity ?? 0;
    await tx.product.update({
      where: { id: productId },
      data: { stock: totalStock },
    });

    return totalStock;
  }

  async generateUniqueSlug(name: string): Promise<string> {
    function slugify(name: string): string {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace spaces/special chars with '-'
        .replace(/^-+|-+$/g, ''); // Trim hyphens
    }
    let base = slugify(name);
    let slug = base;
    let counter = 1;

    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  // 🏗️ Create Product
  async create(dto: CreateProductInput): Promise<Product> {
    const { sizes, categoryId, ...rest } = dto;

    if (dto.price < 0)
      throw new BadRequestException('Price cannot be negative');

    const totalStock =
      sizes?.reduce((acc, s) => acc + (s.quantity ?? 0), 0) ?? 0;
    return this.prisma.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(dto.price),
        slug: await this.generateUniqueSlug(dto.name),
        stock: totalStock,
        images: dto.images ?? [],
        gender: dto.gender ?? null,
        // ✅ use connect if categoryId provided
        category: categoryId ? { connect: { id: categoryId } } : undefined,
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

  // 📦 Get All Products (Paginated + Filtered + Sorted)
  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      categories?: string[] | string;
      genders?: string[] | string;
      sizes?: string[] | string;
      sort?: string;
    },
  ) {
    let { categories, genders, sizes, sort } = filters || {};

    // 🧩 Normalize to arrays
    const toArray = (v?: string[] | string) =>
      !v ? [] : Array.isArray(v) ? v : v.split(',').map((x) => x.trim());

    const categoriesArr = toArray(categories);
    const gendersArr = toArray(genders);
    const sizesArr = toArray(sizes);

    // enum safety
    const genderValues = Object.values(Gender);
    const sizeValues = Object.values(Size);

    // 🧱 Build dynamic WHERE clause
    const where: Prisma.ProductWhereInput = {
      ...(categoriesArr.length && {
        category: {
          name: { in: categoriesArr },
        },
      }),
      ...(gendersArr.length && {
        gender: {
          in: gendersArr.filter((g) =>
            genderValues.includes(g as Gender),
          ) as Gender[],
        },
      }),
      ...(sizesArr.length && {
        sizes: {
          some: {
            size: {
              in: sizesArr.filter((s) =>
                sizeValues.includes(s as Size),
              ) as Size[],
            },
          },
        },
      }),
    };

    // 🧭 Sorting Logic
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // default

    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    // 🧮 Total count + paginated query
    const total = await this.prisma.product.count({ where });
    const totalPages = Math.ceil(total / limit);

    const data = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { sizes: true, category: true },
      orderBy,
      where,
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

    const totalStock = sizes?.reduce((acc, s) => acc + (s.quantity ?? 0), 0);
    try {
      await this.prisma.product.findUniqueOrThrow({ where: { id } });

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...rest,
          stock: totalStock ?? undefined,
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
