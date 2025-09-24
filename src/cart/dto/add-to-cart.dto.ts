import { IsInt, Min, IsString } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId!: string; // must be a string (matches your Prisma schema)

  @IsInt()
  @Min(1)
  quantity!: number; // must be integer ≥ 1
}
