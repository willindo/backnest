import { IsInt, IsString, Min } from 'class-validator';

export class OrderItemDto {
  @IsString()
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}
