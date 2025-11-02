import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(userId: string): Promise<({
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
                createdAt: Date;
                updatedAt: Date;
                slug: string | null;
                name: string;
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
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            size: import(".prisma/client").$Enums.Size | null;
            orderId: string;
        })[];
    } & {
        id: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string | null;
    })[]>;
    findOne(id: string, userId: string): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                slug: string | null;
                name: string;
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
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            size: import(".prisma/client").$Enums.Size | null;
            orderId: string;
        })[];
    } & {
        id: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string | null;
    }>;
    create(userId: string, dto: CreateOrderDto): Promise<{
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
            productId: string;
            quantity: number;
            priceAtPurchase: import("@prisma/client/runtime/library").Decimal;
            size: import(".prisma/client").$Enums.Size | null;
            orderId: string;
        })[];
    } & {
        id: string;
        latestPaymentId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string | null;
    }>;
    generateInvoice(id: string, userId: string): Promise<{
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
}
