import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: Request): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findAll(page?: string, limit?: string, role?: string): Promise<{
        data: {
            id: string;
            email: string;
            phone: string | null;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, req: Request): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, req: Request): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
