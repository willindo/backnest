import { CreateProductSchema } from '../schemas/product.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
