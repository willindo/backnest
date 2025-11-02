import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ Get all orders for the logged-in user
  @Get()
  async findAll(@GetUser('id') userId: string) {
    return this.ordersService.getUserOrders(userId);
  }

  // ✅ Get a single order (ownership-checked)
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.ordersService.getOrderByIdWithOwnership(id, userId);
  }

  // ✅ Create new order
  @Post()
  async create(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  // ✅ Generate invoice (only owner can view)
  @Get(':id/invoice')
  async generateInvoice(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.getInvoiceData(id, userId);
  }
}
