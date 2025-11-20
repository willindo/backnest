import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // If no user (JWT missing or invalid)
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // If user not verified
    if (!user.isVerified) {
      throw new ForbiddenException('Email not verified');
    }

    return true; // Allow if verified
  }
}
