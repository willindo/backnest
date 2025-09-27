import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductResponseDto } from './dto/product-response.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(page?: string, limit?: string): Promise<{
        data: ProductResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<ProductResponseDto>;
    create(dto: CreateProductDto): Promise<ProductResponseDto>;
    update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto>;
    remove(id: string): Promise<ProductResponseDto>;
}
