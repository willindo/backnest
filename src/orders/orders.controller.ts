import { Controller, Get, Post, Param, Req, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express'; // import Express types

// Optional: type your user
interface AuthRequest extends Request {
  user: { id: string };
}

@Controller('orders') // matches frontend
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // GET /orders
  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll();
  }

  // GET /orders/:id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  // POST /orders
  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateOrderDto, // optional shippingAddress
  ): Promise<OrderResponseDto> {
    const userId = req.user.id;
    // For now, shippingAddress can be ignored or passed to service later
    return this.ordersService.checkout(userId);
  }
}
