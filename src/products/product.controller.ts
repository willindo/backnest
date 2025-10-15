// src/products/product.controller.ts
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
import { ProductsService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() body: unknown) {
    // ✅ Runtime Zod validation
    const dto = CreateProductDto.parse(body);
    return this.productsService.create(dto);
  }

  @Get()
  async findAll(@Query('page') page = '0', @Query('limit') limit = '10') {
    const p = parseInt(page as any, 10);
    const l = parseInt(limit as any, 10);
    return this.productsService.findAll(p, l);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() body: unknown) {
    const dto = UpdateProductDto.parse(body); // ✅ Zod validation
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
