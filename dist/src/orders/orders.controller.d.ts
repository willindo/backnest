import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, body: any): Promise<{
        id: string;
        total: number;
        currency: string;
    }>;
    getOrder(id: string): Promise<{
        items: ({
            product: {
                price: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                stock: number;
                images: string[];
                categoryId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        address: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    }>;
    listOrders(req: any): Promise<({
        items: ({
            product: {
                price: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                stock: number;
                images: string[];
                categoryId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
            };
        } & {
            productId: string;
            quantity: number;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        address: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    })[]>;
    cancelOrder(id: string): Promise<{
        items: {
            productId: string;
            quantity: number;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        address: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentId: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    }>;
}
