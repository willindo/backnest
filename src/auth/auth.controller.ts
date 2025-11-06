// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // ---------- REGISTER ----------
  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.register(dto, res);
  }

  // ---------- LOGIN ----------
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login(user, res);
  }

  // ---------- AUTH/ME ----------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    // The JwtStrategy already attached the user record to req.user
    const user = req.user as any;
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  // ---------- LOGOUT ----------
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.auth.logout(res);
  }

  // ---------- VERIFY EMAIL ----------
  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Missing token');
    return this.auth.verifyEmail(token);
  }

  // ---------- RESEND ----------
  @Public()
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email required');
    return this.auth.resendVerification(email);
  }
}
