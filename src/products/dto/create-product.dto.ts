// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string; // <-- note the !

  @IsOptional()
  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  sku?: string;
}
