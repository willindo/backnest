import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderInput } from './schemas/create-order.schema';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private calculateTotal;
    createOrderFromPayload(userId: string, payload: CreateOrderInput): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        userId: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        addressId: string | null;
    }>;
    getOrderById(orderId: string): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                categoryId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                images: string[];
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        userId: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        addressId: string | null;
    }>;
    listForUser(userId: string): Promise<({
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                categoryId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                images: string[];
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        userId: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        addressId: string | null;
    })[]>;
    cancelOrder(orderId: string): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        userId: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        addressId: string | null;
    }>;
}
