import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(body: unknown): Promise<{
        items: {
            productId: string;
            quantity: number;
            id: string;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        userId: string;
        id: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        items: {
            productId: string;
            quantity: number;
            id: string;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        userId: string;
        id: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        items: {
            productId: string;
            quantity: number;
            id: string;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        userId: string;
        id: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
