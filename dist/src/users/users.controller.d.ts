import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: Request): Promise<{
        user: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string | null;
            isVerified: boolean;
            verificationToken: string | null;
            verificationExpiry: Date | null;
        };
    }>;
    findAll(page?: string, limit?: string, role?: string): Promise<{
        data: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string | null;
            isVerified: boolean;
            verificationToken: string | null;
            verificationExpiry: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, req: Request): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
    }>;
    update(id: string, dto: UpdateUserDto, req: Request): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
    }>;
}
