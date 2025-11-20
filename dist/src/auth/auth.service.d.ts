import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { Response } from 'express';
import { RegisterDto } from './dto';
import { MailerService } from '../common/mailer/mailer.service';
import { EmailValidationService } from '../common/email-validation/email-validation.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly mailer;
    private readonly emailValidator;
    constructor(prisma: PrismaService, jwt: JwtService, mailer: MailerService, emailValidator: EmailValidationService);
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
    }>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
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
