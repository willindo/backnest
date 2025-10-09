import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CartDto } from './dto';
import { VerifiedCartResponse } from './types/verify-cart.types';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapCart;
    findCartByUser(userId: string): Promise<CartDto>;
    add(userId: string, dto: AddToCartDto): Promise<CartDto>;
    update(userId: string, dto: UpdateCartItemDto): Promise<CartDto>;
    remove(userId: string, itemId: string): Promise<CartDto>;
    clear(userId: string): Promise<CartDto>;
    verifyCart(userId: string): Promise<VerifiedCartResponse>;
}
