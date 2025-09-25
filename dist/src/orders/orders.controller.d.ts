import { CreateOrderDto } from './dto';
export declare class OrdersController {
    findAll(): string;
    findOne(id: string): string;
    create(dto: CreateOrderDto): string;
}
