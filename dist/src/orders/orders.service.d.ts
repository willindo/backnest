import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(payload: CreateOrderDto): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        id: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    findAll(): Promise<({
        items: {
            id: string;
            productId: string;
            quantity: number;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        id: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    findOne(id: string): Promise<{
        items: {
            id: string;
            productId: string;
            quantity: number;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        id: string;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
