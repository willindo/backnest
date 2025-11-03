import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, role?: 'ADMIN' | 'CUSTOMER'): Promise<{
        data: {
            id: string;
            email: string;
            phone: string | null;
            verificationToken: string | null;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            isVerified: boolean;
            verificationExpiry: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        verificationToken: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        verificationExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        verificationToken: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        verificationExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        verificationToken: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        verificationExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        verificationToken: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        verificationExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
