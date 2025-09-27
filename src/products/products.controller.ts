import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ✅ GET /products?page=0&limit=20
  @Get()
  async findAll(
    @Query('page') page = '0',
    @Query('limit') limit = '20',
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    const skip = +page * +limit;
    const take = +limit;
    return this.productsService.findAll(skip, take);
  }

  // ✅ GET /products/:id
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  // ✅ POST /products
  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }

  // ✅ PUT /products/:id
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto);
  }

  // ✅ DELETE /products/:id
  @Delete(':id')
  remove(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.remove(id);
  }
}
