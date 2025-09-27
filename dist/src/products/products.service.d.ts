import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProductDto): Promise<ProductResponseDto>;
    findAll(skip?: number, take?: number): Promise<{
        data: ProductResponseDto[];
        total: number;
    }>;
    findOne(id: string): Promise<ProductResponseDto>;
    update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto>;
    remove(id: string): Promise<ProductResponseDto>;
    private mapToResponse;
}
