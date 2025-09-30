import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { CartDto } from './dto/cart-response.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapCart;
    findCartByUser(userId: string): Promise<CartDto>;
    add(userId: string, dto: AddToCartDto): Promise<CartDto>;
    update(userId: string, dto: UpdateCartItemDto): Promise<CartDto>;
    remove(userId: string, itemId: string): Promise<CartDto>;
    clear(userId: string): Promise<CartDto>;
}
