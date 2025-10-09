import { Controller, Post, UseGuards, Req, Body, Param } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CheckoutBodySchema } from './dto/checkout.dto';
import { Request } from 'express'; // ✅ import type

// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // enable later if needed

interface AuthenticatedRequest extends Request {
  user?: { id: string }; // ✅ minimal user type
}

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  async checkout(
    @Req() req: AuthenticatedRequest, // ✅ now properly typed
    @Body(new ZodValidationPipe(CheckoutBodySchema)) body: any,
  ) {
    const userId = req.user?.id ?? 'test-user-id'; // fallback if guard disabled
    return this.checkoutService.checkout(userId, body);
  }
  @Post(':userId/verify')
  async verify(@Param('userId') userId: string) {
    return this.checkoutService.verifyCart(userId);
  }
}
