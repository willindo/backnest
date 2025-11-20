import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MeiliSearch, Index } from 'meilisearch';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexName = 'products';
  private client: MeiliSearch;
  private index!: Index;

  constructor(private readonly prisma: PrismaService) {
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
    });
  }

  // 🕒 Universal fallback poller for task completion
  private async waitForTaskCompletion(
    indexUid: string,
    taskUid: number,
    intervalMs = 200,
  ): Promise<void> {
    const index = this.client.index(indexUid) as any;

    const hasTaskApi =
      typeof (this.client as any).getTask === 'function' ||
      typeof index.getTask === 'function';

    if (!hasTaskApi) {
      this.logger.warn('⚠️ Meilisearch SDK has no task API — skipping wait.');
      return;
    }

    while (true) {
      let task: any;

      try {
        task =
          typeof index.getTask === 'function'
            ? await index.getTask(taskUid)
            : await (this.client as any).getTask(taskUid);
      } catch {
        this.logger.warn('⚠️ Could not get task status — continuing.');
        return;
      }

      if (task?.status === 'succeeded') return;
      if (task?.status === 'failed')
        throw new Error(
          `Meilisearch task failed: ${task?.error?.message ?? 'Unknown error'}`,
        );

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  async onModuleInit() {
    this.logger.log('🚀 Initializing Meilisearch index...');

    const index = this.client.index(this.indexName);
    let exists = true;
    // 🧠 Optional consistency check
    // const count = await this.index
    //   .getStats()
    //   .then((s) => s.numberOfDocuments)
    //   .catch(() => 0);
    // if (count === 0) {
    //   this.logger.warn(
    //     '⚠️ Meilisearch index empty — auto-reindexing all products...',
    //   );
    //   await this.reindexAllProducts();
    // }
    try {
      await index.getRawInfo();
      this.logger.log(`✅ Index '${this.indexName}' already exists.`);
    } catch (e: any) {
      exists = false;
      this.logger.warn(`⚙️ Index '${this.indexName}' not found. Creating...`);
    }

    if (!exists) {
      const task = await this.client.createIndex(this.indexName, {
        primaryKey: 'id',
      });
      await this.waitForTaskCompletion(this.indexName, task.taskUid);
    }

    // Now it's guaranteed to exist
    const readyIndex = this.client.index(this.indexName);

    const settingsTask = await readyIndex.updateSettings({
      searchableAttributes: [
        'name',
        'description',
        'category',
        'gender',
        'sizes.size',
      ],
      displayedAttributes: [
        'id',
        'name',
        'description',
        'slug',
        'category',
        'categoryId',
        'gender',
        'sizes',
        'price',
        'stock',
        'images',
        'createdAt',
        'updatedAt',
      ],
      filterableAttributes: [
        'category',
        'gender',
        'sizes.size',
        'price',
        'stock',
        'createdAt',
      ],
      sortableAttributes: ['createdAt', 'price', 'stock'],
    });

    await this.waitForTaskCompletion(this.indexName, settingsTask.taskUid);

    this.index = readyIndex;
    this.logger.log(`🔧 Index '${this.indexName}' initialized and ready.`);
  }

  // 🧩 Serializer — mirror of ProductsService.serializeForSearch
  private serializeForSearch(product: any) {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      slug: product.slug,
      category: product.category?.name ?? null,
      categoryId: product.categoryId ?? null,
      gender: product.gender ?? null,
      sizes: product.sizes?.map((s: any) => ({ size: s.size })) ?? [],
      price: Number(product.price),
      stock: product.stock ?? 0,
      images: product.images ?? [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  // 🔁 Full reindex — used for maintenance / seeding
  async reindexAllProducts() {
    this.logger.log('♻️ Reindexing all products...');
    const products = await this.prisma.product.findMany({
      include: { category: true, sizes: true },
    });

    const docs = products.map((p) => this.serializeForSearch(p));

    await this.index.deleteAllDocuments();
    if (docs.length) await this.index.addDocuments(docs);

    this.logger.log(`✅ Reindexed ${docs.length} products`);
  }

  // ➕ Add single product (safe)
  async addProduct(productId: string) {
    try {
      const p = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true, sizes: true },
      });
      if (!p) return;
      await this.index.addDocuments([this.serializeForSearch(p)]);
      this.logger.log(`🔹 Indexed new product: ${p.name}`);
    } catch (e: any) {
      this.logger.warn(`⚠️ addProduct failed for ${productId}: ${e.message}`);
    }
  }

  // 🌀 Update product in index (safe)
  async updateProduct(productId: string) {
    try {
      const p = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true, sizes: true },
      });
      if (!p) return;
      await this.index.updateDocuments([this.serializeForSearch(p)]);
      this.logger.log(`🌀 Updated product index: ${p.name}`);
    } catch (e: any) {
      this.logger.warn(
        `⚠️ updateProduct failed for ${productId}: ${e.message}`,
      );
    }
  }

  // ❌ Remove from index (safe)
  async removeProduct(id: string) {
    try {
      await this.index.deleteDocument(id);
      this.logger.log(`🗑️ Removed product from Meilisearch: ${id}`);
    } catch (e: any) {
      this.logger.warn(`⚠️ removeProduct failed for ${id}: ${e.message}`);
    }
  }

  // 🔍 Manual test search
  async searchProducts(query: string, options?: Record<string, any>) {
    return await this.index.search(query, options);
  }
}
