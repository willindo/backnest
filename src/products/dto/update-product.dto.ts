import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  category?: string;
}
