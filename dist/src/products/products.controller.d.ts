import { CreateProductDto, UpdateProductDto } from './dto';
export declare class ProductsController {
    findAll(): string;
    findOne(id: string): string;
    create(dto: CreateProductDto): string;
    update(id: string, dto: UpdateProductDto): string;
    remove(id: string): string;
}
