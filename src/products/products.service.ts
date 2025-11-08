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
import { SearchService } from 'src/search/search.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  // 🔹 Helper: Flatten for Meilisearch
  private serializeForSearch(product: any) {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      category: product.category?.name ?? null,
      categoryId: product.categoryId ?? null,
      gender: product.gender ?? null,
      sizes: product.sizes?.map((s: any) => s.size) ?? [],
      price: Number(product.price),
      stock: product.stock ?? 0,
      slug: product.slug,
      images: product.images ?? [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  // 🔹 Helper: Build ProductSize upserts
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

  // 🔹 Auto recalc total stock
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

  // 🔹 Generate unique slug
  async generateUniqueSlug(name: string): Promise<string> {
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    let base = slugify(name);
    let slug = base;
    let i = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  // 🧱 CREATE
  async create(dto: CreateProductInput): Promise<Product> {
    const { sizes, categoryId, ...rest } = dto;

    if (dto.price < 0)
      throw new BadRequestException('Price cannot be negative');

    const totalStock =
      sizes?.reduce((acc, s) => acc + (s.quantity ?? 0), 0) ?? 0;

    const product = await this.prisma.product.create({
      data: {
        ...rest,
        price: new Prisma.Decimal(dto.price),
        slug: await this.generateUniqueSlug(dto.name),
        stock: totalStock,
        images: dto.images ?? [],
        gender: dto.gender ?? null,
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(sizes?.length && {
          sizes: {
            create: sizes.map((s) => ({
              size: s.size,
              quantity: s.quantity ?? 0,
            })),
          },
        }),
      },
      include: { sizes: true, category: true },
    });

    // ✅ Add to Meilisearch
    await this.searchService
      .addProduct(product.id)
      .catch((e) => console.error('Meilisearch addProduct failed:', e.message));

    return product;
  }

  // 📦 GET ALL
  async findAll(
    search?: string,
    page = 1,
    limit = 10,
    filters?: {
      categories?: string[] | string;
      genders?: string[] | string;
      sizes?: string[] | string;
      sort?: string;
    },
  ) {
    const { categories, genders, sizes, sort } = filters || {};

    // 🔍 Search via Meilisearch
    if (search && search.trim()) {
      const index = (this.searchService as any).index; // direct index access

      const buildFilter = () => {
        const parts: string[] = [];
        const toArr = (v?: string[] | string) =>
          !v ? [] : Array.isArray(v) ? v : [v];

        const cats = toArr(categories);
        const gens = toArr(genders);
        const sizs = toArr(sizes);

        if (cats.length)
          parts.push(`category IN [${cats.map((v) => `"${v}"`).join(', ')}]`);
        if (gens.length)
          parts.push(`gender IN [${gens.map((v) => `"${v}"`).join(', ')}]`);
        if (sizs.length)
          parts.push(`sizes IN [${sizs.map((v) => `"${v}"`).join(', ')}]`);

        return parts.length ? parts.join(' AND ') : undefined;
      };

      const res = await index.search(search, {
        limit,
        offset: (page - 1) * limit,
        filter: buildFilter(),
        sort: sort
          ? [
              sort === 'price-asc'
                ? 'price:asc'
                : sort === 'price-desc'
                  ? 'price:desc'
                  : 'createdAt:desc',
            ]
          : undefined,
      });

      return {
        total: res.estimatedTotalHits,
        page,
        limit,
        totalPages: Math.ceil(res.estimatedTotalHits / limit),
        data: res.hits,
      };
    }

    // 🧩 Fallback: Prisma
    const toArr = (v?: string[] | string) =>
      !v ? [] : Array.isArray(v) ? v : [v];

    const where: Prisma.ProductWhereInput = {
      ...(categories && {
        category: { name: { in: toArr(categories) } },
      }),
      ...(genders && { gender: { in: toArr(genders) as Gender[] } }),
      ...(sizes && {
        sizes: { some: { size: { in: toArr(sizes) as Size[] } } },
      }),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
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
    }

    const total = await this.prisma.product.count({ where });
    const data = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { sizes: true, category: true },
      orderBy,
      where,
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  // 🔍 FIND ONE
  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true, category: true },
    });
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);
    return product;
  }

  // ✏️ UPDATE
  async update(id: string, dto: UpdateProductInput): Promise<Product> {
    const { sizes, ...rest } = dto;

    if (rest.price && rest.price < 0)
      throw new BadRequestException('Price cannot be negative');

    const totalStock = sizes?.reduce((a, s) => a + (s.quantity ?? 0), 0);

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        stock: totalStock ?? undefined,
        gender: rest.gender ?? null,
        sizes: sizes?.length
          ? { upsert: this.buildSizeUpserts(id, sizes) }
          : undefined,
      },
      include: { sizes: true, category: true },
    });

    await this.searchService
      .updateProduct(id)
      .catch((e) =>
        console.error('Meilisearch updateProduct failed:', e.message),
      );

    return updated;
  }

  // 🗑️ REMOVE
  async remove(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { sizes: true },
    });
    if (!product)
      throw new NotFoundException(`Product with ID "${id}" not found`);

    await this.prisma.productSize.deleteMany({ where: { productId: id } });
    const deleted = await this.prisma.product.delete({
      where: { id },
      include: { sizes: true },
    });

    await this.searchService
      .removeProduct(id)
      .catch((e) =>
        console.error('Meilisearch removeProduct failed:', e.message),
      );

    return deleted;
  }
}
