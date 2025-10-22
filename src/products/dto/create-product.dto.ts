import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Size } from '@prisma/client';

class ProductSizeInput {
  @IsEnum(Size)
  size!: Size;

  @IsNumber()
  quantity!: number;
}

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductSizeInput)
  sizes?: ProductSizeInput[];
}
