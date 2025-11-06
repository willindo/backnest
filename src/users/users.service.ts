import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 GET /users with pagination & optional role filter
  async findAll(
    page = 1,
    limit = 20,
    role?: 'ADMIN' | 'CUSTOMER', // now matches mapped type
  ) {
    const skip = (page - 1) * limit;
    const whereClause = role ? { role } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { ...whereClause },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { ...whereClause } }),
    ]);

    const users = data.map(({ password, ...rest }) => rest);

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  // 🔹 GET /users/:id
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    const { password, ...rest } = user;
    return rest;
  }

  // 🔹 POST /users
  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...dto,
          password: hashedPassword,
          role: dto.role ?? 'CUSTOMER',
        },
      });
      const { password, ...rest } = user;
      return rest;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // 🔹 PUT /users/:id
  async update(id: string, dto: UpdateUserDto) {
    let updateData = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      const { password, ...rest } = user;
      return rest;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw error;
    }
  }

  // 🔹 DELETE /users/:id
  async remove(id: string) {
    try {
      const user = await this.prisma.user.delete({ where: { id } });
      const { password, ...rest } = user;
      return rest;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw error;
    }
  }
}
