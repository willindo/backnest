import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(payload: CreateOrderDto): Promise<{
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
