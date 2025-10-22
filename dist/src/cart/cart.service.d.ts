import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { VerifiedCartResponse } from './types/verify-cart.types';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    private getOrCreateCartTx;
    findCartByUser(userId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            productId: string;
            quantity: number;
            product: {
                name: string;
                price: number;
                description?: string | null | undefined;
                image?: string | null | undefined;
            };
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    add(userId: string, dto: AddToCartDto): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            productId: string;
            quantity: number;
            product: {
                name: string;
                price: number;
                description?: string | null | undefined;
                image?: string | null | undefined;
            };
        }[];
        createdAt: string;
        updatedAt: string;
    } | null>;
    update(userId: string, dto: UpdateCartItemDto): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            productId: string;
            quantity: number;
            product: {
                name: string;
                price: number;
                description?: string | null | undefined;
                image?: string | null | undefined;
            };
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    remove(userId: string, itemId: string): Promise<{
        id: string;
        userId: string;
        items: {
            id: string;
            productId: string;
            quantity: number;
            product: {
                name: string;
                price: number;
                description?: string | null | undefined;
                image?: string | null | undefined;
            };
        }[];
        createdAt: string;
        updatedAt: string;
    }>;
    clear(userId: string): Promise<{
        message: string;
    }>;
    verifyCart(userId: string): Promise<VerifiedCartResponse>;
}
