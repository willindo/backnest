import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { Response as Res } from 'express';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        password: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        password: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(user: any, res: Res): Promise<{
        message: string;
        token: string;
        user: any;
    }>;
    logout(res: Res): Promise<{
        message: string;
    }>;
}
