import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class OrderItemDto {
  @IsString()
  productId!: string; // match Prisma & frontend

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsInt()
  price?: number; // optional snapshot if frontend provides
}
