import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from './auth.service';
import { MailerService } from 'src/common/mailer/mailer.service';
export declare class AuthController {
    private readonly auth;
    private readonly prisma;
    private readonly mailerService;
    constructor(auth: AuthService, prisma: PrismaService, mailerService: MailerService);
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
}
