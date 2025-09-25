import { PrismaService } from 'prisma/prisma.service';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        items: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            price: number;
            orderId: string;
        })[];
    } & {
        id: string;
        userId: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<({
        items: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            price: number;
            orderId: string;
        })[];
    } & {
        id: string;
        userId: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    checkout(userId: string): Promise<{
        items: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: string;
            productId: string;
            quantity: number;
            price: number;
            orderId: string;
        })[];
    } & {
        id: string;
        userId: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
    }>;
}
