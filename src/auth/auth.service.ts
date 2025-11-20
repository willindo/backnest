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
import { EmailValidationService } from '../common/email-validation/email-validation.service'; // ✅ added

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly emailValidator: EmailValidationService, // ✅ added
  ) {}

  // ------------------- REGISTER -------------------
  // src/auth/auth.service.ts
  async register(dto: RegisterDto, res: Response) {
    // 1️⃣ Validate email via Abstract API
    const isReal = await this.emailValidator.validate(dto.email);
    if (!isReal)
      throw new BadRequestException('Invalid or undeliverable email address.');

    const email = dto.email.toLowerCase();

    // 2️⃣ Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // Resend verification if still pending
        await this.resendVerification(email);
        throw new BadRequestException(
          'Account exists but not verified. Verification email resent.',
        );
      }
      throw new BadRequestException('Email already registered.');
    }

    // 3️⃣ Check if already pending verification
    const existingPending = await this.prisma.pendingVerification.findUnique({
      where: { email },
    });

    if (existingPending) {
      // Update token & expiry
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await this.prisma.pendingVerification.update({
        where: { email },
        data: { token, expiresAt },
      });
      await this.mailer.sendVerificationEmail(email, token);
      return { message: 'Verification email resent. Please check your inbox.' };
    }

    // 4️⃣ Create new pending verification record
    const hashed = await bcrypt.hash(dto.password, 10);
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.pendingVerification.create({
      data: {
        email,
        name: dto.name,
        password: hashed,
        token,
        expiresAt,
      },
    });

    await this.mailer.sendVerificationEmail(email, token);
    return { message: 'Verification email sent. Please check your inbox.' };
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
  // if (!opts?.skipVerifyCheck && !user.isVerified)
  //   throw new BadRequestException('Please verify your email before login');

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
    const pending = await this.prisma.pendingVerification.findUnique({
      where: { token },
    });

    if (!pending)
      throw new BadRequestException('Invalid or expired verification token.');

    if (pending.expiresAt < new Date()) {
      await this.prisma.pendingVerification.delete({
        where: { id: pending.id },
      });
      throw new BadRequestException(
        'Verification token expired. Please re-register.',
      );
    }

    // 1️⃣ Check again no user exists already
    const existing = await this.prisma.user.findUnique({
      where: { email: pending.email },
    });
    if (existing) {
      await this.prisma.pendingVerification.delete({
        where: { id: pending.id },
      });
      return { message: 'Email already verified. You may now log in.' }; // ✅ instead of throw
    }

    // 2️⃣ Create real user record
    await this.prisma.user.create({
      data: {
        email: pending.email,
        password: pending.password,
        name: pending.name,
        isVerified: true,
      },
    });

    // 3️⃣ Remove pending entry
    await this.prisma.pendingVerification.delete({ where: { id: pending.id } });

    return { message: 'Email verified successfully. You may now log in.' };
  }

  // ------------------- RESEND VERIFICATION -------------------
  async resendVerification(email: string) {
    const emailLower = email.toLowerCase();

    // 1️⃣ Check user already verified?
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (user && user.isVerified)
      throw new BadRequestException('Email already verified.');

    // 2️⃣ Check pending entry
    const pending = await this.prisma.pendingVerification.findUnique({
      where: { email: emailLower },
    });

    if (!pending)
      throw new BadRequestException(
        'No pending verification found for this email.',
      );

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.pendingVerification.update({
      where: { email: emailLower },
      data: { token, expiresAt },
    });

    await this.mailer.sendVerificationEmail(emailLower, token);
    return { message: 'Verification email resent successfully.' };
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
