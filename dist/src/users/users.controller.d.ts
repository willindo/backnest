import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersController {
    findAll(): string;
    findOne(id: string): string;
    create(dto: CreateUserDto): string;
    update(id: string, dto: UpdateUserDto): string;
    remove(id: string): string;
}
