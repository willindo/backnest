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
    cancelOrder(orderId: string): Promise<{
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
