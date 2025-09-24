import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string, password: string, name?: string) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashed, name },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  // Placeholder for JWT token generation
  async login(user: any) {
    // TODO: generate JWT token here
    return { message: 'Login successful', user };
  }
}
