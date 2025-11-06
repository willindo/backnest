import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Response, CookieOptions } from 'express';
import { RegisterDto, LoginDto } from './dto';
import { MailerService } from '../common/mailer/mailer.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
  ) {}

  // ------------------- REGISTER -------------------
  async register(dto: RegisterDto, res: Response) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashed,
        name: dto.name,
        isVerified: false,
        verificationToken: token,
        verificationExpiry: expiry,
      },
    });

    // Send verification email (non-blocking)
    this.mailer.sendVerificationEmail(user.email, token).catch(console.error);

    // Auto-login after registration
    return this.login(user, res, { skipVerifyCheck: true });
  }

  // ------------------- LOGIN -------------------
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: any, res: Response, opts?: { skipVerifyCheck?: boolean }) {
    const payload = { sub: user.id, email: user.email };
    const signOptions: JwtSignOptions = {
      secret: process.env.JWT_SECRET || 'supersecret',
    };

    const token = this.jwt.sign(payload, signOptions);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('auth_token', token, cookieOptions);

    const { password, verificationToken, verificationExpiry, ...safeUser } =
      user;
    return {
      message: 'Login successful',
      token,
      user: {
        ...safeUser,
        needsVerification: !user.isVerified,
      },
    };
  }

  // ------------------- VERIFY EMAIL -------------------
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return { message: 'Email verified successfully. You may now log in.' };
  }

  // ------------------- RESEND VERIFICATION -------------------
  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user)
      throw new BadRequestException('No account found with that email');
    if (user.isVerified)
      throw new BadRequestException('Email already verified');

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationExpiry: expiry },
    });

    await this.mailer.sendVerificationEmail(user.email, token);

    return { message: 'Verification email resent. Please check your inbox.' };
  }

  // ------------------- LOGOUT -------------------
  async logout(res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
