import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client'; // ✅ allowed import
import { CreateProductSizeDto } from './create-product-size.dto'; // ✅ local import

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock!: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeDto)
  sizes?: CreateProductSizeDto[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;
}
