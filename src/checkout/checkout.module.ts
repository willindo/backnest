// src/checkout/checkout.module.ts
import { Module } from '@nestjs/common';
// import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkouts.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { CheckoutsService } from './checkouts.service';

@Module({
  imports: [PrismaModule],
  controllers: [CheckoutController],
  providers: [CheckoutsService],
})
export class CheckoutModule {}
