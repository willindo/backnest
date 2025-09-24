import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto';

@Controller('cart')
export class CartController {
  @Get()
  findAll() {
    return 'Get cart items';
  }

  @Post()
  add(@Body() dto: AddToCartDto) {
    return `Add product ${dto.productId} (qty: ${dto.quantity})`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return `Update cart item ${id}`;
  }

  @Delete()
  remove(@Body() dto: RemoveFromCartDto) {
    return `Remove product ${dto.productId} from cart`;
  }
}
