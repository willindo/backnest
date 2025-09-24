import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return 'Get all users';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `Get user ${id}`;
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return `Create user: ${dto.email}`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return `Update user ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `Delete user ${id}`;
  }
}
