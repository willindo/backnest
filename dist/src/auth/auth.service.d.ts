import { PrismaService } from 'prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    register(email: string, password: string, name?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(user: any): Promise<{
        message: string;
        user: any;
    }>;
}
