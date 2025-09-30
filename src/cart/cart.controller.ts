// src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { CartDto } from './dto/cart-response.dto';
import { Request } from 'express';

// interface AuthRequest extends Request {
//   user: { id: string };
// }

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  private getUserId(headers: Record<string, any>): string {
    const userId = headers['x-user-id'];
    if (!userId) throw new Error('Missing X-User-Id header');
    return userId;
  }

  @Get()
  async findCart(@Req() req: Request): Promise<CartDto> {
    const userId = this.getUserId(req.headers);
    return this.cartService.findCartByUser(userId);
  }

  @Post('add')
  async add(@Req() req: Request, @Body() dto: AddToCartDto): Promise<CartDto> {
    const userId = this.getUserId(req.headers);
    return this.cartService.add(userId, dto);
  }

  @Put('item/:itemId')
  async update(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartDto> {
    const userId = this.getUserId(req.headers);
    // ❌ dto.productId = itemId; // wrong
    return this.cartService.update(userId, { ...dto, itemId }); // pass correct IDs
  }

  @Delete('item/:itemId')
  async remove(
    @Req() req: Request,
    @Param('itemId') itemId: string,
  ): Promise<CartDto> {
    const userId = this.getUserId(req.headers);
    return this.cartService.remove(userId, itemId);
  }

  @Post('clear')
  async clear(@Req() req: Request): Promise<CartDto> {
    const userId = this.getUserId(req.headers);
    return this.cartService.clear(userId);
  }
}
