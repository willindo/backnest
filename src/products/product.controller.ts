// src/products/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductsService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() body: any) {
    // ✅ Runtime Zod validation
    const dto = CreateProductDto.parse(body);
    return this.productsService.create(dto);
  }

  @Get()
  async findAll(@Param('page') page?: string, @Param('limit') limit?: string) {
    const p = page ? parseInt(page) : 0;
    const l = limit ? parseInt(limit) : 10;
    return this.productsService.findAll(p, l);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const dto = UpdateProductDto.parse(body); // ✅ Zod validation
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
