import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './product.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
