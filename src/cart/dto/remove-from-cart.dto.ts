import { IsString } from 'class-validator';

export class RemoveFromCartDto {
  @IsString()
  productId!: string; // must match your Prisma schema (string)
}
