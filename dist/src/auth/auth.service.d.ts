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
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(user: any, res: Res): Promise<{
        message: string;
        user: any;
    }>;
    logout(res: Res): Promise<{
        message: string;
    }>;
}
