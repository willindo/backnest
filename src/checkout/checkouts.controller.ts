// src/checkout/checkout.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CheckoutBody, CheckoutBodySchema } from './dto/checkout.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutsService) {}

  @Post()
  async createCheckout(
    @GetUser('id') userId: string,
    @Body(new ZodValidationPipe(CheckoutBodySchema))
    body: CheckoutBody,
  ) {
    return this.checkoutService.startCheckout(userId);
  }
}
