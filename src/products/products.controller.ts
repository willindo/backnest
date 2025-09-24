import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  @Get()
  findAll() {
    return 'Get all products';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `Get product ${id}`;
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return `Create product: ${dto.name}`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return `Update product ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `Delete product ${id}`;
  }
}
