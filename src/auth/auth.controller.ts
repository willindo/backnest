// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // 🔹 Public endpoint — register new user + auto login
  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.register(dto);
    return this.auth.login(user, res); // auto-login for smoother UX
  }

  // 🔹 Public endpoint — manual login
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login(user, res);
  }

  // 🔹 Logout — clears cookie on client
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.auth.logout(res);
  }

  // 🔹 Authenticated endpoint — get logged-in user
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user as any;
    if (!user) throw new UnauthorizedException('Not authenticated');
    return { user };
  }
}
