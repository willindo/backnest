import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /** Get current user's cart */
  @Get()
  async findCart(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.findCartByUser(userId);
  }

  /** Add item to cart */
  @Post('add')
  async add(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = req.user.id;
    return this.cartService.add(userId, dto);
  }

  /** Update cart item */
  @Put('update')
  async update(@Req() req: any, @Body() dto: UpdateCartItemDto) {
    const userId = req.user.id;
    return this.cartService.update(userId, dto);
  }

  /** Remove cart item */
  @Delete('item/:itemId')
  async remove(@Req() req: any, @Param('itemId') itemId: string) {
    const userId = req.user.id;
    return this.cartService.remove(userId, itemId);
  }

  /** Clear entire cart */
  @Delete('clear')
  async clear(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.clear(userId);
  }

  /** Verify cart (stock & removed products) */
  @Get('verify')
  async verify(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.verifyCart(userId);
  }
}
