import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderInput } from './schemas/create-order.schema';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private calculateTotal;
    createOrderFromPayload(userId: string, payload: CreateOrderInput): Promise<{
        items: {
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        latestPaymentId: string | null;
    }>;
    getOrderById(orderId: string): Promise<{
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
            size: import(".prisma/client").$Enums.Size | null;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        latestPaymentId: string | null;
    }>;
    listForUser(userId: string): Promise<({
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
            size: import(".prisma/client").$Enums.Size | null;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        latestPaymentId: string | null;
    })[]>;
    cancelOrder(orderId: string): Promise<{
        items: {
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        latestPaymentId: string | null;
    }>;
}
