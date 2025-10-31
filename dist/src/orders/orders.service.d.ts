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
        currency: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
                price: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string | null;
                description: string | null;
                stock: number;
                categoryId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                images: string[];
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
        currency: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
                price: import("@prisma/client/runtime/library").Decimal;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string | null;
                description: string | null;
                stock: number;
                categoryId: string | null;
                gender: import(".prisma/client").$Enums.Gender | null;
                images: string[];
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
        currency: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
            productId: string;
            quantity: number;
            size: import(".prisma/client").$Enums.Size | null;
            id: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        currency: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
