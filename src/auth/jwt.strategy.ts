// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // ✅ 1. Check for cookie-based token
          if (req?.cookies?.auth_token) {
            return req.cookies.auth_token;
          }
          // ✅ 2. Fallback to Authorization header
          if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
          ) {
            return req.headers.authorization.split(' ')[1];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  async validate(payload: any) {
    // ✅ Validate against DB (to handle deleted/banned users)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid token or user missing');
    return user; // will become req.user
  }
}
