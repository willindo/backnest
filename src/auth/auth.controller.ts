import {
  Query,
  BadRequestException,
  Controller,
  Get,
  Body,
  Post,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuthService } from './auth.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { randomBytes } from 'crypto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  // ...existing endpoints

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token missing');

    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      throw new BadRequestException('Token expired');
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
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new BadRequestException('No account found with that email');
    if (user.isVerified)
      throw new BadRequestException('Email is already verified');

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationExpiry: expiry },
    });

    await this.mailerService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email resent. Please check your inbox.' };
  }
}
