// src/orders/orders.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderSchema } from './schemas/create-order.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

// TODO: when enabling auth, add AuthGuard and extract user from request (req.user)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create an order — either from provided items or from the user's cart (preferred)
  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  async createOrder(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id ?? body.userId;
    if (!userId)
      throw new HttpException(
        'Unauthenticated: userId required',
        HttpStatus.UNAUTHORIZED,
      );

    const order = await this.ordersService.createOrderFromPayload(userId, body);
    return {
      id: order.id,
      total: Number(order.total),
      currency: 'INR',
    };
  }
  // Get single order (user must own it or admin — auth not enforced here)
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  // List orders for the authenticated user
  @Get()
  async listOrders(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId)
      throw new HttpException(
        'Unauthenticated: userId required',
        HttpStatus.UNAUTHORIZED,
      );
    return this.ordersService.listForUser(userId);
  }

  // Cancel order (restock). In production protect this endpoint (admin or owner).
  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
