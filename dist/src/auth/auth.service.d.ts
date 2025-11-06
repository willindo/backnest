import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { Response } from 'express';
import { RegisterDto } from './dto';
import { MailerService } from '../common/mailer/mailer.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly mailer;
    constructor(prisma: PrismaService, jwt: JwtService, mailer: MailerService);
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
        token: string;
        user: any;
    }>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        verificationToken: string | null;
        password: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        verificationExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(user: any, res: Response, opts?: {
        skipVerifyCheck?: boolean;
    }): Promise<{
        message: string;
        token: string;
        user: any;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
