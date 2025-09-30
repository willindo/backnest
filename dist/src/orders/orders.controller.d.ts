import { OrdersService } from './orders.service';
import { OrderResponseDto } from './dto/order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
interface AuthRequest extends Request {
    user: {
        id: string;
    };
}
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    findAll(): Promise<OrderResponseDto[]>;
    findOne(id: string): Promise<OrderResponseDto>;
    create(req: AuthRequest, dto: CreateOrderDto): Promise<OrderResponseDto>;
}
export {};
