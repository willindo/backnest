import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  async findCart(@Param('userId') userId: string) {
    return this.cartService.findCartByUser(userId);
  }

  @Post(':userId/add')
  async add(@Param('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.add(userId, dto);
  }

  @Put(':userId/update')
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.update(userId, dto);
  }

  @Delete(':userId/item/:itemId')
  async remove(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.remove(userId, itemId);
  }

  @Delete(':userId/clear')
  async clear(@Param('userId') userId: string) {
    return this.cartService.clear(userId);
  }
}
