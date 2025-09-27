import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    findCartByUser(userId: string): Promise<({
        items: ({
            product: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
                description: string | null;
                price: number;
                currency: string;
                stock: number;
                images: string[];
                sku: string | null;
            };
        } & {
            id: string;
            cartId: string;
            productId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    add(userId: string, dto: AddToCartDto): Promise<{
        id: string;
        cartId: string;
        productId: string;
        quantity: number;
    }>;
    update(userId: string, dto: UpdateCartItemDto): Promise<{
        id: string;
        cartId: string;
        productId: string;
        quantity: number;
    }>;
    remove(userId: string, productId: string): Promise<{
        id: string;
        cartId: string;
        productId: string;
        quantity: number;
    }>;
}
