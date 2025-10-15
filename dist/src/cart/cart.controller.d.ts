import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    findCart(req: any): Promise<{
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
    add(req: any, dto: AddToCartDto): Promise<{
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
    update(req: any, dto: UpdateCartItemDto): Promise<{
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
    remove(req: any, itemId: string): Promise<{
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
    clear(req: any): Promise<{
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
    verify(req: any): Promise<import("./types/verify-cart.types").VerifiedCartResponse>;
}
