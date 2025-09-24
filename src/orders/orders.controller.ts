import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CreateOrderDto } from './dto';

@Controller('order')
export class OrdersController {
  @Get()
  findAll() {
    return 'Get all orders';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `Get order ${id}`;
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return `Create order for user ${dto.userId} with ${dto.items.length} items`;
  }
}
