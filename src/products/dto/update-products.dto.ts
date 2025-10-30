import { UpdateProductSchema } from '../schemas/product.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
