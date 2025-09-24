import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  role?: 'ADMIN' | 'CUSTOMER';
}
