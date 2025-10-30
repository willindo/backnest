import { IsEnum, IsNumber, Min } from 'class-validator';
import { Size } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductSizeDto {
  @IsEnum(Size)
  size!: Size;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity!: number;
}
