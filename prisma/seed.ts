import { PrismaClient, Gender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database (clothing only)...');

  // 🏷️ Categories
  await prisma.category.createMany({
    data: [
      { name: 'T-Shirts', slug: 't-shirts' },
      { name: 'Shirts', slug: 'shirts' },
      { name: 'Jeans', slug: 'jeans' },
      { name: 'Dresses', slug: 'dresses' },
    ],
    skipDuplicates: true,
  });

  // 🧍 Demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@shop.com' },
    update: {},
    create: {
      email: 'demo@shop.com',
      password: 'hashedpassword', // later replace with bcrypt hash
      name: 'Demo User',
      phone: '9876543210',
    },
  });

  // 👕 Products
  const tShirtCat = await prisma.category.findUnique({
    where: { slug: 't-shirts' },
  });
  const shirtCat = await prisma.category.findUnique({
    where: { slug: 'shirts' },
  });
  const jeansCat = await prisma.category.findUnique({
    where: { slug: 'jeans' },
  });
  const dressCat = await prisma.category.findUnique({
    where: { slug: 'dresses' },
  });

  const products = [
    {
      name: 'Classic White T-Shirt',
      slug: 'classic-white-tshirt',
      description: 'Soft cotton crew-neck T-shirt for daily casual wear.',
      price: 499,
      stock: 50,
      gender: Gender.UNISEX,
      categoryId: tShirtCat?.id!,
      images: ['https://picsum.photos/seed/tshirt1/600/600'],
    },
    {
      name: 'Printed Casual Shirt',
      slug: 'printed-casual-shirt',
      description: 'Slim-fit printed shirt made from breathable cotton.',
      price: 899,
      stock: 40,
      gender: Gender.MENS,
      categoryId: shirtCat?.id!,
      images: ['https://picsum.photos/seed/shirt1/600/600'],
    },
    {
      name: 'Slim Fit Blue Jeans',
      slug: 'slim-fit-blue-jeans',
      description: 'Comfortable slim-fit denim jeans with stretch fabric.',
      price: 1499,
      stock: 35,
      gender: Gender.MENS,
      categoryId: jeansCat?.id!,
      images: ['https://picsum.photos/seed/jeans1/600/600'],
    },
    {
      name: 'Floral Summer Dress',
      slug: 'floral-summer-dress',
      description: 'Lightweight floral dress ideal for summer outings.',
      price: 1299,
      stock: 45,
      gender: Gender.WOMENS,
      categoryId: dressCat?.id!,
      images: ['https://picsum.photos/seed/dress1/600/600'],
    },
  ];

  await prisma.product.createMany({ data: products, skipDuplicates: true });

  // 📏 Product Sizes for one or two products
  const tShirt = await prisma.product.findUnique({
    where: { slug: 'classic-white-tshirt' },
  });
  const jeans = await prisma.product.findUnique({
    where: { slug: 'slim-fit-blue-jeans' },
  });

  if (tShirt) {
    await prisma.productSize.createMany({
      data: [
        { productId: tShirt.id, size: 'S', quantity: 10 },
        { productId: tShirt.id, size: 'M', quantity: 15 },
        { productId: tShirt.id, size: 'L', quantity: 10 },
      ],
    });
  }

  if (jeans) {
    await prisma.productSize.createMany({
      data: [
        { productId: jeans.id, size: 'M', quantity: 10 },
        { productId: jeans.id, size: 'L', quantity: 10 },
        { productId: jeans.id, size: 'XL', quantity: 10 },
      ],
    });
  }

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
