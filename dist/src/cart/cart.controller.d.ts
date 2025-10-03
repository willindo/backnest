import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    findCart(userId: string): Promise<{
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
    }>;
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
}
