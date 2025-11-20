import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, role?: 'ADMIN' | 'CUSTOMER'): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: UpdateUserDto): Promise<{
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
