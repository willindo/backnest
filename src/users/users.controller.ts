import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ current user
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as any;
    return { user: await this.usersService.findOne(user.id) };
  }

  // ✅ only admin can list users
  @Get()
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: string,
  ) {
    const roleUnion =
      role === 'ADMIN' ? 'ADMIN' : role === 'CUSTOMER' ? 'CUSTOMER' : undefined;
    return this.usersService.findAll(+page, +limit, roleUnion);
  }

  // ✅ admin can view anyone, customer only self
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    if (user.role !== 'ADMIN' && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findOne(id);
  }

  // ✅ admin only
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // ✅ admin or self
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    if (user.role !== 'ADMIN' && user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.update(id, dto);
  }

  // ✅ admin only
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
