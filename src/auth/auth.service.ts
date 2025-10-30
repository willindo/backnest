// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Response as Res, CookieOptions } from 'express';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // 🔹 Check user credentials
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  // 🔹 Register user
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
      },
    });

    return user;
  }

  // 🔹 Login — issue JWT and set secure cookie
  async login(user: any, res: Res) {
    const payload = { sub: user.id, email: user.email };
    const isProd = process.env.NODE_ENV === 'production';
    const signOptions: JwtSignOptions = {
      secret: process.env.JWT_SECRET || 'supersecret',
      // expiresIn: process.env.JWT_EXPIRES_IN || (isProd ? "1d" : "7d"),
      // expiresIn: process.env.JWT_EXPIRES_IN
      //   ? parseInt(process.env.JWT_EXPIRES_IN)
      //   : 7 * 24 * 60 * 60,
    };

    const token = this.jwt.sign(payload, signOptions);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('auth_token', token, cookieOptions);

    const { password, ...safeUser } = user;
    return {
      message: 'Login successful',
      token,
      user: safeUser,
    };
  }

  // 🔹 Logout — clear cookie
  async logout(res: Res) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
