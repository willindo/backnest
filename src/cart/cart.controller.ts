// File: src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { GetUser } from '../common/decorators/get-user.decorator';
// Note: The app module is already registering JwtAuthGuard and RolesGuard as global guards.
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findCart(@GetUser('id') userId: string) {
    return this.cartService.findCartByUser(userId);
  }

  @Post('add')
  async add(@GetUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.add(userId, dto as any);
  }

  @Put('update')
  async update(@GetUser('id') userId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.update(userId, dto);
  }

  @Delete('item/:itemId')
  async remove(@GetUser('id') userId: string, @Param('itemId') itemId: string) {
    return this.cartService.remove(userId, itemId);
  }

  @Delete('clear')
  async clear(@GetUser('id') userId: string) {
    return this.cartService.clear(userId);
  }

  @Get('verify')
  async verify(@GetUser('id') userId: string) {
    return this.cartService.verifyCart(userId);
  }
}
