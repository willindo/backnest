import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrder(userId: string, data: CreateOrderDto): Promise<{
        address: {
            id: string;
            userId: string | null;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        } | null;
        items: ({
            product: {
                name: string;
                images: string[];
            };
        } & {
            id: string;
            size: import(".prisma/client").$Enums.Size | null;
            quantity: number;
            productId: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        userId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        latestPaymentId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getUserOrders(userId: string): Promise<({
        address: {
            id: string;
            userId: string | null;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        } | null;
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
            size: import(".prisma/client").$Enums.Size | null;
            quantity: number;
            productId: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        userId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        latestPaymentId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getOrderById(orderId: string): Promise<({
        address: {
            id: string;
            userId: string | null;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        } | null;
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
            size: import(".prisma/client").$Enums.Size | null;
            quantity: number;
            productId: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        userId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        latestPaymentId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
    getOrderByIdWithOwnership(orderId: string, userId: string): Promise<{
        address: {
            id: string;
            userId: string | null;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        } | null;
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
            size: import(".prisma/client").$Enums.Size | null;
            quantity: number;
            productId: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        userId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        latestPaymentId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getInvoiceData(orderId: string, userId: string): Promise<{
        invoiceNo: string;
        date: Date;
        customer: {
            name: string | undefined;
            address: string;
        };
        items: {
            product: string;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            subtotal: number;
        }[];
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        grandTotal: number;
    }>;
    getAllOrders(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            verificationToken: string | null;
            password: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            isVerified: boolean;
            verificationExpiry: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        items: {
            id: string;
            size: import(".prisma/client").$Enums.Size | null;
            quantity: number;
            productId: string;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        userId: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        latestPaymentId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getTrial(): Promise<{
        totalOrders: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        ordersByDate: {
            date: Date;
            orderCount: number;
            revenue: number | import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
    overView(): Promise<{
        date: string;
        total: number;
    }[]>;
}
