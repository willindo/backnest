import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class UpdateCartItemDto {
  @IsString()
  productId!: string; // matches Prisma schema

  @IsString()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number; // must be integer ≥ 1

  @IsOptional()
  @IsString()
  note?: string; // optional note
}
