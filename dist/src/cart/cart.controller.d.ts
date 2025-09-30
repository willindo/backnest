import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { CartDto } from './dto/cart-response.dto';
import { Request } from 'express';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    private getUserId;
    findCart(req: Request): Promise<CartDto>;
    add(req: Request, dto: AddToCartDto): Promise<CartDto>;
    update(req: Request, itemId: string, dto: UpdateCartItemDto): Promise<CartDto>;
    remove(req: Request, itemId: string): Promise<CartDto>;
    clear(req: Request): Promise<CartDto>;
}
