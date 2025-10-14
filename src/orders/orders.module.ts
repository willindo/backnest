// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
