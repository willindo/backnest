import { PrismaService } from '.././prisma/prisma.service';
import { SearchService } from '../src/search/search.service';

(async () => {
  const prisma = new PrismaService();
  const search = new SearchService(prisma);

  console.log('\n🧹 Clearing old index...');
  try {
    await search['client'].deleteIndex('products');
  } catch {
    console.log('ℹ️ No old index found, skipping delete.');
  }

  console.log('⚙️ Recreating index...');
  await search.onModuleInit();

  console.log('🔁 Reindexing products...');
  await search.reindexAllProducts();

  console.log('✅ Done!');
  process.exit(0);
})();
