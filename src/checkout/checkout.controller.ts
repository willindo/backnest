import { Controller, Post, Req, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CheckoutBodySchema, CheckoutBody } from './dto/checkout.dto';
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
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(CheckoutBodySchema)) body: CheckoutBody,
  ) {
    // ✅ safe fallback for dev mode
    const userId = req.user?.id ?? 'test-user-id';
    return this.checkoutService.checkout(userId, body);
  }
}
