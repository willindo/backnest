// src/checkout/checkout.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

GetUser;
@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  async createCheckout(@GetUser('id') userId: string) {
    return this.checkoutService.processCheckout(userId);
  }
}
