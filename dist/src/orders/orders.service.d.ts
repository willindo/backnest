import { PrismaService } from 'prisma/prisma.service';
import { OrderResponseDto } from './dto/order-response.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private mapOrderToDto;
    findAll(): Promise<OrderResponseDto[]>;
    findOne(id: string): Promise<OrderResponseDto>;
    checkout(userId: string): Promise<OrderResponseDto>;
}
